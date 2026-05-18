<?php

namespace App\Services;

use App\Models\AdminUpload;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LessonMaterial;
use App\Models\Module;
use App\Models\ModuleResource;
use App\Models\Program;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Student;
use App\Models\User;
use App\Models\UserLessonProgress;
use App\Models\UserModuleProgress;
use App\Support\LessonMetaSupport;
use App\Support\LmsMeta;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

/**
 * Domain queries and serializers for modular LMS API endpoints (no combined bootstrap payload).
 */
class LmsCatalogService
{
    /** @var array<string, array<string, bool>> */
    protected array $curriculumLockMapCache = [];

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
        $payload = $this->formatActor($user);
        $payload['pagePermissions'] = app(PagePermissionService::class)
            ->permissionsPayloadForRole((string) $user->role);

        return $payload;
    }

    /** @return array<int, array<string, mixed>> */
    public function programs(): array
    {
        return Program::query()->orderBy('title')->get()
            ->map(fn (Program $p) => $this->formatProgram($p))
            ->all();
    }

    /**
     * Paginated program catalog (admin list). Ordered by latest activity.
     *
     * @return array{data: array<int, array<string, mixed>>, meta: array<string, int>}
     */
    public function programsPaginated(int $page, int $perPage, ?string $search = null): array
    {
        $query = Program::query()
            ->select([
                'id',
                'public_id',
                'code',
                'slug',
                'title',
                'description',
                'status',
                'banner_path',
                'created_at',
                'updated_at',
            ])
            ->orderByDesc('updated_at')
            ->orderByDesc('id');

        $term = $search !== null ? trim($search) : '';
        if ($term !== '') {
            $like = '%'.addcslashes($term, '%_\\').'%';
            $query->where(function ($q) use ($like) {
                $q->where('title', 'like', $like)
                    ->orWhere('code', 'like', $like)
                    ->orWhere('slug', 'like', $like);
            });
        }

        /** @var LengthAwarePaginator<int, Program> $paginator */
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => $paginator->getCollection()
                ->map(fn (Program $p) => $this->formatProgram($p))
                ->values()
                ->all(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem() ?? 0,
                'to' => $paginator->lastItem() ?? 0,
            ],
        ];
    }

    public function programPayload(Program $program): array
    {
        return $this->formatProgram($program);
    }

    /**
     * Public stats for one program (safe for guests).
     *
     * @return array{programId: string, totalCourses: int, totalDurationHours: int, totalLectures: int, totalVideos: int, totalQuizzes: int}
     */
    public function programStats(string $programPublicId): array
    {
        /** @var Program $program */
        $program = Program::query()->where('public_id', $programPublicId)->firstOrFail();

        $courseIds = Course::query()
            ->where('program_id', $program->id)
            ->pluck('id');

        $totalCourses = (int) $courseIds->count();

        $totalDurationHours = (int) Course::query()
            ->whereIn('id', $courseIds)
            ->sum('hours');

        $moduleIds = Module::query()
            ->whereIn('course_id', $courseIds)
            ->pluck('id');

        $totalLectures = (int) $moduleIds->count();

        $totalQuizzes = (int) Quiz::query()
            ->whereIn('course_id', $courseIds)
            ->count();

        $totalVideos = (int) ModuleResource::query()
            ->whereIn('module_id', $moduleIds)
            ->where('format', 'Video')
            ->distinct('module_id')
            ->count('module_id');

        return [
            'programId' => $program->public_id,
            'totalCourses' => $totalCourses,
            'totalDurationHours' => $totalDurationHours,
            'totalLectures' => $totalLectures,
            'totalVideos' => $totalVideos,
            'totalQuizzes' => $totalQuizzes,
        ];
    }

    /**
     * Public aggregate stats for one course (safe for guests).
     *
     * @return array{courseId: string, totalDurationHours: int, totalLectures: int, totalVideos: int, totalQuizzes: int, level: string}
     */
    public function courseStats(string $coursePublicId): array
    {
        /** @var Course $course */
        $course = Course::query()
            ->with(['modules.resources'])
            ->where('public_id', $coursePublicId)
            ->firstOrFail();

        $modulesStat = $this->modulesForCourseStats($course);
        $moduleIds = $modulesStat->pluck('id');

        $totalQuizzes = (int) Quiz::query()
            ->where('course_id', $course->id)
            ->when($moduleIds->isNotEmpty(), function ($query) use ($moduleIds) {
                $query->where(function ($q) use ($moduleIds) {
                    $q->whereIn('module_id', $moduleIds)->orWhereNull('module_id');
                });
            })
            ->count();

        $totalVideos = (int) ModuleResource::query()
            ->whereIn('module_id', $moduleIds)
            ->where('format', 'Video')
            ->distinct('module_id')
            ->count('module_id');

        return [
            'courseId' => $course->public_id,
            'totalDurationHours' => (int) $course->hours,
            'totalLectures' => (int) $modulesStat->count(),
            'totalVideos' => $totalVideos,
            'totalQuizzes' => $totalQuizzes,
            'level' => (string) ($course->level ?? ''),
        ];
    }

    /**
     * @return array{data: array<int, array<string, mixed>>, meta: array<string, int>}
     */
    public function coursesPaginated(User $user, int $page, int $perPage, ?string $programHint = null): array
    {
        $completedMods = UserModuleProgress::query()
            ->where('user_id', $user->id)
            ->where('progress_percent', '>=', 100)
            ->pluck('module_id');

        $programHint = trim((string) ($programHint ?? ''));
        $programAliasMap = [
            'civil-engineering' => 'program-ce',
            'civil_engineering' => 'program-ce',
            'civil-engineing' => 'program-ce',
            'civil_engineing' => 'program-ce',
            'civilengineering' => 'program-ce',
            'ce' => 'program-ce',
            'master-plumbing' => 'program-plumbing',
            'master_plumbing' => 'program-plumbing',
            'masterplumbing' => 'program-plumbing',
            'mpl' => 'program-plumbing',
            'materials-engineering' => 'program-materials',
            'materials_engineering' => 'program-materials',
            'materialsengineering' => 'program-materials',
            'mse' => 'program-materials',
        ];
        $normalizedProgramHint = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $programHint) ?? '');
        $normalizedProgramHint = trim($normalizedProgramHint, '-');
        $resolvedProgramPublicId = $programAliasMap[$normalizedProgramHint] ?? null;

        /** @var LengthAwarePaginator $paginator */
        $paginator = Course::query()
            ->with([
                'tags',
                'subjects',
                'program',
                'nextModule',
                'modules',
            ])
            ->when($programHint !== '', function ($query) use ($programHint, $normalizedProgramHint, $resolvedProgramPublicId) {
                $query->whereHas('program', function ($programQuery) use ($programHint, $normalizedProgramHint, $resolvedProgramPublicId) {
                    $programQuery->where('public_id', $programHint)
                        ->orWhereRaw('LOWER(code) = ?', [strtolower($programHint)])
                        ->orWhereRaw('LOWER(slug) = ?', [strtolower($programHint)])
                        ->orWhereRaw('LOWER(title) = ?', [str_replace('-', ' ', $normalizedProgramHint)]);

                    if ($resolvedProgramPublicId !== null) {
                        $programQuery->orWhere('public_id', $resolvedProgramPublicId);
                    }
                });
            })
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
            ->with(['program', 'user.studentProfile'])
            ->where('user_id', $user->id)
            ->orderByDesc('submitted_at')
            ->get()
            ->map(fn (Enrollment $e) => $this->formatEnrollment($e))
            ->all();
    }

    /**
     * @return array{data: array<int, array<string, mixed>>, meta: array<string, int>}
     */
    public function enrollmentsPaginated(int $page, int $perPage, ?string $search = null, ?int $userId = null): array
    {
        $query = Enrollment::query()
            ->with(['program', 'user.studentProfile'])
            ->orderByDesc('submitted_at')
            ->orderByDesc('id');

        if ($userId !== null && $userId > 0) {
            $query->where('user_id', $userId);
        }

        $term = $search !== null ? trim($search) : '';
        if ($term !== '') {
            $like = '%'.addcslashes($term, '%_\\').'%';
            $query->where(function ($q) use ($like) {
                $q->where('public_id', 'like', $like)
                    ->orWhere('status', 'like', $like)
                    ->orWhereHas('user', function ($userQuery) use ($like) {
                        $userQuery->where('name', 'like', $like)
                            ->orWhere('email', 'like', $like)
                            ->orWhereHas('studentProfile', function ($studentQuery) use ($like) {
                                $studentQuery->where('phone_number', 'like', $like)
                                    ->orWhere('school_held', 'like', $like);
                            });
                    })
                    ->orWhereHas('program', function ($programQuery) use ($like) {
                        $programQuery->where('title', 'like', $like)
                            ->orWhere('code', 'like', $like)
                            ->orWhere('public_id', 'like', $like);
                    });
            });
        }

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => $paginator->getCollection()
                ->map(fn (Enrollment $e) => $this->formatEnrollment($e, true))
                ->values()
                ->all(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem() ?? 0,
                'to' => $paginator->lastItem() ?? 0,
            ],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    public function modulesForCourse(User $user, string $coursePublicId): array
    {
        $course = Course::query()->where('public_id', $coursePublicId)->with([
            'modules.resources.lessonMaterials.moduleResource',
            'modules.moduleLessonMaterials.moduleResource',
            'modules.course',
            'modules.quizzes' => fn ($query) => $query->withCount('questions'),
        ])->firstOrFail();

        $formatted = $course->modules
            ->sortBy(fn ($m) => sprintf('%05d', $m->sort_order))
            ->values()
            ->map(fn ($m) => $this->formatModule($m, $user))
            ->all();

        if ($user->id > 0 && ! $this->userCanAccessCourseLessons($user, $course)) {
            return $this->applyEnrollmentLocksToModules($formatted);
        }

        return $this->applySequentialLessonLocksToModules(
            $formatted,
            $this->shouldApplyLessonLocksForUser($user, $course)
        );
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
                'quizzes' => fn ($query) => $query->withCount('questions'),
            ])
            ->get()
            ->sortBy(fn ($m) => array_search($m->public_id, $publicIds, true))
            ->values();

        $formatted = $modules->map(fn ($m) => $this->formatModule($m, $user))->values()->all();

        return $this->applySequentialLessonLocksByCourse($formatted, $user);
    }

    /** Whether a curriculum item (core, standalone lesson, or quiz public id) is locked for this learner. */
    public function isCurriculumItemLockedForUser(User $user, Course $course, string $itemKey): bool
    {
        $itemKey = trim($itemKey);
        if ($itemKey === '') {
            return false;
        }

        if ($user->id > 0 && ! $this->userCanAccessCourseLessons($user, $course)) {
            return true;
        }

        if (! $this->shouldApplyLessonLocksForUser($user, $course)) {
            return false;
        }

        $map = $this->curriculumLockMapForUser($user, $course);

        return (bool) ($map[$itemKey] ?? false);
    }

    public function curriculumAccessDeniedMessage(User $user, Course $course): ?string
    {
        if ($user->id > 0 && ! $this->userCanAccessCourseLessons($user, $course)) {
            return 'Enroll in this program to access lessons.';
        }

        return null;
    }

    public function userCanAccessCourseLessons(User $user, Course $course): bool
    {
        if ($user->id <= 0) {
            return false;
        }

        $role = strtolower((string) ($user->role ?? ''));
        if (in_array($role, ['admin', 'instructor'], true)) {
            return true;
        }

        $course->loadMissing('program');
        $programId = $course->program_id;
        if ($programId === null) {
            return false;
        }

        return Enrollment::query()
            ->where('user_id', $user->id)
            ->where('program_id', $programId)
            ->where('status', 'approved')
            ->exists();
    }

    /** @return array<int, array<string, mixed>> */
    public function quizzesForModuleFilter(User $user, ?string $modulePublicId): array
    {
        $q = Quiz::query()->with(['course', 'module']);

        if ($modulePublicId) {
            $module = Module::query()->where('public_id', $modulePublicId)->firstOrFail();
            $q->where('module_id', $module->id);
        }

        return $q->withCount('questions')->orderBy('title')->get()
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
        self::bustInstructorDashboardStatsCache();
    }

    public static function bustInstructorDashboardStatsCache(): void
    {
        Cache::forget('lms:instructor-dashboard-stats');
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
        $student = $user->studentProfile;
        $badges = $user->badges->map(fn ($b) => $b->badge_label ?? (LmsMeta::BADGE_LABELS[$b->badge_key] ?? $b->badge_key))->all();
        $isStudent = strtolower((string) $user->role) === 'student';

        return [
            'id' => $user->public_uid,
            'displayName' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'isStudent' => $isStudent,
            'status' => $user->status ?? 'active',
            'activeProgram' => $profile?->program?->code ?? 'CE',
            'joinedAt' => optional($profile?->joined_at)->format('Y-m-d') ?? $user->created_at->format('Y-m-d'),
            'streak' => (int) ($profile?->streak_days ?? 0),
            'badges' => $badges,
            'watermarkName' => $profile?->watermark_name ?? $user->name,
            'sessionWarning' => (bool) ($profile?->session_warning ?? false),
            'phoneNumber' => $student?->phone_number,
            'birthday' => optional($student?->birthday)->format('Y-m-d'),
            'schoolHeld' => $student?->school_held,
        ];
    }

    protected function formatProgram(Program $p): array
    {
        return [
            'id' => $p->public_id,
            'code' => $p->code,
            'slug' => $p->slug,
            'title' => $p->title,
            'description' => $p->description,
            'status' => $p->status ?? 'active',
            'bannerPath' => $p->banner_path,
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
     * Average score across the learner's recorded attempts for this course's visible quizzes.
     * Returns null when no attempts exist.
     */
    protected function averageQuizScorePercent(Course $course, User $user, Collection $modulesStat): ?int
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

        $avg = QuizAttempt::query()
            ->where('user_id', $user->id)
            ->whereIn('quiz_id', $quizIds)
            ->avg('score');

        return $avg === null ? null : (int) round((float) $avg);
    }

    /**
     * @param  array<string, mixed>|null  $raw  courses.marketing_json
     * @return array{description: array<int, string>, paragraphs: array<int, string>, learningOutcomes: array<int, string>, audience: array<int, string>, faq: array<int, array{question: string, answer: string}>, notices: array<int, string>, noticeHeading: string|null, bannerImageUrl: string|null, lockLessonsInOrder: bool}
     */
    protected function formatMarketingPayload(?array $raw): array
    {
        $j = is_array($raw) ? $raw : [];
        $description = $this->normalizeStringListField($j['description'] ?? $j['paragraphs'] ?? []);

        // Prefer explicit `bannerImageUrl` (null = cleared); legacy `heroImageUrl` only when key absent.
        $banner = array_key_exists('bannerImageUrl', $j)
            ? $j['bannerImageUrl']
            : ($j['heroImageUrl'] ?? null);
        $bannerTrimmed = null;
        if (is_string($banner) && trim($banner) !== '') {
            $bannerTrimmed = trim($banner);
        }

        return [
            'description' => $description,
            'paragraphs' => $description,
            'learningOutcomes' => $this->normalizeStringListField($j['learningOutcomes'] ?? $j['learn'] ?? []),
            'coInstructors' => $this->normalizeStringListField($j['coInstructors'] ?? []),
            'audience' => [],
            'faq' => $this->normalizeFaqListField($j['faq'] ?? $j['faqs'] ?? []),
            'notices' => $this->normalizeStringListField($j['notices'] ?? []),
            'noticeHeading' => isset($j['noticeHeading']) && is_string($j['noticeHeading']) && trim($j['noticeHeading']) !== ''
                ? trim($j['noticeHeading'])
                : null,
            'bannerImageUrl' => $bannerTrimmed,
            'lockLessonsInOrder' => (bool) ($j['lockLessonsInOrder'] ?? false),
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

        $averageQuizScorePercent = $this->averageQuizScorePercent($c, $user, $modulesStat);

        return [
            'id' => $c->public_id,
            'slug' => $c->slug,
            'title' => $c->title,
            'programId' => $c->program->public_id,
            'programSlug' => $c->program?->slug,
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
            'canAccessLessons' => $this->userCanAccessCourseLessons($user, $c),
            'averageRating' => $c->average_rating !== null ? round((float) $c->average_rating, 1) : null,
            ...($c->video_hours_label ? ['videoHoursLabel' => $c->video_hours_label] : []),
            ...($c->preview_completed ? ['previewCompleted' => true] : []),
        ];
    }

    public function modulePayloadForUser(Module $m, User $user): array
    {
        $row = $this->formatModule($m, $user);
        $m->loadMissing('course');
        $locked = $this->applySequentialLessonLocksToModules(
            [$row],
            $this->shouldApplyLessonLocksForUser($user, $m->course)
        );

        return $locked[0] ?? $row;
    }

    protected function courseLockLessonsInOrder(Course $course): bool
    {
        $marketing = $this->formatMarketingPayload($course->marketing_json);

        return (bool) ($marketing['lockLessonsInOrder'] ?? false);
    }

    protected function shouldApplyLessonLocksForUser(User $user, Course $course): bool
    {
        if ($user->id <= 0 || strtolower((string) ($user->role ?? '')) === 'guest') {
            return false;
        }

        return $this->courseLockLessonsInOrder($course);
    }

    /**
     * @param  array<int, array<string, mixed>>  $modules
     * @return array<string, bool>  item public id (or `{moduleId}-core`) => locked
     */
    public function curriculumLockMapForUser(User $user, Course $course): array
    {
        $cacheKey = $course->id.':'.$user->id;
        if (isset($this->curriculumLockMapCache[$cacheKey])) {
            return $this->curriculumLockMapCache[$cacheKey];
        }

        $course->loadMissing([
            'modules.resources.lessonMaterials.moduleResource',
            'modules.moduleLessonMaterials.moduleResource',
            'modules.course',
            'modules.quizzes' => fn ($query) => $query->withCount('questions'),
        ]);

        $formatted = $course->modules
            ->sortBy(fn ($m) => sprintf('%05d', $m->sort_order))
            ->values()
            ->map(fn ($m) => $this->formatModule($m, $user))
            ->all();

        $lockedModules = $user->id > 0 && ! $this->userCanAccessCourseLessons($user, $course)
            ? $this->applyEnrollmentLocksToModules($formatted)
            : $this->applySequentialLessonLocksToModules(
                $formatted,
                $this->shouldApplyLessonLocksForUser($user, $course)
            );

        $map = [];
        foreach ($lockedModules as $mod) {
            $moduleId = (string) ($mod['id'] ?? '');
            if ($moduleId !== '') {
                $map[$moduleId.'-core'] = (bool) ($mod['coreLocked'] ?? false);
            }
            foreach ($mod['standaloneLessons'] ?? [] as $lesson) {
                if (isset($lesson['id'])) {
                    $map[(string) $lesson['id']] = (bool) ($lesson['locked'] ?? false);
                }
            }
            foreach ($mod['quizzes'] ?? [] as $quiz) {
                if (isset($quiz['id'])) {
                    $map[(string) $quiz['id']] = (bool) ($quiz['locked'] ?? false);
                }
            }
        }

        return $this->curriculumLockMapCache[$cacheKey] = $map;
    }

    /**
     * Apply per-learner lock flags on visible modules in global curriculum order.
     *
     * @param  array<int, array<string, mixed>>  $modules
     * @return array<int, array<string, mixed>>
     */
    protected function applySequentialLessonLocksToModules(array $modules, bool $lockLessonsInOrder): array
    {
        if ($modules === []) {
            return [];
        }

        if (! $lockLessonsInOrder) {
            return array_map(fn (array $mod) => $this->applyLockFieldsToModuleRow($mod), $modules);
        }

        $prevChainComplete = true;
        $out = [];

        foreach ($modules as $mod) {
            if (($mod['visible'] ?? true) === false) {
                $out[] = $this->applyLockFieldsToModuleRow($mod);

                continue;
            }

            $moduleCompleted = ((int) ($mod['progress'] ?? 0)) >= 100;
            $coreCompleted = $moduleCompleted || (bool) ($mod['coreCompleted'] ?? false);
            $mod['coreLocked'] = ! $prevChainComplete;
            $prevChainComplete = $prevChainComplete && $coreCompleted;

            $standalone = is_array($mod['standaloneLessons'] ?? null) ? $mod['standaloneLessons'] : [];
            usort(
                $standalone,
                fn ($a, $b) => ((int) ($a['sortOrder'] ?? PHP_INT_MAX)) <=> ((int) ($b['sortOrder'] ?? PHP_INT_MAX))
            );
            $standaloneOut = [];
            foreach ($standalone as $row) {
                $completed = $moduleCompleted || (bool) ($row['completed'] ?? false);
                $row['locked'] = ! $prevChainComplete;
                $standaloneOut[] = $row;
                $prevChainComplete = $prevChainComplete && $completed;
            }
            $mod['standaloneLessons'] = $standaloneOut;

            $quizzes = is_array($mod['quizzes'] ?? null) ? $mod['quizzes'] : [];
            usort(
                $quizzes,
                fn ($a, $b) => ((int) ($a['sortOrder'] ?? PHP_INT_MAX)) <=> ((int) ($b['sortOrder'] ?? PHP_INT_MAX))
            );
            $quizzesOut = [];
            foreach ($quizzes as $quiz) {
                $attemptsUsed = (int) ($quiz['attemptsUsed'] ?? 0);
                $completed = (bool) ($quiz['completed'] ?? false) || $attemptsUsed > 0;
                $quiz['locked'] = ! $prevChainComplete;
                $quizzesOut[] = $quiz;
                $prevChainComplete = $prevChainComplete && $completed;
            }
            $mod['quizzes'] = $quizzesOut;

            $out[] = $mod;
        }

        return $out;
    }

    /**
     * @param  array<int, array<string, mixed>>  $modules
     * @return array<int, array<string, mixed>>
     */
    protected function applySequentialLessonLocksByCourse(array $modules, User $user): array
    {
        if ($modules === []) {
            return [];
        }

        $byCourse = [];
        foreach ($modules as $index => $mod) {
            $courseId = (string) ($mod['courseId'] ?? '');
            $byCourse[$courseId][] = $index;
        }

        $out = $modules;
        foreach ($byCourse as $coursePublicId => $indices) {
            $course = Course::query()->where('public_id', $coursePublicId)->first();
            $subset = array_map(fn (int $i) => $modules[$i], $indices);
            if ($course !== null && $user->id > 0 && ! $this->userCanAccessCourseLessons($user, $course)) {
                $locked = $this->applyEnrollmentLocksToModules($subset);
            } else {
                $locked = $this->applySequentialLessonLocksToModules(
                    $subset,
                    $course !== null && $this->shouldApplyLessonLocksForUser($user, $course)
                );
            }
            foreach ($indices as $pos => $originalIndex) {
                $out[$originalIndex] = $locked[$pos] ?? $modules[$originalIndex];
            }
        }

        return $out;
    }

    /**
     * @param  array<string, mixed>  $mod
     * @return array<string, mixed>
     */
    /**
     * Lock every curriculum item when the learner is signed in but not approved on the program.
     *
     * @param  array<int, array<string, mixed>>  $modules
     * @return array<int, array<string, mixed>>
     */
    protected function applyEnrollmentLocksToModules(array $modules): array
    {
        return array_map(function (array $mod) {
            if (($mod['visible'] ?? true) === false) {
                return $mod;
            }

            $mod['coreLocked'] = true;

            if (is_array($mod['standaloneLessons'] ?? null)) {
                $mod['standaloneLessons'] = array_map(
                    fn (array $row) => array_merge($row, ['locked' => true]),
                    $mod['standaloneLessons']
                );
            }

            if (is_array($mod['quizzes'] ?? null)) {
                $mod['quizzes'] = array_map(
                    fn (array $row) => array_merge($row, ['locked' => true]),
                    $mod['quizzes']
                );
            }

            return $mod;
        }, $modules);
    }

    protected function applyLockFieldsToModuleRow(array $mod): array
    {
        $mod['coreLocked'] = false;
        if (is_array($mod['standaloneLessons'] ?? null)) {
            $mod['standaloneLessons'] = array_map(function (array $row) {
                $row['locked'] = false;

                return $row;
            }, $mod['standaloneLessons']);
        }
        if (is_array($mod['quizzes'] ?? null)) {
            $mod['quizzes'] = array_map(function (array $row) {
                $row['locked'] = false;

                return $row;
            }, $mod['quizzes']);
        }

        return $mod;
    }

    protected function formatModule($m, User $user): array
    {
        $progress = UserModuleProgress::query()
            ->where('user_id', $user->id)
            ->where('module_id', $m->id)
            ->first();
        $coreLessonKey = $m->public_id.'-core';
        $standaloneLessonKeys = $m->resources
            ->filter(fn (ModuleResource $r) => (bool) $r->is_standalone_lesson)
            ->pluck('public_id')
            ->map(fn ($id) => (string) $id)
            ->values()
            ->all();
        $lessonKeys = array_values(array_unique(array_merge([$coreLessonKey], $standaloneLessonKeys)));
        $completedSet = [];
        if ($user->id > 0 && $lessonKeys !== []) {
            $completedLessonKeys = UserLessonProgress::query()
                ->where('user_id', $user->id)
                ->where('course_id', $m->course_id)
                ->whereIn('lesson_key', $lessonKeys)
                ->pluck('lesson_key')
                ->map(fn ($k) => (string) $k)
                ->all();
            $completedSet = array_fill_keys($completedLessonKeys, true);
        }

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
            /** Non-standalone resource formats only — used to type the module core lesson. */
            'coreResources' => $m->resources
                ->filter(fn (ModuleResource $r) => ! (bool) $r->is_standalone_lesson)
                ->pluck('format')
                ->all(),
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
                    'lessonMeta' => LessonMetaSupport::sanitize($r->lesson_meta_json ?? null),
                    'sortOrder' => (int) $r->sort_order,
                    'completed' => isset($completedSet[(string) $r->public_id]),
                    'lessonMaterials' => $r->lessonMaterials
                        ->map(fn (LessonMaterial $f) => $this->formatLessonMaterial($f, $user))
                        ->values()
                        ->all(),
                    'updatedAt' => $r->updated_at?->toIso8601String(),
                ])
                ->all(),
            'summary' => $m->summary,
            'excerptHtml' => $m->excerpt_html,
            'bodyHtml' => filled($m->body_html ?? null) ? $m->body_html : ($m->summary ?? ''),
            'lessonMeta' => LessonMetaSupport::sanitize($m->lesson_meta_json ?? null),
            'coreCompleted' => isset($completedSet[$coreLessonKey]),
            'lessonMaterials' => $m->moduleLessonMaterials
                ->map(fn (LessonMaterial $f) => $this->formatLessonMaterial($f, $user))
                ->values()
                ->all(),
            'quizzes' => $m->quizzes
                ->map(function (Quiz $q) use ($user) {
                    // Full authoring shape (matches PATCH payload / instructor Settings tab) so refetched modules
                    // keep description, toggles, duration, etc. — not only id/title/questionCount.
                    $row = $this->formatQuiz($q, $user);
                    $row['completed'] = ((int) ($row['attemptsUsed'] ?? 0)) > 0;

                    return $row;
                })
                ->values()
                ->all(),
        ];
    }

    public function formatLessonMaterial(LessonMaterial $f, User $user): array
    {
        $publicPath = $this->ensurePublicLessonMaterialPath($f->storage_path);
        $fileUrl = $publicPath !== null ? Storage::disk('public')->url($publicPath) : null;
        $isGuest = $user->id <= 0 || strtolower((string) ($user->role ?? '')) === 'guest';
        $mime = strtolower((string) ($f->mime ?? ''));
        $isVideo = str_starts_with($mime, 'video/');

        return [
            'id' => $f->public_id,
            'name' => $f->original_name,
            'mime' => $f->mime,
            'sizeBytes' => (int) $f->size_bytes,
            'moduleResourceId' => $f->moduleResource?->public_id,
            'fileUrl' => $isGuest ? null : $fileUrl,
            'inlineFileUrl' => $isGuest && ! $isVideo ? null : $fileUrl,
            'downloadable' => ! $isGuest,
        ];
    }

    protected function ensurePublicLessonMaterialPath(?string $rawPath): ?string
    {
        $storagePath = ltrim((string) $rawPath, '/');
        if ($storagePath === '') {
            return null;
        }

        if (Storage::disk('public')->exists($storagePath)) {
            return $storagePath;
        }

        // Backward compatibility for files uploaded before public-disk migration.
        if (! Storage::disk('local')->exists($storagePath)) {
            return null;
        }

        try {
            $source = Storage::disk('local')->readStream($storagePath);
            if (is_resource($source)) {
                Storage::disk('public')->writeStream($storagePath, $source);
                fclose($source);
            } else {
                Storage::disk('public')->put($storagePath, Storage::disk('local')->get($storagePath));
            }
        } catch (\Throwable) {
            return null;
        }

        return Storage::disk('public')->exists($storagePath) ? $storagePath : null;
    }

    public function authoringQuizPayload(Quiz $quiz, User $user): array
    {
        $quiz->loadMissing(['course', 'module']);
        $quiz->loadCount('questions');

        return $this->formatQuiz($quiz, $user);
    }

    /**
     * @return array<string, mixed>
     */
    public function formatQuizQuestion(Question $q, User $user): array
    {
        $meta = is_array($q->meta_json) ? $q->meta_json : [];

        $problemImageMaterialPublicId = $this->quizQuestionMaterialIdFromMeta(
            $meta,
            'problemImageMaterialPublicId',
            'diagramMaterialPublicId'
        );
        $solutionImageMaterialPublicId = $this->quizQuestionMaterialIdFromMeta(
            $meta,
            'solutionImageMaterialPublicId'
        );

        $problemImage = $this->quizQuestionImagePayload($problemImageMaterialPublicId, $user);
        $solutionImage = $this->quizQuestionImagePayload($solutionImageMaterialPublicId, $user);

        $questionType = (string) ($q->question_type ?? 'single_choice');
        if ($questionType !== 'simulation_diagram') {
            $questionType = 'single_choice';
        }

        return [
            'id' => (string) $q->id,
            'prompt' => $q->prompt,
            'questionType' => $questionType,
            'required' => (bool) ($meta['required'] ?? false),
            'problemImageMaterialPublicId' => $problemImageMaterialPublicId,
            'problemImageUrl' => $problemImage['url'],
            'problemImageName' => $problemImage['name'],
            'solutionImageMaterialPublicId' => $solutionImageMaterialPublicId,
            'solutionImageUrl' => $solutionImage['url'],
            'solutionImageName' => $solutionImage['name'],
            // Legacy aliases (problem image only)
            'diagramMaterialPublicId' => $problemImageMaterialPublicId,
            'diagramUrl' => $problemImage['url'],
            'diagramName' => $problemImage['name'],
            'options' => $q->relationLoaded('options')
                ? $q->options->map(function (QuestionOption $opt) {
                    return [
                        'id' => (string) $opt->id,
                        'label' => $opt->label,
                        'isCorrect' => (bool) $opt->is_correct,
                    ];
                })->values()->all()
                : [],
        ];
    }

    /**
     * @param  array<string, mixed>  $meta
     */
    protected function quizQuestionMaterialIdFromMeta(array $meta, string $primaryKey, ?string $legacyKey = null): ?string
    {
        $id = isset($meta[$primaryKey]) ? trim((string) $meta[$primaryKey]) : '';
        if ($id === '' && $legacyKey !== null && isset($meta[$legacyKey])) {
            $id = trim((string) $meta[$legacyKey]);
        }

        return $id !== '' ? $id : null;
    }

    /**
     * @return array{url: ?string, name: ?string}
     */
    protected function quizQuestionImagePayload(?string $materialPublicId, User $user): array
    {
        if ($materialPublicId === null) {
            return ['url' => null, 'name' => null];
        }

        $material = LessonMaterial::query()->where('public_id', $materialPublicId)->first();
        if ($material === null) {
            return ['url' => null, 'name' => null];
        }

        $formatted = $this->formatLessonMaterial($material, $user);

        return [
            'url' => $formatted['fileUrl'] ?? $formatted['inlineFileUrl'] ?? null,
            'name' => $formatted['name'] ?? null,
        ];
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

    /**
     * Prefer the live number of `questions` rows (via `withCount('questions')`) over the denormalized `quizzes.question_count` column.
     */
    protected function resolvedQuizQuestionCount(Quiz $q): int
    {
        return isset($q->questions_count)
            ? (int) $q->questions_count
            : (int) $q->question_count;
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
            'questionCount' => $this->resolvedQuizQuestionCount($q),
            'sortOrder' => (int) $q->sort_order,
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

    protected function formatEnrollment(Enrollment $e, bool $includeLearner = false): array
    {
        $row = [
            'id' => $e->public_id,
            'programId' => $e->program->public_id,
            'programTitle' => $e->program->title ?? '',
            'submittedAt' => optional($e->submitted_at)->format('Y-m-d'),
            'status' => $e->status,
        ];

        if ($includeLearner) {
            $student = $e->user?->studentProfile;
            $row['userName'] = $e->user->name ?? '';
            $row['userEmail'] = $e->user->email ?? '';
            $row['phoneNumber'] = $student?->phone_number ?? '';
            $row['schoolHeld'] = $student?->school_held ?? '';
        }

        if ($e->payment_proof_path) {
            $row['hasPaymentProof'] = true;
            $row['paymentProofFileName'] = $e->payment_proof_original_name ?? 'payment-proof';
            if ($includeLearner) {
                $row['paymentProofUrl'] = url('/api/enrollments/'.$e->public_id.'/payment-proof');
            }
        }

        return $row;
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

        $payload = [
            'completedModules' => $completed,
            'totalModules' => $total,
            'completionRate' => $completionRate,
            'pendingModules' => max(0, $total - $completed),
            'strengths' => ['Hydraulics', 'Code Familiarity', 'Material Selection'],
            'weaknesses' => ['Open channel flow', 'Sanitary vent layouts', 'Heat treatment cycles'],
            'suggestedModuleIds' => ['module-hydraulics-practice', 'module-code-final-coaching', 'module-heat-treatment-refresher'],
        ];

        if ($this->userCanViewInstructorDashboard($user)) {
            $payload['instructorSummary'] = $this->buildInstructorDashboardStats();
        }

        return $payload;
    }

    /**
     * @return array{courses: int, enrollments: int, students: int}
     */
    protected function buildInstructorDashboardStats(): array
    {
        return Cache::remember('lms:instructor-dashboard-stats', now()->addSeconds(45), function () {
            return [
                'courses' => Course::query()->count(),
                'enrollments' => Enrollment::query()->count(),
                'students' => Student::query()->count(),
            ];
        });
    }

    protected function userCanViewInstructorDashboard(User $user): bool
    {
        $role = strtolower(trim((string) ($user->role ?? '')));

        return $role === 'instructor' || $role === 'admin';
    }
}
