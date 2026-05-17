<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesLmsActor;
use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Services\LmsCatalogService;
use App\Services\LmsStudentService;
use App\Support\StudentProfileValidation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class LmsUserController extends Controller
{
    use ResolvesLmsActor;

    public function show(LmsCatalogService $catalog): JsonResponse
    {
        $user = $this->lmsActor()->load(['lmsProfile.program', 'badges', 'studentProfile']);

        return response()->json($catalog->userPayload($user));
    }

    public function update(Request $request, LmsCatalogService $catalog, LmsStudentService $students): JsonResponse
    {
        $user = $this->lmsActor();
        if ($user->id <= 0) {
            abort(401, 'Authentication required.');
        }

        $validator = Validator::make($request->all(), [
            'firstName' => ['sometimes', 'string', 'max:120'],
            'lastName' => ['sometimes', 'nullable', 'string', 'max:120'],
            'phoneNumber' => ['required', 'string', 'max:32'],
            'birthday' => ['required', 'date'],
            'schoolHeld' => ['sometimes', 'nullable', 'string', 'max:255'],
            'password' => ['sometimes', 'nullable', 'confirmed', Password::defaults()],
        ]);

        StudentProfileValidation::applyToValidator($validator);

        $validated = $validator->validate();

        if (array_key_exists('firstName', $validated) || array_key_exists('lastName', $validated)) {
            $first = array_key_exists('firstName', $validated)
                ? trim((string) $validated['firstName'])
                : null;
            $last = array_key_exists('lastName', $validated)
                ? trim((string) $validated['lastName'])
                : null;

            if ($first !== null) {
                $parts = preg_split('/\s+/', trim($user->name)) ?: [];
                $existingLast = count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : '';
                $resolvedFirst = $first;
                $resolvedLast = $last ?? $existingLast;
                $user->name = trim($resolvedFirst.' '.$resolvedLast);
            } elseif ($last !== null) {
                $parts = preg_split('/\s+/', trim($user->name)) ?: [];
                $resolvedFirst = $parts[0] ?? '';
                $user->name = trim($resolvedFirst.' '.$last);
            }
        }

        if (! empty($validated['password'])) {
            $user->password = Hash::make((string) $validated['password']);
        }

        $user->save();

        if (strtolower((string) $user->role) === 'student') {
            Student::query()->firstOrCreate(['user_id' => $user->id]);
            $studentFields = [];
            foreach (['phoneNumber', 'birthday', 'schoolHeld'] as $key) {
                if (array_key_exists($key, $validated)) {
                    $studentFields[$key] = $validated[$key];
                }
            }
            if ($studentFields !== []) {
                $students->updateProfileForUser($user, $studentFields);
            }
        }

        $user->refresh();
        $user->load(['lmsProfile.program', 'badges', 'studentProfile']);

        return response()->json($catalog->userPayload($user));
    }
}
