<?php

namespace App\Services;

use App\Models\AdminUpload;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LessonMaterial;
use App\Models\Module;
use App\Models\ModuleResource;
use App\Models\Program;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Models\UserModuleProgress;
use App\Support\LmsMeta;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Domain queries and serializers for modular LMS API endpoints (no combined bootstrap payload).
 */
class LmsCatalogService
{
    public function __construct(
        protected string $actorPublicUid = 'learner-01'
    ) {
        $this->actorPublicUid = (string) config('lms.actor_public_uid', $this->actorPublicUid);
    }

    public function resolveActor(): User
    {
        return User::query()
            ->with(['lmsProfile.program', 'badges'])
            ->where('public_uid', $this->actorPublicUid)
            ->firstOrFail();
    }

    public function meta(): array
    {
        return [
            'todayLabel' => now()->format('M j, Y'),
            'leaderboardPeriods' => LmsMeta::LEADERBOARD_PERIODS,
            'learningFlowSteps' => LmsMeta::LEARNING_FLOW_STEPS,
        ];
    }

    public function userPayload(User $user): array
    {
        return $this->formatActor($user);
    }

    /** @return array<int, array<string, mixed>> */
    public function programs(): array
    {
        return Program::query()->orderBy('title')->get()
            ->map(fn (Program $p) => $this->formatProgram($p))
            ->all();
    }

