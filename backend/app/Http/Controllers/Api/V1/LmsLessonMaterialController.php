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
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LmsLessonMaterialController extends Controller
{
    use ResolvesLmsActor;

    public function storeForModule(Request $request, string $modulePublicId): JsonResponse
    {
        $this->lmsActor();

        /** @var Module $module */
        $module = Module::query()->where('public_id', $modulePublicId)->firstOrFail();

        $request->validate([
            'moduleResourcePublicId' => ['sometimes', 'nullable', 'string', 'max:64'],
        ]);

        $resourcePublicId = $request->input('moduleResourcePublicId');
        if (! is_string($resourcePublicId) || trim($resourcePublicId) === '') {
            return $this->persistUpload($request, $module->id, null);
        }

        $resource = ModuleResource::query()
            ->where('public_id', trim($resourcePublicId))
            ->where('module_id', $module->id)
            ->first();

        // Stale client id (e.g. another course) or core lesson with no `module_resources` row yet:
        // attach to the module only (same as omitting the field).
        if ($resource === null) {
            return $this->persistUpload($request, $module->id, null);
        }

        if ($resource->is_standalone_lesson) {
            return $this->persistUpload($request, null, $resource->id);
        }

        return $this->persistUpload($request, $module->id, $resource->id);
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

        $row = LessonMaterial::query()->where('public_id', $publicId)->first();

        if ($row === null) {
            /** Idempotent: stale client meta / prior cleanup — do not 404. */
            return response()->json(['ok' => true]);
        }

        if (Storage::disk('local')->exists($row->storage_path)) {
            Storage::disk('local')->delete($row->storage_path);
        }

        $row->delete();

        LmsCatalogService::bustUserAnalyticsCache($actor->id);

        return response()->json(['ok' => true]);
    }

    /**
     * Stream lesson material bytes (authenticated).
     * Use `?inline=1` for inline playback (e.g. HTML5 video); default is attachment download.
     */
    public function download(Request $request, string $publicId): BinaryFileResponse|StreamedResponse|\Illuminate\Http\Response
    {
        $this->lmsActor();

        $row = LessonMaterial::query()->where('public_id', $publicId)->first();

        if ($row === null) {
            return response()->json(['message' => 'Lesson material not found.'], 404);
        }

        if (! Storage::disk('local')->exists($row->storage_path)) {
            return response()->json(['message' => 'File missing on storage.'], 404);
        }

        $absolutePath = Storage::disk('local')->path($row->storage_path);

        if ($request->boolean('inline')) {
            $mime = is_string($row->mime) && trim($row->mime) !== ''
                ? trim((string) $row->mime)
                : 'application/octet-stream';

            return response()->file($absolutePath, [
                'Content-Type' => $mime,
                'Content-Disposition' => 'inline',
            ]);
        }

        return Storage::disk('local')->download($row->storage_path, $row->original_name);
    }

    protected function persistUpload(Request $request, ?int $moduleId, ?int $moduleResourceId): JsonResponse
    {
        $actor = $this->lmsActor();

        if ($moduleId === null && $moduleResourceId === null) {
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
