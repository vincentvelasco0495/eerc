import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';

const SOURCE_OPTIONS = [{ value: 'html-mp4', label: 'HTML (MP4)' }];

function MediaDropzone({
  accept,
  hint,
  buttonLabel,
  icon,
  onFiles,
  isVideo = false,
}) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      onFiles?.(acceptedFiles);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept,
  });

  return (
    <Box
      {...getRootProps()}
      sx={[
        (theme) => styles.dropzone(theme),
        isDragActive ? (theme) => styles.dropzoneActive(theme) : null,
      ]}
    >
      <input {...getInputProps()} />
      <Iconify
        icon={icon}
        width={isVideo ? 44 : 40}
        sx={{ color: isVideo ? 'text.secondary' : 'primary.main' }}
      />
      <Typography sx={styles.hint}>{hint}</Typography>
      <Button variant="contained" color="primary" sx={styles.actionButton}>
        {buttonLabel}
      </Button>
    </Box>
  );
}

export function VideoLessonWorkspaceFields({
  sourceType,
  onSourceTypeChange,
  videoWidth,
  onVideoWidthChange,
  duration,
  onDurationChange,
  onPosterFiles,
  onVideoFiles,
}) {
  return (
    <Stack sx={styles.root}>
      <Box>
        <Typography sx={styles.fieldLabel}>Source type</Typography>
        <FormControl fullWidth size="small">
          <Select
            value={sourceType}
            onChange={(e) => onSourceTypeChange(e.target.value)}
            displayEmpty
          >
            {SOURCE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box>
        <Typography sx={styles.fieldLabel}>Lesson video poster</Typography>
        <MediaDropzone
          accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
          hint="Drag and drop an image or upload it from your computer"
          buttonLabel="Upload an image"
          icon="solar:gallery-bold"
          onFiles={onPosterFiles}
        />
      </Box>

      <Box>
        <Typography sx={styles.fieldLabel}>Lesson video</Typography>
        <MediaDropzone
          accept={{ 'video/*': ['.mp4', '.webm', '.ogg'] }}
          hint="Drag & drop a video here or browse it from your computer"
          buttonLabel="Browse files"
          icon="solar:video-frame-play-horizontal-bold"
          onFiles={onVideoFiles}
          isVideo
        />
      </Box>

      <Stack sx={styles.row}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={styles.fieldLabel}>Video width (px)</Typography>
          <TextField
            fullWidth
            size="small"
            value={videoWidth}
            onChange={(e) => onVideoWidthChange(e.target.value)}
            placeholder="e.g. 1280"
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={styles.fieldLabel}>Lesson duration</Typography>
          <TextField
            fullWidth
            size="small"
            value={duration}
            onChange={(e) => onDurationChange(e.target.value)}
            placeholder="Example: 2h 45m"
          />
        </Box>
      </Stack>
    </Stack>
  );
}