    /**
     * @return array{data: array<int, array<string, mixed>>, meta: array<string, int>}
     */
    public function coursesPaginated(User $user, int $page, int $perPage): array
    {
        $completedMods = UserModuleProgress::query()
            ->where('user_id', $user->id)
            ->where('progress_percent', '>=', 100)
            ->pluck('module_id');

        /** @var LengthAwarePaginator $paginator */
        $paginator = Course::query()
            ->with([
                'tags',
                'subjects',
                'program',
                'nextModule',
                'modules',
            ])
            ->orderBy('title')
            ->paginate($perPage, ['*'], 'page', $page);

        $data = $paginator->getCollection()
            ->map(fn (Course $c) => $this->formatCourse($c, $user, $completedMods))
            ->values()
            ->all();

        return [
            'data' => $data,
            'meta' => [
                'page' => $paginator->currentPage(),
                'limit' => $paginator->perPage(),
                'total' => $paginator->total(),
                'lastPage' => $paginator->lastPage(),
            ],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    public function enrollmentsForUser(User $user): array
    {
        return Enrollment::query()
            ->with('course')
            ->where('user_id', $user->id)
            ->orderByDesc('submitted_at')
            ->get()
            ->map(fn (Enrollment $e) => $this->formatEnrollment($e))
            ->all();
    }

    /** @return array<int, array<string, mixed>> */
    public function modulesForCourse(User $user, string $coursePublicId): array
    {
        $course = Course::query()->where('public_id', $coursePublicId)->with([
            'modules.resources.lessonMaterials.moduleResource',
            'modules.moduleLessonMaterials.moduleResource',
            'modules.course',
        ])->firstOrFail();

        return $course->modules
            ->sortBy(fn ($m) => sprintf('%05d', $m->sort_order))
            ->values()
            ->map(fn ($m) => $this->formatModule($m, $user))
            ->all();
    }

    /**
     * @param  array<int, string>  $publicIds
     * @return array<int, array<string, mixed>>
     */
    public function modulesByPublicIds(User $user, array $publicIds): array
    {
        if ($publicIds === []) {
            return [];
        }

        $modules = Module::query()
            ->whereIn('public_id', $publicIds)
            ->with([
                'resources.lessonMaterials.moduleResource',
                'moduleLessonMaterials.moduleResource',
                'course',
            ])
            ->get()
            ->sortBy(fn ($m) => array_search($m->public_id, $publicIds, true))
            ->values();

        return $modules->map(fn ($m) => $this->formatModule($m, $user))->all();
    }

    /** @return array<int, array<string, mixed>> */
    public function quizzesForModuleFilter(User $user, ?string $modulePublicId): array
    {
        $q = Quiz::query()->with(['course', 'module']);

        if ($modulePublicId) {
            $module = Module::query()->where('public_id', $modulePublicId)->firstOrFail();
            $q->where('module_id', $module->id);
        }

        return $q->orderBy('title')->get()
            ->map(fn (Quiz $quiz) => $this->formatQuiz($quiz, $user))
            ->all();
    }

    /** @return array<int, array<string, mixed>> */
    public function quizResultsForUser(User $target): array
    {
        return QuizAttempt::query()
            ->with('quiz')
            ->where('user_id', $target->id)
            ->orderByDesc('attempted_on')
            ->get()
            ->map(fn (QuizAttempt $a) => $this->formatQuizAttempt($a))
            ->all();
    }

    /** @return array<int, array<string, mixed>> */
    public function leaderboardForPeriod(string $period): array
    {
        if (! in_array($period, LmsMeta::LEADERBOARD_PERIODS, true)) {
            abort(422, 'Invalid leaderboard type.');
        }

        $cacheKey = 'lms:leaderboard:'.$period;

        return Cache::remember($cacheKey, now()->addSeconds(45), function () use ($period) {
            return LeaderboardEntry::query()
                ->where('period', $period)
                ->orderBy('rank_order')
                ->get()
                ->map(fn ($row) => [
                    'id' => 'rank-'.$row->id,
                    'name' => $row->display_name ?? $row->user?->name ?? 'Learner',
                    'program' => $row->program_code ?? '',
                    'score' => (int) $row->score,
                    'badge' => isset($row->badge_key) ? (LmsMeta::BADGE_LABELS[$row->badge_key] ?? $row->badge_key) : null,
                ])
                ->values()
                ->all();
        });
    }

    public function analyticsForUser(User $user): array
    {
        $cacheKey = 'lms:analytics:'.$user->id;

        return Cache::remember($cacheKey, now()->addSeconds(45), function () use ($user) {
            return $this->buildAnalytics($user);
        });
    }

    public function adminPayload(): array
    {
        return $this->formatAdmin();
    }

    public static function bustUserAnalyticsCache(int $userId): void
    {
        Cache::forget('lms:analytics:'.$userId);
    }

    public static function bustLeaderboardCache(): void
    {
        foreach (LmsMeta::LEADERBOARD_PERIODS as $period) {
            Cache::forget('lms:leaderboard:'.$period);
        }
    }

    protected function formatActor(User $user): array
    {
        $profile = $user->lmsProfile;
        $badges = $user->badges->map(fn ($b) => $b->badge_label ?? (LmsMeta::BADGE_LABELS[$b->badge_key] ?? $b->badge_key))->all();

        return [
            'id' => $user->public_uid,
            'displayName' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'activeProgram' => $profile?->program?->code ?? 'CE',
            'joinedAt' => optional($profile?->joined_at)->format('Y-m-d') ?? $user->created_at->format('Y-m-d'),
            'streak' => (int) ($profile?->streak_days ?? 0),
            'badges' => $badges,
            'watermarkName' => $profile?->watermark_name ?? $user->name,
            'sessionWarning' => (bool) ($profile?->session_warning ?? false),
        ];
    }

    protected function formatProgram(Program $p): array
    {
        return [
            'id' => $p->public_id,
            'code' => $p->code,
            'title' => $p->title,
            'description' => $p->description,
        ];
    }

    /**
     * Modules used for learner-facing counts (prefer visible-only; fallback to all if none visible).
     *
     * @return Collection<int, Module>
     */
    protected function modulesForCourseStats(Course $course): Collection
    {
        $visible = $course->modules->filter(fn (Module $m) => (bool) $m->is_visible)->values();

        return $visible->isNotEmpty() ? $visible : $course->modules;
    }

    /**
     * Mean of learner progress_percent (0–100) across the given modules.
     */
    protected function averageModuleProgressPercent(Collection $modulesStat, User $user): int
    {
        $n = $modulesStat->count();
        if ($n === 0) {
            return 0;
        }

        $moduleIds = $modulesStat->pluck('id');
        $byModule = UserModuleProgress::query()
            ->where('user_id', $user->id)
            ->whereIn('module_id', $moduleIds)
            ->get()
            ->keyBy('module_id');

        $sum = 0;
        foreach ($modulesStat as $m) {
            $sum += (int) ($byModule->get($m->id)?->progress_percent ?? 0);
        }

        return (int) round($sum / $n);
    }

    /**
     * Average of each quiz's best score for this user on this course's quizzes (null when no attempts).
     * Only quizzes tied to stats modules are included once module ids exist.
     */
    protected function averageQuizBestScorePercent(Course $course, User $user, Collection $modulesStat): ?int
    {
        $visibleModuleDbIds = $modulesStat->pluck('id');
        $query = Quiz::query()->where('course_id', $course->id);

        if ($visibleModuleDbIds->isNotEmpty()) {
            $query->where(function ($q) use ($visibleModuleDbIds) {
                $q->whereIn('module_id', $visibleModuleDbIds)->orWhereNull('module_id');
            });
        }

        $quizIds = $query->pluck('id');

        if ($quizIds->isEmpty()) {
            return null;
        }

        $bests = [];
        foreach ($quizIds as $quizId) {
            $best = QuizAttempt::query()
                ->where('user_id', $user->id)
                ->where('quiz_id', $quizId)
                ->max('score');

            if ($best !== null) {
                $bests[] = (int) $best;
            }
        }

        return $bests === []
            ? null
            : (int) round(array_sum($bests) / count($bests));
    }

    /**
     * @param  array<string, mixed>|null  $raw  courses.marketing_json
     * @return array{paragraphs: array<int, string>, learningOutcomes: array<int, string>, audience: array<int, string>, faq: array<int, array{question: string, answer: string}>, notices: array<int, string>, noticeHeading: string|null, bannerImageUrl: string|null}
     */
    protected function formatMarketingPayload(?array $raw): array
    {
        $j = is_array($raw) ? $raw : [];

        $banner = $j['bannerImageUrl'] ?? $j['heroImageUrl'] ?? null;
        $bannerTrimmed = null;
        if (is_string($banner) && trim($banner) !== '') {
            $bannerTrimmed = trim($banner);
        }

        return [
            'paragraphs' => $this->normalizeStringListField($j['paragraphs'] ?? []),
            'learningOutcomes' => $this->normalizeStringListField($j['learningOutcomes'] ?? $j['learn'] ?? []),
            'audience' => $this->normalizeStringListField($j['audience'] ?? []),
            'faq' => $this->normalizeFaqListField($j['faq'] ?? $j['faqs'] ?? []),
            'notices' => $this->normalizeStringListField($j['notices'] ?? []),
            'noticeHeading' => isset($j['noticeHeading']) && is_string($j['noticeHeading']) && trim($j['noticeHeading']) !== ''
                ? trim($j['noticeHeading'])
                : null,
            'bannerImageUrl' => $bannerTrimmed,
        ];
    }

    /**
     * @param  mixed  $value
     * @return array<int, string>
     */
    protected function normalizeStringListField($value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $out = [];

        foreach ($value as $item) {
            $s = is_string($item) ? trim($item) : (is_scalar($item) ? trim((string) $item) : '');
            if ($s !== '') {
                $out[] = $s;
            }
        }

        return $out;
    }

    /**
     * @param  mixed  $value
     * @return array<int, array{question: string, answer: string}>
     */
    protected function normalizeFaqListField($value): array
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

            if ($q === '' && $a === '') {
                continue;
            }

            $out[] = ['question' => $q, 'answer' => $a];
        }

        return $out;
    }

