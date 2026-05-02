<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Concerns\ResolvesLmsActor;
use App\Http\Controllers\Controller;
use App\Models\LessonMaterial;
use App\Models\Module;
use App\Models\ModuleResource;
use App\Services\LmsCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LmsLessonMaterialController extends Controller
{
    use ResolvesLmsActor;

    public function storeForModule(Request $request, string $modulePublicId): JsonResponse
    {
        $this->lmsActor();

        /** @var Module $module */
        $module = Module::query()->where('public_id', $modulePublicId)->firstOrFail();

        return $this->persistUpload($request, $module->id, null);
    }

    public function storeForStandaloneLesson(Request $request, string $publicId): JsonResponse
    {
        $this->lmsActor();

        /** @var ModuleResource $resource */
        $resource = ModuleResource::query()
            ->where('public_id', $publicId)
            ->where('is_standalone_lesson', true)
            ->firstOrFail();

        return $this->persistUpload($request, null, $resource->id);
    }

    public function destroy(string $publicId): JsonResponse
    {
        $actor = $this->lmsActor();

        /** @var LessonMaterial $row */
        $row = LessonMaterial::query()->where('public_id', $publicId)->firstOrFail();

        if (Storage::disk('local')->exists($row->storage_path)) {
            Storage::disk('local')->delete($row->storage_path);
        }

        $row->delete();

        LmsCatalogService::bustUserAnalyticsCache($actor->id);

        return response()->json(['ok' => true]);
    }

    /** Stream the binary for instructor authoring (authenticated). */
    public function download(string $publicId): StreamedResponse|\Illuminate\Http\Response
    {
        $this->lmsActor();

        /** @var LessonMaterial $row */
        $row = LessonMaterial::query()->where('public_id', $publicId)->firstOrFail();

        if (! Storage::disk('local')->exists($row->storage_path)) {
            return response()->json(['message' => 'File missing on storage.'], 404);
        }

        return Storage::disk('local')->download($row->storage_path, $row->original_name);
    }

    protected function persistUpload(Request $request, ?int $moduleId, ?int $moduleResourceId): JsonResponse
    {
        $actor = $this->lmsActor();

        if (($moduleId === null) === ($moduleResourceId === null)) {
            return response()->json(['message' => 'Invalid attachment target.'], 422);
        }

        $request->validate([
            'file' => ['required', 'file', 'max:20480'],
        ]);

        $uploaded = $request->file('file');

        $stored = Storage::disk('local')->putFile(
            match (true) {
                $moduleId !== null => 'lesson-materials/modules',
                default => 'lesson-materials/standalone',
            },
            $uploaded
        );

        $material = LessonMaterial::query()->create([
            'public_id' => (string) Str::uuid(),
            'module_id' => $moduleId,
            'module_resource_id' => $moduleResourceId,
            'original_name' => $uploaded->getClientOriginalName() ?: ('file-'.$uploaded->hashName()),
            'storage_path' => $stored,
            'mime' => $uploaded->getMimeType(),
            'size_bytes' => (int) $uploaded->getSize(),
        ]);

        LmsCatalogService::bustUserAnalyticsCache($actor->id);

        return response()->json([
            'data' => [
                'id' => $material->public_id,
                'name' => $material->original_name,
                'mime' => $material->mime,
                'sizeBytes' => (int) $material->size_bytes,
            ],
        ], 201);
    }
}
