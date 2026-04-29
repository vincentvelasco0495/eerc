import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';
import { curriculumLessonTypePickerGroups } from '../../instructor-course-curriculum-data';

export function CurriculumSelectLessonTypeDialog({ open, onClose, onSelectType }) {
  const handlePick = useCallback(
    (type) => {
      onSelectType?.(type);
      onClose?.();
    },
    [onClose, onSelectType]
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="body"
      slotProps={{
        backdrop: { sx: { bgcolor: 'rgba(15, 23, 42, 0.45)' } },
      }}
      PaperProps={{ sx: styles.paper }}
    >
      <DialogTitle component="div" sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 1.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Box sx={styles.titleBlock}>
            <Typography component="span" sx={styles.title}>
              Select lesson type
            </Typography>
            <Typography sx={styles.subtitle}>Select material type to continue</Typography>
          </Box>
          <IconButton
            aria-label="Close"
            onClick={onClose}
            size="small"
            sx={styles.closeButton}
          >
            <Iconify icon="mingcute:close-line" width={22} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={styles.content}>
        {curriculumLessonTypePickerGroups.map((group) => (
          <Box key={group.id} sx={styles.section}>
            <Typography sx={styles.sectionLabel}>{group.label}</Typography>
            <Box sx={styles.tileGrid}>
              {group.options.map((opt) => (
                <Box
                  key={opt.type}
                  component="button"
                  type="button"
                  onClick={() => handlePick(opt.type)}
                  sx={(theme) => styles.tile(theme)}
                >
                  <Iconify icon={opt.icon} width={36} sx={styles.tileIcon} />
                  <Typography sx={styles.tileLabel}>{opt.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
}