    /**
     * @param  \Illuminate\Support\Collection|array  $completedModuleIds
     */
    public function formatCourse(Course $c, User $user, $completedModuleIds): array
    {
        $modulesStat = $this->modulesForCourseStats($c);
        $moduleCount = $modulesStat->count();
        $completed = $modulesStat->whereIn('id', $completedModuleIds)->count();

        $averageModuleProgressPercent = $moduleCount === 0
            ? 0
            : $this->averageModuleProgressPercent($modulesStat, $user);

        $averageQuizScorePercent = $this->averageQuizBestScorePercent($c, $user, $modulesStat);

        return [
            'id' => $c->public_id,
            'slug' => $c->slug,
            'title' => $c->title,
            'programId' => $c->program->public_id,
            'programTitle' => $c->program?->title ?? '',
            'mentor' => $c->mentor_display_name,
            'description' => $c->description,
            'level' => $c->level,
            'totalModules' => $moduleCount ?: (int) $c->total_modules,
            'completedModules' => $completed,
            'averageModuleProgressPercent' => $averageModuleProgressPercent,
            'averageQuizScorePercent' => $averageQuizScorePercent,
            'marketing' => $this->formatMarketingPayload($c->marketing_json),
            'hours' => (int) $c->hours,
            'learners' => (int) $c->learners_count,
            'nextModuleId' => $c->nextModule?->public_id,
            'tags' => $c->tags->pluck('name')->all(),
            'subjects' => $c->subjects->pluck('name')->all(),
            'updatedAt' => $c->updated_at?->toIso8601String(),
            'status' => $c->is_published ? 'published' : 'draft',
            'isPublished' => (bool) $c->is_published,
            'averageRating' => $c->average_rating !== null ? round((float) $c->average_rating, 1) : null,
            ...($c->video_hours_label ? ['videoHoursLabel' => $c->video_hours_label] : []),
            ...($c->preview_completed ? ['previewCompleted' => true] : []),
        ];
    }

