<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LmsAdminSummaryController;
use App\Http\Controllers\Api\LmsAnalyticsController;
use App\Http\Controllers\Api\LmsCourseController;
use App\Http\Controllers\Api\LmsLeaderboardController;
use App\Http\Controllers\Api\LmsMetaController;
use App\Http\Controllers\Api\LmsProgramController;
use App\Http\Controllers\Api\LmsQuizResultController;
use App\Http\Controllers\Api\LmsUserController;
use App\Http\Controllers\Api\V1\LmsAdminUploadController;
use App\Http\Controllers\Api\V1\LmsEnrollmentController;
use App\Http\Controllers\Api\V1\LmsModuleController;
use App\Http\Controllers\Api\V1\LmsLessonMaterialController;
use App\Http\Controllers\Api\V1\LmsQuizController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Modular LMS JSON API. LMS routes require `Authorization: Bearer {token}`
| from Sanctum (`POST /api/login` / `/api/register`). Public: health + auth.
|--------------------------------------------------------------------------
*/

Route::get('/health', fn () => ['status' => 'ok']);

Route::middleware('throttle:12,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/signup', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', [LmsUserController::class, 'show']);
    Route::get('/meta', [LmsMetaController::class, 'show']);
    Route::get('/programs', [LmsProgramController::class, 'index']);
    Route::get('/courses', [LmsCourseController::class, 'index']);
    Route::post('/courses/{coursePublicId}/modules', [LmsModuleController::class, 'store']);
    Route::post('/modules/{modulePublicId}/standalone-lessons', [LmsModuleController::class, 'storeStandaloneLesson']);
    Route::patch('/standalone-lessons/{publicId}', [LmsModuleController::class, 'updateStandaloneLesson']);
    Route::delete('/standalone-lessons/{publicId}', [LmsModuleController::class, 'destroyStandaloneLesson']);
    Route::patch('/courses/{publicId}', [LmsCourseController::class, 'update']);
    Route::get('/enrollments', [LmsEnrollmentController::class, 'index']);
    Route::get('/modules', [LmsModuleController::class, 'index']);
    Route::post('/modules/{modulePublicId}/quizzes', [LmsQuizController::class, 'storeForModule']);
    Route::get('/quizzes', [LmsQuizController::class, 'index']);
    Route::get('/quiz-results', [LmsQuizResultController::class, 'index']);
    Route::get('/leaderboard', [LmsLeaderboardController::class, 'show']);
    Route::get('/analytics', [LmsAnalyticsController::class, 'show']);
    Route::get('/admin', [LmsAdminSummaryController::class, 'show']);

    Route::post('/enrollments', [LmsEnrollmentController::class, 'store']);
    Route::patch('/enrollments/{publicId}', [LmsEnrollmentController::class, 'updateStatus']);

    Route::get('/quizzes/{publicId}/questions', [LmsQuizController::class, 'questions']);
    Route::post('/quizzes/{publicId}/attempts', [LmsQuizController::class, 'storeAttempt']);

    Route::patch('/modules/{publicId}/visibility', [LmsModuleController::class, 'toggleVisibility']);
    Route::delete('/modules/{publicId}', [LmsModuleController::class, 'destroy']);
    Route::patch('/modules/{publicId}', [LmsModuleController::class, 'update']);

    Route::post('/modules/{modulePublicId}/lesson-materials', [LmsLessonMaterialController::class, 'storeForModule']);
    Route::post('/standalone-lessons/{publicId}/lesson-materials', [
        LmsLessonMaterialController::class,
        'storeForStandaloneLesson',
    ]);
    Route::get('/lesson-materials/{publicId}/file', [LmsLessonMaterialController::class, 'download']);
    Route::delete('/lesson-materials/{publicId}', [LmsLessonMaterialController::class, 'destroy']);

    Route::post('/admin/uploads', [LmsAdminUploadController::class, 'store']);
});
