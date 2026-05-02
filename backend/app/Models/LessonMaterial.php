<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonMaterial extends Model
{
    protected $fillable = [
        'public_id',
        'module_id',
        'module_resource_id',
        'original_name',
        'storage_path',
        'mime',
        'size_bytes',
    ];

    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
        ];
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'module_id');
    }

    public function moduleResource(): BelongsTo
    {
        return $this->belongsTo(ModuleResource::class, 'module_resource_id');
    }
}