    public function modulePayloadForUser(Module $m, User $user): array
    {
        return $this->formatModule($m, $user);
    }

    protected function formatModule($m, User $user): array
    {
        $progress = UserModuleProgress::query()
            ->where('user_id', $user->id)
            ->where('module_id', $m->id)
            ->first();

        return [
            'id' => $m->public_id,
            'courseId' => $m->course->public_id,
            'title' => $m->title,
            'subject' => $m->subject,
            'topic' => $m->topic,
            'subtopic' => $m->subtopic,
            'type' => $m->learning_flow_step,
            'duration' => $m->duration_label,
            'lastPosition' => $progress?->last_position_label ?? '00:00',
            'progress' => (int) ($progress?->progress_percent ?? 0),
            'visible' => $m->is_visible,
            'streamingOnly' => $m->streaming_only,
            'updatedAt' => $m->updated_at?->toIso8601String(),
            'resources' => $m->resources->pluck('format')->all(),
            'resourceRows' => $m->resources
                ->map(fn (ModuleResource $r) => [
                    'id' => $r->public_id,
                    'format' => $r->format,
                    'isStandalone' => (bool) $r->is_standalone_lesson,
                ])
                ->values()
                ->all(),
            'standaloneLessons' => $m->resources
                ->filter(fn (ModuleResource $r) => (bool) $r->is_standalone_lesson)
                ->sortBy(fn (ModuleResource $r) => sprintf('%05d-%09d', (int) $r->sort_order, $r->id))
                ->values()
                ->map(fn (ModuleResource $r) => [
                    'id' => $r->public_id,
                    'title' => $r->title !== null && trim((string) $r->title) !== '' ? trim((string) $r->title) : 'Lesson',
                    'kind' => $r->lesson_kind,
                    /** @deprecated Use bodyHtml — kept synced as plain excerpt for storefronts */
                    'summary' => $r->summary,
                    'excerptHtml' => $r->excerpt_html,
                    'bodyHtml' => filled($r->body_html ?? null) ? $r->body_html : ($r->summary ?? ''),
                    'lessonMeta' => $r->lesson_meta_json ?? null,
                    'lessonMaterials' => $r->lessonMaterials
                        ->map(fn (LessonMaterial $f) => $this->formatLessonMaterial($f))
                        ->values()
                        ->all(),
                    'updatedAt' => $r->updated_at?->toIso8601String(),
                ])
                ->all(),
            'summary' => $m->summary,
            'excerptHtml' => $m->excerpt_html,
            'bodyHtml' => filled($m->body_html ?? null) ? $m->body_html : ($m->summary ?? ''),
            'lessonMeta' => $m->lesson_meta_json ?? null,
            'lessonMaterials' => $m->moduleLessonMaterials
                ->map(fn (LessonMaterial $f) => $this->formatLessonMaterial($f))
                ->values()
                ->all(),
        ];
    }

