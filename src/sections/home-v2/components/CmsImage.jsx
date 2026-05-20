import Box from '@mui/material/Box';

import { resolveCmsMediaUrl } from 'src/features/homepage-v2/utils/resolve-cms-media-url';

import { ImagePlaceholder } from './ImagePlaceholder';

export function CmsImage({ media, label = 'Image', aspectRatio = '4 / 3', sx, imgSx }) {
  const url = resolveCmsMediaUrl(media?.url);

  if (url) {
    return (
      <Box
        component="img"
        src={url}
        alt={media?.alt || label}
        sx={[
          {
            width: 1,
            height: 1,
            objectFit: 'cover',
            display: 'block',
            aspectRatio,
            borderRadius: 3,
          },
          ...(Array.isArray(imgSx) ? imgSx : [imgSx]),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      />
    );
  }

  return <ImagePlaceholder label={label} aspectRatio={aspectRatio} sx={sx} />;
}
