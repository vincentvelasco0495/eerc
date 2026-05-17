<?php

namespace App\Services;

use App\Models\Student;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class LmsStudentService
{
    /** @return array<string, mixed> */
    public function formatStudent(Student $student): array
    {
        $student->loadMissing('user');
        $user = $student->user;
        if (! $user) {
            throw new \RuntimeException('Student row is missing linked user.');
        }

        return [
            'id' => $user->public_uid,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'isStudent' => strtolower((string) $user->role) === 'student',
            'status' => $user->status ?? 'active',
            'notes' => $student->notes,
            'profilePath' => $student->profile_path,
            'phoneNumber' => $student->phone_number,
            'birthday' => optional($student->birthday)->format('Y-m-d'),
            'schoolHeld' => $student->school_held,
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function updateProfileForUser(User $user, array $data): array
    {
        $student = Student::query()->firstOrCreate(['user_id' => $user->id]);

        if (array_key_exists('phoneNumber', $data)) {
            $student->phone_number = $data['phoneNumber'] !== null && trim((string) $data['phoneNumber']) !== ''
                ? trim((string) $data['phoneNumber'])
                : null;
        }
        if (array_key_exists('birthday', $data)) {
            $student->birthday = $data['birthday'] !== null && trim((string) $data['birthday']) !== ''
                ? trim((string) $data['birthday'])
                : null;
        }
        if (array_key_exists('schoolHeld', $data)) {
            $student->school_held = $data['schoolHeld'] !== null && trim((string) $data['schoolHeld']) !== ''
                ? trim((string) $data['schoolHeld'])
                : null;
        }

        $student->save();

        return $this->formatStudent($student->fresh()->load('user'));
    }

    /** @return array<int, array<string, mixed>> */
    public function students(): array
    {
        return Student::query()
            ->with('user')
            ->join('users', 'users.id', '=', 'students.user_id')
            ->orderBy('users.name')
            ->select('students.*')
            ->get()
            ->map(fn (Student $s) => $this->formatStudent($s))
            ->all();
    }

    /**
     * @return array{data: array<int, array<string, mixed>>, meta: array<string, int>}
     */
    public function studentsPaginated(int $page, int $perPage, ?string $search = null): array
    {
        $query = Student::query()
            ->with('user')
            ->join('users', 'users.id', '=', 'students.user_id')
            ->select([
                'students.id',
                'students.user_id',
                'students.notes',
                'students.profile_path',
                'students.created_at',
                'students.updated_at',
            ])
            ->orderBy('users.name')
            ->orderByDesc('students.id');

        $term = $search !== null ? trim($search) : '';
        if ($term !== '') {
            $like = '%'.addcslashes($term, '%_\\').'%';
            $query->where(function ($q) use ($like) {
                $q->where('students.notes', 'like', $like)
                    ->orWhere('users.name', 'like', $like)
                    ->orWhere('users.email', 'like', $like)
                    ->orWhere('users.status', 'like', $like);
            });
        }

        /** @var LengthAwarePaginator<int, Student> $paginator */
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => $paginator->getCollection()
                ->map(fn (Student $s) => $this->formatStudent($s))
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
}