    protected function formatLessonMaterial(LessonMaterial $f): array
    {
        return [
            'id' => $f->public_id,
            'name' => $f->original_name,
            'mime' => $f->mime,
            'sizeBytes' => (int) $f->size_bytes,
            'moduleResourceId' => $f->moduleResource?->public_id,
        ];
    }

    public function authoringQuizPayload(Quiz $quiz, User $user): array
    {
        return $this->formatQuiz($quiz->loadMissing(['course', 'module']), $user);
    }

    /**
     * Stored under `settings_json` (merged with defaults for API output).
     *
     * @return array<string, mixed>
     */
    protected function quizAuthoringDefaults(): array
    {
        return [
            'timeUnit' => 'minutes',
            'quizStyle' => 'global',
            'randomizeQuestions' => false,
            'randomizeAnswers' => false,
            'showCorrectAnswer' => false,
            'quizAttemptHistory' => false,
            'retakeAfterPass' => false,
            'limitedRetakeAttempts' => false,
            'passingGrade' => 0,
            'pointsCutAfterRetake' => null,
        ];
    }

    /**
     * @param  array<string, mixed>|null  $stored
     * @return array<string, mixed>
     */
    protected function normalizeQuizAuthoringFromRow(Quiz $q, ?array $stored): array
    {
        $merged = array_merge($this->quizAuthoringDefaults(), is_array($stored) ? $stored : []);

        $timeUnit = (($merged['timeUnit'] ?? 'minutes') === 'hours') ? 'hours' : 'minutes';
        $merged['timeUnit'] = $timeUnit;

        $dm = max(0, (int) $q->duration_minutes);
        $displayDuration = $timeUnit === 'hours'
            ? (int) max(0, (int) round($dm / 60))
            : $dm;
        $merged['duration'] = $displayDuration;

        $pg = $merged['passingGrade'] ?? 0;
        $merged['passingGrade'] = max(0, min(100, (int) $pg));

        $pc = $merged['pointsCutAfterRetake'] ?? null;
        if ($pc === '' || $pc === false) {
            $merged['pointsCutAfterRetake'] = null;
        } elseif ($pc !== null) {
            $merged['pointsCutAfterRetake'] = max(0, min(100, (float) $pc));
        }

        return $merged;
    }

