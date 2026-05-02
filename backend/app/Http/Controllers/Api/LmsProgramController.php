<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LmsCatalogService;
use Illuminate\Http\JsonResponse;

class LmsProgramController extends Controller
{
    public function index(LmsCatalogService $catalog): JsonResponse
    {
        return response()->json(['data' => $catalog->programs()]);
    }
}
