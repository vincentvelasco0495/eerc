<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesLmsActor;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Program;
use App\Models\UserModuleProgress;
use App\Services\LmsCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LmsCourseController extends Controller
{
    use ResolvesLmsActor;

    public function index(Request $request, LmsCatalogService $catalog): JsonResponse
    {
        $page = max(1, (int) $request->query('page', 1));
        $limit = min(100, max(1, (int) $request->query('limit', 20)));

        $user = $this->lmsActor();
        $payload = $catalog->coursesPaginated($user, $page, $limit);

        return response()->json($payload);
    }

    /**
     * Create a new catalog course (instructor authoring). Program defaults to the first program
     * when `programId` is omitted. Slug is generated from the title and made unique.
     */
    public function store(Request $request, LmsCatalogService $catalog): JsonResponse
    {
        $user = $this->lmsActor();

        $validated = $request->validate([
            'title' => ['sometimes', 'nullable', 'string', 'max:512'],
            'programId' => ['sometimes', 'nullable', 'string', 'max:64'],
        ]);

        $title = isset($validated['title']) ? trim((string) $validated['title']) : '';
        if ($title === '') {
            $title = 'Untitled course';
        }

        $programHint = isset($validated['programId']) ? trim((string) $validated['programId']) : '';
        $program = Program::query()
            ->when($programHint !== '', fn ($q) => $q->where('public_id', $programHint))
            ->orderBy('id')
            ->first();

        if ($program === null) {
            $program = Program::query()->orderBy('id')->firstOrFail();
        }

        $baseSlug = Str::slug($title);
        if ($baseSlug === '') {
            $baseSlug = 'course';
        }

        $slug = $baseSlug;
        $n = 2;
        while (Course::query()->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$n;
            $n++;
        }

        $course = Course::query()->create([
            'public_id' => (string) Str::uuid(),
            'program_id' => $program->id,
            'slug' => $slug,
            'title' => $title,
            'mentor_display_name' => $user->name,
            'description' => null,
            'marketing_json' => [],
            'is_published' => false,
        ]);

        LmsCatalogService::bustUserAnalyticsCache($user->id);

        $completedMods = UserModuleProgress::query()
            ->where('user_id', $user->id)
            ->where('progress_percent', '>=', 100)
            ->pluck('module_id');

        $fresh = $course->fresh(['program', 'tags', 'subjects', 'nextModule', 'modules']);

        return response()->json([
            'data' => $catalog->formatCourse($fresh, $user, $completedMods),
        ], 201);
    }

    /** Partial update (`courses.description`, scalar fields, and merge into `courses.marketing_json`). */
    public function update(Request $request, string $publicId, LmsCatalogService $catalog): JsonResponse
    {
        $user = $this->lmsActor();

        /** @var Course $course */
        $course = Course::query()->where('public_id', $publicId)->firstOrFail();

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:512'],
            'description' => ['sometimes', 'nullable', 'string'],
            'mentor' => ['sometimes', 'nullable', 'string', 'max:191'],
            'level' => ['sometimes', 'nullable', 'string', 'max:64'],
            'hours' => ['sometimes', 'integer', 'min:0', 'max:65535'],
            'videoHoursLabel' => ['sometimes', 'nullable', 'string', 'max:191'],
            'marketing' => ['sometimes', 'array'],
            'isPublished' => ['sometimes', 'boolean'],
        ]);

        if (isset($validated['title'])) {
            $course->title = trim($validated['title']);
        }

        if (array_key_exists('description', $validated)) {
            $course->description = $validated['description'] !== null ? trim((string) $validated['description']) : null;
        }

        if (array_key_exists('mentor', $validated)) {
            $course->mentor_display_name = $validated['mentor'] !== null ? trim((string) $validated['mentor']) : null;
        }

        if (array_key_exists('level', $validated)) {
            $course->level = $validated['level'] !== null ? trim((string) $validated['level']) : null;
        }

        if (isset($validated['hours'])) {
            $course->hours = (int) $validated['hours'];
        }

        if (array_key_exists('videoHoursLabel', $validated)) {
            $course->video_hours_label = $validated['videoHoursLabel'] !== null
                ? trim((string) $validated['videoHoursLabel'])
                : null;
        }

        if (array_key_exists('isPublished', $validated)) {
            $course->is_published = (bool) $validated['isPublished'];
        }

        if (isset($validated['marketing']) && is_array($validated['marketing'])) {
            $incoming = $validated['marketing'];
            $base = $course->marketing_json ?? [];

            foreach (['paragraphs', 'learningOutcomes', 'audience', 'notices'] as $listKey) {
                if (array_key_exists($listKey, $incoming)) {
                    $base[$listKey] = self::sanitizeStringArray($incoming[$listKey]);
                }
            }

            if (array_key_exists('faq', $incoming)) {
                $base['faq'] = self::sanitizeFaqArray($incoming['faq']);
            }

            if (array_key_exists('noticeHeading', $incoming)) {
                $h = self::sanitizeOptionalString($incoming['noticeHeading']);
                if ($h === null || $h === '') {
                    unset($base['noticeHeading']);
                } else {
                    $base['noticeHeading'] = $h;
                }
            }

            if (array_key_exists('bannerImageUrl', $incoming)) {
                $u = self::sanitizeOptionalStringUrl($incoming['bannerImageUrl']);
                if ($u === null || $u === '') {
                    unset($base['bannerImageUrl']);
                } else {
                    $base['bannerImageUrl'] = $u;
                    unset($base['heroImageUrl']);
                }
            }

            if (array_key_exists('heroImageUrl', $incoming)) {
                $u = self::sanitizeOptionalStringUrl($incoming['heroImageUrl']);
                if ($u === null || $u === '') {
                    unset($base['heroImageUrl']);
                } else {
                    $base['heroImageUrl'] = $u;
                }
            }

            $course->marketing_json = $base;
        }

        $course->save();

        LmsCatalogService::bustUserAnalyticsCache($user->id);

        $completedMods = UserModuleProgress::query()
            ->where('user_id', $user->id)
            ->where('progress_percent', '>=', 100)
            ->pluck('module_id');

        $fresh = $course->fresh(['program', 'tags', 'subjects', 'nextModule', 'modules']);

        return response()->json([
            'data' => $catalog->formatCourse($fresh, $user, $completedMods),
        ]);
    }

    /**
     * @param  mixed  $value
     * @return array<int, string>
     */
    private static function sanitizeStringArray($value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $out = [];
        foreach ($value as $item) {
            $s = is_string($item) ? trim($item) : '';
            if ($s !== '') {
                $out[] = mb_substr($s, 0, 65000);
            }
        }

        return $out;
    }

    /** @param  mixed  $value */
    private static function sanitizeFaqArray($value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $out = [];
        foreach ($value as $row) {
            if (! is_array($row)) {
                continue;
            }

            $q = isset($row['question']) ? trim((string) $row['question']) : '';
            $a = isset($row['answer']) ? trim((string) $row['answer']) : '';

            $out[] = [
                'question' => mb_substr($q, 0, 2000),
                'answer' => mb_substr($a, 0, 65000),
            ];
        }

        return $out;
    }

    /** @param  mixed  $value */
    private static function sanitizeOptionalString($value): ?string
    {
        if ($value === null) {
            return null;
        }
        $s = trim((string) $value);

        return $s === '' ? null : mb_substr($s, 0, 2000);
    }

    /** @param  mixed  $value */
    private static function sanitizeOptionalStringUrl($value): ?string
    {
        $s = self::sanitizeOptionalString($value);
        if ($s === null || $s === '') {
            return null;
        }

        if (preg_match('#^https?://#i', $s)) {
            return mb_substr($s, 0, 2048);
        }

        if (str_starts_with($s, '/') && ! str_starts_with($s, '//')) {
            return mb_substr($s, 0, 2048);
        }

        return mb_substr($s, 0, 2048);
    }
}
