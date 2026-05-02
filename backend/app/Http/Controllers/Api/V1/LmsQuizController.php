<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Concerns\ResolvesLmsActor;
use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Services\LmsCatalogService;
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
                'choices' => $q->options->map->label->values()->all(),
            ];
        })->values()->all();

        return response()->json($items);
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