    protected function formatQuiz(Quiz $q, User $user): array
    {
        $attempts = QuizAttempt::query()
            ->where('user_id', $user->id)
            ->where('quiz_id', $q->id);

        $authoring = $this->normalizeQuizAuthoringFromRow(
            $q,
            is_array($q->settings_json) ? $q->settings_json : null
        );

        return [
            'id' => $q->public_id,
            'courseId' => $q->course->public_id,
            'moduleId' => $q->module?->public_id,
            'title' => $q->title,
            'durationMinutes' => (int) $q->duration_minutes,
            'attemptsAllowed' => (int) $q->attempts_allowed,
            'attemptsUsed' => (int) $attempts->count(),
            'questionCount' => (int) $q->question_count,
            'questionPoolCount' => (int) $q->question_pool_count,
            'bestScore' => (int) ($attempts->max('score') ?? 0),
            'shortDescription' => (string) ($q->description ?? ''),
            'lessonContentHtml' => (string) ($q->lesson_content_html ?? ''),
            'duration' => (int) ($authoring['duration'] ?? 0),
            'timeUnit' => (string) ($authoring['timeUnit'] ?? 'minutes'),
            'quizStyle' => (string) ($authoring['quizStyle'] ?? 'global'),
            'passingGrade' => (int) ($authoring['passingGrade'] ?? 0),
            'pointsCutAfterRetake' => $authoring['pointsCutAfterRetake'],
            'randomizeQuestions' => (bool) ($authoring['randomizeQuestions'] ?? false),
            'randomizeAnswers' => (bool) ($authoring['randomizeAnswers'] ?? false),
            'showCorrectAnswer' => (bool) ($authoring['showCorrectAnswer'] ?? false),
            'quizAttemptHistory' => (bool) ($authoring['quizAttemptHistory'] ?? false),
            'retakeAfterPass' => (bool) ($authoring['retakeAfterPass'] ?? false),
            'limitedRetakeAttempts' => (bool) ($authoring['limitedRetakeAttempts'] ?? false),
        ];
    }

    protected function formatQuizAttempt(QuizAttempt $a): array
    {
        return [
            'id' => $a->public_id,
            'quizId' => $a->quiz->public_id,
            'date' => $a->attempted_on->format('Y-m-d'),
            'score' => (int) $a->score,
            'durationUsed' => $a->duration_used_label,
            'correctAnswers' => (int) $a->correct_answers,
            'totalQuestions' => (int) $a->total_questions,
        ];
    }

    protected function formatEnrollment(Enrollment $e): array
    {
        return [
            'id' => $e->public_id,
            'courseId' => $e->course->public_id,
            'submittedAt' => optional($e->submitted_at)->format('Y-m-d'),
            'status' => $e->status,
        ];
    }

    protected function formatAdmin(): array
    {
        $users = User::query()->with('lmsProfile.program')->orderBy('name')->get()->map(function (User $u) {
            $prog = $u->lmsProfile?->program?->title ?? $u->lmsProfile?->program?->code ?? '';

            return [
                'id' => 'user-'.$u->id,
                'name' => $u->name,
                'role' => match ($u->role) {
                    'student' => 'Learner',
                    'instructor' => 'Instructor',
                    default => ucfirst($u->role),
                },
                'activeProgram' => $prog,
                'status' => 'Active',
            ];
        })->all();

        $uploads = AdminUpload::query()->orderBy('created_at', 'desc')->get()->map(fn ($u) => [
            'id' => $u->public_id,
            'title' => $u->title,
            'type' => $u->asset_type,
            'status' => $u->status,
        ])->all();

        return [
            'users' => $users,
            'uploads' => $uploads,
        ];
    }

    protected function buildAnalytics(User $user): array
    {
        $courses = Course::query()->with('modules')->get();
        $completed = 0;
        $total = 0;
        foreach ($courses as $course) {
            $n = $course->modules->count();
            $total += $n;
            $completed += UserModuleProgress::query()
                ->where('user_id', $user->id)
                ->whereIn('module_id', $course->modules->pluck('id'))
                ->where('progress_percent', '>=', 100)
                ->count();
        }

        $completionRate = $total > 0 ? (int) round(($completed / $total) * 100) : 0;

        return [
            'completedModules' => $completed,
            'totalModules' => $total,
            'completionRate' => $completionRate,
            'pendingModules' => max(0, $total - $completed),
            'strengths' => ['Hydraulics', 'Code Familiarity', 'Material Selection'],
            'weaknesses' => ['Open channel flow', 'Sanitary vent layouts', 'Heat treatment cycles'],
            'suggestedModuleIds' => ['module-hydraulics-practice', 'module-code-final-coaching', 'module-heat-treatment-refresher'],
        ];
    }
}
