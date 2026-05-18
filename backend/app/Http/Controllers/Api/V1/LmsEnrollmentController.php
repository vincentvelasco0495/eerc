<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Concerns\ResolvesLmsActor;
use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Program;
use App\Models\User;
use App\Services\LmsCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LmsEnrollmentController extends Controller
{
    use ResolvesLmsActor;

    public function index(Request $request, LmsCatalogService $catalog): JsonResponse
    {
        $user = $this->lmsActor();

        if ($request->filled('page')) {
            $validated = $request->validate([
                'page' => ['required', 'integer', 'min:1'],
                'per_page' => ['sometimes', 'integer', 'in:5,10,20,50,100'],
                'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            ]);

            $perPage = (int) ($validated['per_page'] ?? 10);
            $page = (int) $validated['page'];
            $search = isset($validated['search']) ? (string) $validated['search'] : null;
            $userId = $this->canManageEnrollments($user) ? null : ($user->id > 0 ? $user->id : 0);

            if ($userId === 0) {
                return response()->json([
                    'data' => [],
                    'meta' => [
                        'current_page' => 1,
                        'last_page' => 1,
                        'per_page' => $perPage,
                        'total' => 0,
                        'from' => 0,
                        'to' => 0,
                    ],
                ]);
            }

            return response()->json($catalog->enrollmentsPaginated($page, $perPage, $search, $userId));
        }

        if ($user->id <= 0) {
            return response()->json(['data' => []]);
        }

        return response()->json(['data' => $catalog->enrollmentsForUser($user)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'program_id' => 'required|string|max:64',
            'payment_proof' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
        ]);

        $user = $this->lmsActor();
        if ($user->id <= 0) {
            abort(401, 'Authentication required.');
        }

        $program = Program::query()->where('public_id', $data['program_id'])->firstOrFail();
        $uploaded = $request->file('payment_proof');

        $existing = Enrollment::query()
            ->where('user_id', $user->id)
            ->where('program_id', $program->id)
            ->orderByDesc('id')
            ->first();

        if ($existing && in_array($existing->status, ['pending', 'approved'], true)) {
            return response()->json([
                'message' => 'You already have an enrollment application for this program.',
            ], 409);
        }

        $stored = Storage::disk('public')->putFile('enrollment-payment-proofs', $uploaded);
        $proofPayload = [
            'payment_proof_path' => $stored,
            'payment_proof_original_name' => $uploaded->getClientOriginalName() ?: ('payment-'.$uploaded->hashName()),
            'payment_proof_mime' => $uploaded->getMimeType(),
        ];

        if ($existing && $existing->status === 'rejected') {
            if ($existing->payment_proof_path) {
                Storage::disk('public')->delete($existing->payment_proof_path);
            }

            $existing->update([
                'status' => 'pending',
                'submitted_at' => now()->toDateString(),
                ...$proofPayload,
            ]);
            $enrollment = $existing;
        } else {
            $enrollment = Enrollment::query()->create([
                'public_id' => 'enrollment-'.Str::lower(Str::ulid()),
                'user_id' => $user->id,
                'program_id' => $program->id,
                'status' => 'pending',
                'submitted_at' => now()->toDateString(),
                ...$proofPayload,
            ]);
        }

        $enrollment->load('program');

        LmsCatalogService::bustUserAnalyticsCache($user->id);

        return response()->json([
            'id' => $enrollment->public_id,
            'programId' => $enrollment->program->public_id,
            'programTitle' => $enrollment->program->title ?? '',
            'submittedAt' => $enrollment->submitted_at->format('Y-m-d'),
            'status' => $enrollment->status,
            'hasPaymentProof' => true,
        ], 201);
    }

    public function downloadPaymentProof(string $publicId): StreamedResponse|JsonResponse
    {
        $actor = $this->lmsActor();
        if ($actor->id <= 0) {
            abort(401, 'Authentication required.');
        }

        $enrollment = Enrollment::query()->where('public_id', $publicId)->firstOrFail();

        if (! $this->canManageEnrollments($actor) && $enrollment->user_id !== $actor->id) {
            abort(403, 'You cannot view this payment proof.');
        }

        $path = $enrollment->payment_proof_path;
        if (! $path || ! Storage::disk('public')->exists($path)) {
            abort(404, 'Payment proof not found.');
        }

        $disk = Storage::disk('public');
        $name = $enrollment->payment_proof_original_name ?: 'payment-proof';
        $mime = $enrollment->payment_proof_mime;

        if ($mime) {
            return $disk->response($path, $name, ['Content-Type' => $mime]);
        }

        return $disk->download($path, $name);
    }

    public function updateStatus(Request $request, string $publicId): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|string|in:pending,approved,rejected',
        ]);

        $actor = $this->lmsActor();
        if ($actor->id <= 0) {
            abort(401, 'Authentication required.');
        }

        $enrollment = Enrollment::query()->where('public_id', $publicId)->firstOrFail();

        if (! $this->canManageEnrollments($actor) && $enrollment->user_id !== $actor->id) {
            abort(403, 'You cannot update this enrollment.');
        }

        $enrollment->update(['status' => $data['status']]);

        LmsCatalogService::bustUserAnalyticsCache($enrollment->user_id);

        return response()->json([
            'enrollmentId' => $enrollment->public_id,
            'status' => $enrollment->status,
        ]);
    }

    protected function canManageEnrollments(User $user): bool
    {
        if ($user->id <= 0) {
            return false;
        }

        $role = strtolower(trim((string) ($user->role ?? '')));

        return $role === 'instructor' || $role === 'admin';
    }
}
