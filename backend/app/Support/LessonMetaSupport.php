<?php

namespace App\Support;

class LessonMetaSupport
{
    /** @param  array<string, mixed>|null  $meta */
    public static function sanitize(?array $meta): ?array
    {
        if ($meta === null) {
            return null;
        }

        unset(
            $meta['videoPosterLessonMaterialPublicId'],
            $meta['video_poster_lesson_material_public_id'],
            $meta['startDate'],
            $meta['start_date'],
            $meta['startTime'],
            $meta['start_time'],
            $meta['videoWidthPx'],
            $meta['video_width_px'],
            $meta['unlockAfterPurchase'],
            $meta['unlock_after_purchase'],
        );

        return $meta;
    }
}
