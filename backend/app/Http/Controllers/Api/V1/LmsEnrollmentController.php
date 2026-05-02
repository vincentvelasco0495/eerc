<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Concerns\ResolvesLmsActor;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Services\LmsCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LmsEnrollmentController extends Controller
{
    use ResolvesLmsActor;

    public function index(LmsCatalogService $catalog): JsonResponse
    {
        $user = $this->lmsActor();

        return response()->json(['data' => $catalog->enrollmentsForUser($user)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'course_id' => 'required|string|max:64',
        ]);

        $user = $this->lmsActor();
        $course = Course::query()->where('public_id', $data['course_id'])->firstOrFail();

        $enrollment = Enrollment::query()->create([
            'public_id' => 'enrollment-'.Str::lower(Str::ulid()),
            'user_id' => $user->id,
            'course_id' => $course->id,
            'status' => 'pending',
            'submitted_at' => now()->toDateString(),
        ]);

        $enrollment->load('course');

        LmsCatalogService::bustUserAnalyticsCache($user->id);

        return response()->json([
            'id' => $enrollment->public_id,
            'courseId' => $enrollment->course->public_id,
            'submittedAt' => $enrollment->submitted_at->format('Y-m-d'),
            'status' => $enrollment->status,
        ], 201);
    }

    public function updateStatus(Request $request, string $publicId): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|string|in:pending,approved,rejected',
        ]);

        $enrollment = Enrollment::query()->where('public_id', $publicId)->firstOrFail();
        $enrollment->update(['status' => $data['status']]);

        LmsCatalogService::bustUserAnalyticsCache($enrollment->user_id);

        return response()->json([
            'enrollmentId' => $enrollment->public_id,
            'status' => $enrollment->status,
        ]);
    }
}
