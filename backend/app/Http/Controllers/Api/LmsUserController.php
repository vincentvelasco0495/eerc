<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesLmsActor;
use App\Http\Controllers\Controller;
use App\Services\LmsCatalogService;
use Illuminate\Http\JsonResponse;

class LmsUserController extends Controller
{
    use ResolvesLmsActor;

    public function show(LmsCatalogService $catalog): JsonResponse
    {
        $user = $this->lmsActor()->load(['lmsProfile.program', 'badges']);

        return response()->json($catalog->userPayload($user));
    }
}
