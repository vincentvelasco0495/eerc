import Stack from '@mui/material/Stack';

import { TINYMCE } from './tinymce-theme';

/**
 * One horizontal strip in the toolbar. Use {@link ToolbarGroup} for clustered controls
 * and place multiple groups with {@link TINYMCE.groupGapPx} spacing.
 */
export function ToolbarRow({ children, divider = true, sx }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={[
        {
          flexWrap: 'wrap',
          rowGap: 0.75,
          columnGap: `${TINYMCE.groupGapPx}px`,
          px: 1.5,
          py: 0.75,
          minHeight: 40,
          backgroundColor: TINYMCE.chromeSurface,
          borderBottom: divider ? `1px solid ${TINYMCE.hairline}` : 'none',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Stack>
  );
}
