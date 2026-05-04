<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Concerns\ResolvesLmsActor;
use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Services\LmsCatalogService;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LmsQuizController extends Controller
{
    use ResolvesLmsActor;

    public function index(Request $request, LmsCatalogService $catalog): JsonResponse
    {
        $user = $this->lmsActor();
        $moduleId = $request->query('moduleId');
        $modulePublicId = is_string($moduleId) && trim($moduleId) !== '' ? trim($moduleId) : null;
        $rows = $catalog->quizzesForModuleFilter($user, $modulePublicId);

        return response()->json(['data' => $rows]);
    }

    /** Attach a new quiz lesson to this module (`module_id`, `course_id` from LMS module row). */
    public function storeForModule(Request $request, string $modulePublicId, LmsCatalogService $catalog): JsonResponse
    {
        $actor = $this->lmsActor();

        /** @var Module $module */
        $module = Module::query()->where('public_id', $modulePublicId)->with('course')->firstOrFail();

        $validated = $request->validate([
            'title' => ['sometimes', 'nullable', 'string', 'max:512'],
        ]);

        $title = isset($validated['title']) ? trim((string) $validated['title']) : '';
        if ($title === '') {
            $title = 'New quiz';
        }

        $quiz = Quiz::query()->create([
            'public_id' => (string) Str::uuid(),
            'course_id' => $module->course_id,
            'module_id' => $module->id,
            'title' => $title,
            'duration_minutes' => 15,
            'attempts_allowed' => 3,
            'question_count' => 0,
            'question_pool_count' => 0,
        ]);

        LmsCatalogService::bustUserAnalyticsCache($actor->id);

        return response()->json([
            'data' => $catalog->authoringQuizPayload($quiz->fresh(['course', 'module']), $actor),
        ], 201);
    }

    public function questions(string $publicId): JsonResponse
    {
        $quiz = Quiz::query()->where('public_id', $publicId)->with(['questions.options'])->firstOrFail();

        $items = $quiz->questions->map(function ($q) {
            return [
                'id' => (string) $q->id,
                'prompt' => $q->prompt,
                'options' => $q->options->map(function ($opt) {
                    return [
                        'id' => (string) $opt->id,
                        'label' => $opt->label,
                        'isCorrect' => (bool) $opt->is_correct,
                    ];
                })->values()->all(),
            ];
        })->values()->all();

        return response()->json($items);
    }

    /**
     * Persist quiz authoring payload (`title` + full question list) for instructor builder.
     * Replaces existing questions/options in one transaction.
     */
    public function update(Request $request, string $publicId, LmsCatalogService $catalog): JsonResponse
    {
        $actor = $this->lmsActor();
        /** @var Quiz $quiz */
        $quiz = Quiz::query()->where('public_id', $publicId)->with(['course', 'module'])->firstOrFail();

        $validated = $request->validate([
            'title' => ['sometimes', 'nullable', 'string', 'max:512'],
            'questions' => ['sometimes', 'array'],
            'questions.*.prompt' => ['required_with:questions', 'string'],
            'questions.*.choices' => ['required_with:questions', 'array', 'min:2'],
            'questions.*.choices.*.label' => ['required_with:questions', 'string', 'max:2048'],
            'questions.*.choices.*.isCorrect' => ['sometimes', 'boolean'],
            'shortDescription' => ['sometimes', 'nullable', 'string', 'max:65000'],
            'lessonContentHtml' => ['sometimes', 'nullable', 'string', 'max:16777215'],
            'duration' => ['sometimes', 'integer', 'min:0', 'max:525600'],
            'timeUnit' => ['sometimes', 'nullable', 'in:minutes,hours'],
            'quizStyle' => ['sometimes', 'nullable', 'string', 'max:64'],
            'attemptsAllowed' => ['sometimes', 'integer', 'min:1', 'max:255'],
            'passingGrade' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'pointsCutAfterRetake' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:100'],
            'randomizeQuestions' => ['sometimes', 'boolean'],
            'randomizeAnswers' => ['sometimes', 'boolean'],
            'showCorrectAnswer' => ['sometimes', 'boolean'],
            'quizAttemptHistory' => ['sometimes', 'boolean'],
            'retakeAfterPass' => ['sometimes', 'boolean'],
            'limitedRetakeAttempts' => ['sometimes', 'boolean'],
        ]);

        DB::transaction(function () use ($quiz, $validated) {
            if (array_key_exists('title', $validated)) {
                $t = trim((string) ($validated['title'] ?? ''));
                if ($t !== '') {
                    $quiz->title = $t;
                }
            }

            $this->applyQuizAuthoringMeta($quiz, $validated);

            if (array_key_exists('questions', $validated)) {
                $incoming = is_array($validated['questions']) ? $validated['questions'] : [];

                Question::query()->where('quiz_id', $quiz->id)->delete();

                foreach ($incoming as $qIndex => $qRow) {
                    $prompt = trim((string) ($qRow['prompt'] ?? ''));
                    if ($prompt === '') {
                        continue;
                    }

                    $question = Question::query()->create([
                        'quiz_id' => $quiz->id,
                        'prompt' => $prompt,
                        'sort_order' => $qIndex + 1,
                    ]);

                    $choices = is_array($qRow['choices'] ?? null) ? $qRow['choices'] : [];
                    foreach ($choices as $cIndex => $cRow) {
                        $label = trim((string) ($cRow['label'] ?? ''));
                        if ($label === '') {
                            continue;
                        }
                        QuestionOption::query()->create([
                            'question_id' => $question->id,
                            'label' => $label,
                            'is_correct' => (bool) ($cRow['isCorrect'] ?? false),
                            'sort_order' => $cIndex + 1,
                        ]);
                    }
                }

                $questionCount = (int) Question::query()->where('quiz_id', $quiz->id)->count();
                $quiz->question_count = $questionCount;
                $quiz->question_pool_count = $questionCount;
            }

            $quiz->save();
        });

        LmsCatalogService::bustUserAnalyticsCache($actor->id);

        return response()->json([
            'data' => $catalog->authoringQuizPayload($quiz->fresh(['course', 'module']), $actor),
        ]);
    }

    /**
     * Persist instructor “Settings” tab fields (description, rich lesson HTML, duration, JSON flags).
     *
     * @param  array<string, mixed>  $validated
     */
    private function applyQuizAuthoringMeta(Quiz $quiz, array $validated): void
    {
        if (array_key_exists('shortDescription', $validated)) {
            $quiz->description = (string) ($validated['shortDescription'] ?? '');
        }
        if (array_key_exists('lessonContentHtml', $validated)) {
            $quiz->lesson_content_html = (string) ($validated['lessonContentHtml'] ?? '');
        }
        if (array_key_exists('attemptsAllowed', $validated)) {
            $quiz->attempts_allowed = (int) $validated['attemptsAllowed'];
        }

        $settings = is_array($quiz->settings_json) ? $quiz->settings_json : [];
        $settingsDirty = false;

        $toggleKeys = [
            'randomizeQuestions',
            'randomizeAnswers',
            'showCorrectAnswer',
            'quizAttemptHistory',
            'retakeAfterPass',
            'limitedRetakeAttempts',
        ];
        foreach ($toggleKeys as $key) {
            if (array_key_exists($key, $validated)) {
                $settings[$key] = (bool) $validated[$key];
                $settingsDirty = true;
            }
        }

        if (array_key_exists('quizStyle', $validated) && $validated['quizStyle'] !== null) {
            $s = trim((string) $validated['quizStyle']);
            $settings['quizStyle'] = $s !== '' ? $s : 'global';
            $settingsDirty = true;
        }
        if (array_key_exists('passingGrade', $validated)) {
            $settings['passingGrade'] = max(0, min(100, (int) $validated['passingGrade']));
            $settingsDirty = true;
        }
        if (array_key_exists('pointsCutAfterRetake', $validated)) {
            $v = $validated['pointsCutAfterRetake'];
            $settings['pointsCutAfterRetake'] = $v === null ? null : max(0, min(100, (float) $v));
            $settingsDirty = true;
        }

        if (array_key_exists('timeUnit', $validated) && in_array($validated['timeUnit'], ['minutes', 'hours'], true)) {
            $settings['timeUnit'] = (string) $validated['timeUnit'];
            $settingsDirty = true;
        }

        if (array_key_exists('duration', $validated)) {
            $d = max(0, (int) $validated['duration']);
            $tuForCalc = (($settings['timeUnit'] ?? 'minutes') === 'hours') ? 'hours' : 'minutes';
            $quiz->duration_minutes = $tuForCalc === 'hours' ? min(525600, $d * 60) : min(525600, $d);
        }

        if ($settingsDirty) {
            $quiz->settings_json = $settings;
        }
    }

    public function storeAttempt(string $publicId): JsonResponse
    {
        $user = $this->lmsActor();
        $quiz = Quiz::query()->where('public_id', $publicId)->withCount('questions')->firstOrFail();

        $used = QuizAttempt::query()->where('user_id', $user->id)->where('quiz_id', $quiz->id)->count();
        if ($used >= $quiz->attempts_allowed) {
            return response()->json(['message' => 'No attempts remaining for this quiz.'], 422);
        }

        $total = (int) ($quiz->question_count ?: max(1, $quiz->questions_count));
        $correct = random_int(
            max(0, (int) floor($total * 0.55)),
            $total
        );
        $score = (int) round(($correct / $total) * 100);
        $duration = random_int(max(1, $quiz->duration_minutes - 4), max(1, $quiz->duration_minutes));

        $attempt = QuizAttempt::query()->create([
            'public_id' => 'attempt-'.Str::lower(Str::ulid()),
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'attempted_on' => now()->toDateString(),
            'score' => $score,
            'duration_used_label' => sprintf('%dm %02ds', $duration, random_int(0, 59)),
            'correct_answers' => $correct,
            'total_questions' => $total,
        ]);

        LmsCatalogService::bustUserAnalyticsCache($user->id);
        LmsCatalogService::bustLeaderboardCache();

        return response()->json([
            'id' => $attempt->public_id,
            'quizId' => $quiz->public_id,
            'date' => $attempt->attempted_on->format('Y-m-d'),
            'score' => (int) $attempt->score,
            'durationUsed' => $attempt->duration_used_label,
            'correctAnswers' => (int) $attempt->correct_answers,
            'totalQuestions' => (int) $attempt->total_questions,
        ], 201);
    }
}
