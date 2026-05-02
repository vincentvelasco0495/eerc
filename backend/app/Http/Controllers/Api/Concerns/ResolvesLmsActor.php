<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\User;

trait ResolvesLmsActor
{
    /** Authenticated LMS user (routes must use `auth:sanctum`). */
    protected function lmsActor(): User
    {
        $user = request()->user();

        if (! $user instanceof User) {
            abort(401, 'Unauthenticated.');
        }

        return $user;
    }
}
