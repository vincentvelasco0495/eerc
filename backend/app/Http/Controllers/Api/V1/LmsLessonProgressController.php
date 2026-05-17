<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Concerns\ResolvesLmsActor;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Module;
use App\Models\ModuleResource;
use App\Models\UserLessonProgress;
use App\Services\LmsCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LmsLessonProgressController extends Controller
{
    use ResolvesLmsActor;

    public function index(string $coursePublicId): JsonResponse
    {
        $user = $this->lmsActor();
        $course = Course::query()->where('public_id', $coursePublicId)->firstOrFail();

        $lessonKeys = UserLessonProgress::query()
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->pluck('lesson_key')
            ->map(fn ($k) => (string) $k)
            ->values()
            ->all();

        return response()->json(['data' => $lessonKeys]);
    }

    public function complete(Request $request, string $coursePublicId, LmsCatalogService $catalog): JsonResponse
    {
        $user = $this->lmsActor();
        $course = Course::query()->where('public_id', $coursePublicId)->firstOrFail();
        $validated = $request->validate([
            'lessonKey' => ['required', 'string', 'max:96'],
        ]);
        $lessonKey = trim((string) $validated['lessonKey']);

        if (! $this->lessonBelongsToCourse($course, $lessonKey)) {
            return response()->json(['message' => 'Lesson does not belong to this course.'], 422);
        }

        if ($catalog->isCurriculumItemLockedForUser($user, $course, $lessonKey)) {
            return response()->json(['message' => 'Complete earlier lessons before accessing this one.'], 403);
        }

        UserLessonProgress::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'lesson_key' => $lessonKey,
            ],
            [
                'course_id' => $course->id,
                'completed_at' => now(),
            ]
        );

        return response()->json(['ok' => true]);
    }

    private function lessonBelongsToCourse(Course $course, string $lessonKey): bool
    {
        if ($lessonKey === '') {
            return false;
        }

        if (str_ends_with($lessonKey, '-core')) {
            $modulePublicId = substr($lessonKey, 0, -5);

            return Module::query()
                ->where('public_id', $modulePublicId)
                ->where('course_id', $course->id)
                ->exists();
        }

        return ModuleResource::query()
            ->where('public_id', $lessonKey)
            ->where('is_standalone_lesson', true)
            ->whereIn('lesson_kind', ['document', 'video', 'stream', 'zoom'])
            ->whereHas('module', fn ($q) => $q->where('course_id', $course->id))
            ->exists();
    }
}
