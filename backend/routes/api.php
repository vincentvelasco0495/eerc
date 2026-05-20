<?php

use App\Http\Controllers\Api\AboutPageContentController;
use App\Http\Controllers\Api\Admin\AboutPageContentAdminController;
use App\Http\Controllers\Api\Admin\ContactFeedbackAdminController;
use App\Http\Controllers\Api\Admin\ContactPageContentAdminController;
use App\Http\Controllers\Api\ContactFeedbackController;
use App\Http\Controllers\Api\ContactPageContentController;
use App\Http\Controllers\Api\Admin\CmsMediaUploadController;
use App\Http\Controllers\Api\Admin\HomepageContentAdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HomepageContentController;
use App\Http\Controllers\Api\LmsAdminSummaryController;
use App\Http\Controllers\Api\LmsAnalyticsController;
use App\Http\Controllers\Api\LmsCourseController;
use App\Http\Controllers\Api\LmsLeaderboardController;
use App\Http\Controllers\Api\LmsMetaController;
use App\Http\Controllers\Api\LmsInstructorController;
use App\Http\Controllers\Api\LmsStudentController;
use App\Http\Controllers\Api\LmsProgramController;
use App\Http\Controllers\Api\LmsQuizResultController;
use App\Http\Controllers\Api\LmsUserController;
use App\Http\Controllers\Api\V1\LmsAdminUploadController;
use App\Http\Controllers\Api\V1\LmsEnrollmentController;
use App\Http\Controllers\Api\V1\LmsModuleController;
use App\Http\Controllers\Api\V1\LmsLessonMaterialController;
use App\Http\Controllers\Api\V1\LmsQuizController;
use App\Http\Controllers\Api\V1\LmsLessonProgressController;
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

// Public catalog reads (DB-backed) — no login required.
Route::get('/meta', [LmsMetaController::class, 'show']);
Route::get('/programs', [LmsProgramController::class, 'index']);
Route::get('/programs/{programPublicId}/stats', [LmsProgramController::class, 'stats']);
Route::get('/courses', [LmsCourseController::class, 'index']);
Route::get('/courses/{courseLookup}/detail', [LmsCourseController::class, 'show']);
Route::get('/courses/{coursePublicId}/stats', [LmsCourseController::class, 'stats']);
Route::get('/modules', [LmsModuleController::class, 'index']);
Route::get('/quizzes', [LmsQuizController::class, 'index']);
Route::get('/homepage-v2', [HomepageContentController::class, 'show']);
Route::get('/about-us', [AboutPageContentController::class, 'show']);
Route::get('/contact-page', [ContactPageContentController::class, 'show']);

Route::middleware('throttle:10,1')->post('/contact-feedback', [ContactFeedbackController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', [LmsUserController::class, 'show']);
    Route::patch('/user', [LmsUserController::class, 'update']);
    Route::get('/instructors', [LmsInstructorController::class, 'index']);

    Route::middleware('page:/setting-program')->group(function () {
        Route::post('/programs', [LmsProgramController::class, 'store']);
        Route::patch('/programs/{programPublicId}', [LmsProgramController::class, 'update']);
        Route::delete('/programs/{programPublicId}', [LmsProgramController::class, 'destroy']);
    });

    Route::middleware('page:/setting-instructor')->group(function () {
        Route::get('/instructors/linkable-users', [LmsInstructorController::class, 'linkableUsers']);
        Route::post('/instructors', [LmsInstructorController::class, 'store']);
        Route::patch('/instructors/{userPublicUid}', [LmsInstructorController::class, 'update']);
        Route::delete('/instructors/{userPublicUid}', [LmsInstructorController::class, 'destroy']);
    });

    Route::middleware('page:/setting-student')->group(function () {
        Route::get('/students/linkable-users', [LmsStudentController::class, 'linkableUsers']);
        Route::get('/students', [LmsStudentController::class, 'index']);
        Route::post('/students', [LmsStudentController::class, 'store']);
        Route::patch('/students/{userPublicUid}', [LmsStudentController::class, 'update']);
        Route::delete('/students/{userPublicUid}', [LmsStudentController::class, 'destroy']);
    });
    Route::post('/courses', [LmsCourseController::class, 'store']);
    Route::post('/courses/{coursePublicId}/modules', [LmsModuleController::class, 'store']);
    Route::patch('/courses/{coursePublicId}/modules/reorder', [LmsModuleController::class, 'reorder']);
    Route::patch('/modules/{modulePublicId}/lessons/reorder', [LmsModuleController::class, 'reorderLessons']);
    Route::post('/modules/{modulePublicId}/standalone-lessons', [LmsModuleController::class, 'storeStandaloneLesson']);
    Route::patch('/standalone-lessons/{publicId}', [LmsModuleController::class, 'updateStandaloneLesson']);
    Route::delete('/standalone-lessons/{publicId}', [LmsModuleController::class, 'destroyStandaloneLesson']);
    Route::patch('/courses/{publicId}', [LmsCourseController::class, 'update']);
    Route::get('/enrollments', [LmsEnrollmentController::class, 'index']);
    Route::post('/modules/{modulePublicId}/quizzes', [LmsQuizController::class, 'storeForModule']);
    Route::patch('/quizzes/{publicId}', [LmsQuizController::class, 'update']);
    Route::get('/courses/{coursePublicId}/lesson-progress', [LmsLessonProgressController::class, 'index']);
    Route::post('/courses/{coursePublicId}/lesson-progress', [LmsLessonProgressController::class, 'complete']);
    Route::get('/quiz-results', [LmsQuizResultController::class, 'index']);
    Route::get('/leaderboard', [LmsLeaderboardController::class, 'show']);
    Route::get('/analytics', [LmsAnalyticsController::class, 'show']);
    Route::get('/admin', [LmsAdminSummaryController::class, 'show']);

    Route::post('/enrollments', [LmsEnrollmentController::class, 'store']);
    Route::get('/enrollments/{publicId}/payment-proof', [LmsEnrollmentController::class, 'downloadPaymentProof']);
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

    Route::middleware('page:/feedback')->group(function () {
        Route::get('/admin/contact-feedback', [ContactFeedbackAdminController::class, 'index']);
    });

    Route::middleware('page:/content-management')->group(function () {
        Route::get('/admin/homepage-v2', [HomepageContentAdminController::class, 'show']);
        Route::put('/admin/homepage-v2/{section}', [HomepageContentAdminController::class, 'update']);
        Route::post('/admin/homepage-v2/publish-all', [HomepageContentAdminController::class, 'publishAll']);
        Route::get('/admin/about-us', [AboutPageContentAdminController::class, 'show']);
        Route::put('/admin/about-us/{section}', [AboutPageContentAdminController::class, 'update']);
        Route::post('/admin/about-us/publish-all', [AboutPageContentAdminController::class, 'publishAll']);
        Route::get('/admin/contact-page', [ContactPageContentAdminController::class, 'show']);
        Route::put('/admin/contact-page/{section}', [ContactPageContentAdminController::class, 'update']);
        Route::post('/admin/contact-page/publish-all', [ContactPageContentAdminController::class, 'publishAll']);
        Route::post('/admin/upload', [CmsMediaUploadController::class, 'store']);
        Route::delete('/admin/media/{publicId}', [CmsMediaUploadController::class, 'destroy']);
    });
});
