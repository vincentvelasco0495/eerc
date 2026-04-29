import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';

/**
 * Cover + profile header: dashed empty cover, upload control, avatar centered
 * on the cover bottom (half the circle above the line, half below).
 */
export function InstructorSettingsBannerAvatar({ initials }) {
  return (
    <Box sx={styles.root}>
      <Box sx={styles.cover}>
        <Button
          type="button"
          variant="contained"
          size="small"
          startIcon={<Iconify icon="solar:cloud-upload-bold" width={20} />}
          aria-label="Upload cover photo"
          sx={styles.uploadCover}
        >
          Upload Cover
        </Button>

        <Box sx={styles.avatarAnchor}>
          <Box sx={styles.avatarInner}>
            <Avatar alt="Instructor" sx={styles.avatar}>
              {initials}
            </Avatar>
            <IconButton
              type="button"
              size="small"
              color="primary"
              aria-label="Change profile photo"
              sx={styles.avatarEditBtn}
            >
              <Iconify icon="solar:camera-bold" width={18} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
