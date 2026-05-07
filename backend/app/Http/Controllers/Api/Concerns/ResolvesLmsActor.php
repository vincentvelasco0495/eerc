<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\User;

trait ResolvesLmsActor
{
    /**
     * LMS actor for request context.
     *
     * - When authenticated (Sanctum), returns the logged-in user.
     * - When unauthenticated (public catalog reads), returns a "guest actor" (id=0) so
     *   serializers still work but user-specific progress/attempts are empty.
     */
    protected function lmsActor(): User
    {
        $user = request()->user();

        if ($user instanceof User) {
            return $user;
        }

        $guest = new User();
        $guest->id = 0;
        $guest->role = 'guest';
        $guest->name = 'Guest';

        return $guest;
    }
}
