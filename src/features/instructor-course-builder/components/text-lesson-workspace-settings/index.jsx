import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';

export function TextLessonWorkspaceSettings({
  duration = '',
  onDurationChange,
  lessonPreview,
  onLessonPreviewChange,
  unlockAfterPurchase,
  onUnlockAfterPurchaseChange,
  startDate,
  onStartDateChange,
  startTime,
  onStartTimeChange,
  /** When true, omit the lesson duration field (e.g. video lesson supplies duration above). */
  hideDuration = false,
}) {
  return (
    <Stack sx={styles.root}>
      {!hideDuration ? (
        <Box>
          <Typography sx={styles.fieldLabel}>Lesson duration</Typography>
          <TextField
            fullWidth
            size="small"
            value={duration}
            onChange={(e) => onDurationChange?.(e.target.value)}
            placeholder="Example: 2h 45m"
          />
        </Box>
      ) : null}

      <Stack direction="row" sx={styles.previewRow}>
        <Stack direction="row" alignItems="center" sx={styles.toggleRow} flexWrap="nowrap">
          <Switch
            size="small"
            checked={lessonPreview}
            onChange={(e) => onLessonPreviewChange(e.target.checked)}
            color="primary"
            sx={styles.switch}
          />
          <Typography component="span" sx={styles.toggleLabel} whiteSpace="nowrap">
            Lesson preview
          </Typography>
          <Tooltip title="Allow learners to preview part of this lesson before enrolling.">
            <IconButton size="small" sx={styles.infoButton} aria-label="About lesson preview">
              <Iconify icon="solar:info-circle-bold" width={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Stack direction="row" sx={styles.toggleRowAlignStart}>
          <Switch
            size="small"
            checked={unlockAfterPurchase}
            onChange={(e) => onUnlockAfterPurchaseChange(e.target.checked)}
            color="primary"
            sx={styles.switch}
          />
        <Typography sx={[styles.toggleLabel, styles.toggleLabelFill]}>
          Unlock the lesson after a certain time after the purchase
        </Typography>
      </Stack>

      <Stack sx={styles.row}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={styles.fieldLabel}>Lesson start date</Typography>
          <DatePicker
            value={startDate}
            onChange={onStartDateChange}
            format="MM/DD/YYYY"
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                placeholder: 'Select Date',
              },
            }}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={styles.fieldLabel}>Lesson start time</Typography>
          <TimePicker
            value={startTime}
            onChange={onStartTimeChange}
            ampm
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                placeholder: 'HH:MM',
              },
            }}
          />
        </Box>
      </Stack>
    </Stack>
  );
}
