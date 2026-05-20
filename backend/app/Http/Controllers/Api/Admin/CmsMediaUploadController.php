<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\Concerns\ResolvesLmsActor;
use App\Http\Controllers\Controller;
use App\Models\CmsMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CmsMediaUploadController extends Controller
{
    use ResolvesLmsActor;

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,webp|max:10240',
            'alt' => 'nullable|string|max:255',
        ]);

        $file = $validated['file'];
        $user = $this->lmsActor();

        $stored = Storage::disk('public')->putFile('cms/homepage-v2', $file);
        $url = Storage::disk('public')->url($stored);

        $media = CmsMedia::query()->create([
            'public_id' => 'media-'.Str::lower(Str::ulid()),
            'uploaded_by' => $user->id,
            'disk' => 'public',
            'path' => $stored,
            'url' => $url,
            'filename' => basename($stored),
            'original_name' => $file->getClientOriginalName() ?: basename($stored),
            'mime' => $file->getMimeType(),
            'size_bytes' => (int) $file->getSize(),
            'alt' => $validated['alt'] ?? null,
        ]);

        return response()->json(['data' => $this->formatMedia($media)], 201);
    }

    public function destroy(string $publicId): JsonResponse
    {
        $media = CmsMedia::query()->where('public_id', $publicId)->first();

        if ($media === null) {
            return response()->json(['message' => 'Media not found.'], 404);
        }

        if ($media->disk && $media->path && Storage::disk($media->disk)->exists($media->path)) {
            Storage::disk($media->disk)->delete($media->path);
        }

        $media->delete();

        return response()->json(['ok' => true]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function formatMedia(CmsMedia $media): array
    {
        return [
            'id' => $media->public_id,
            'url' => $media->url,
            'filename' => $media->filename,
            'originalName' => $media->original_name,
            'mime' => $media->mime,
            'size' => (int) $media->size_bytes,
            'alt' => $media->alt,
        ];
    }
}
