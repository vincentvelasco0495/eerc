<?php

namespace App\Services;

use App\Models\Instructor;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class LmsInstructorService
{
    /** @return array<string, mixed> */
    public function formatInstructor(Instructor $instructor): array
    {
        $instructor->loadMissing('user');
        $user = $instructor->user;
        if (! $user) {
            throw new \RuntimeException('Instructor row is missing linked user.');
        }

        return [
            'id' => $user->public_uid,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status ?? 'active',
            'achievements' => $instructor->achievements,
            'profilePath' => $instructor->profile_path,
        ];
    }

    /** @return array<int, array<string, mixed>> */
    public function instructors(): array
    {
        return Instructor::query()
            ->with('user')
            ->join('users', 'users.id', '=', 'instructors.user_id')
            ->orderBy('users.name')
            ->select('instructors.*')
            ->get()
            ->map(fn (Instructor $i) => $this->formatInstructor($i))
            ->all();
    }

    /**
     * @return array{data: array<int, array<string, mixed>>, meta: array<string, int>}
     */
    public function instructorsPaginated(int $page, int $perPage, ?string $search = null): array
    {
        $query = Instructor::query()
            ->with('user')
            ->join('users', 'users.id', '=', 'instructors.user_id')
            ->select([
                'instructors.id',
                'instructors.user_id',
                'instructors.achievements',
                'instructors.profile_path',
                'instructors.created_at',
                'instructors.updated_at',
            ])
            ->orderBy('users.name')
            ->orderByDesc('instructors.id');

        $term = $search !== null ? trim($search) : '';
        if ($term !== '') {
            $like = '%'.addcslashes($term, '%_\\').'%';
            $query->where(function ($q) use ($like) {
                $q->where('instructors.achievements', 'like', $like)
                    ->orWhere('users.name', 'like', $like)
                    ->orWhere('users.email', 'like', $like)
                    ->orWhere('users.status', 'like', $like);
            });
        }

        /** @var LengthAwarePaginator<int, Instructor> $paginator */
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => $paginator->getCollection()
                ->map(fn (Instructor $i) => $this->formatInstructor($i))
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
