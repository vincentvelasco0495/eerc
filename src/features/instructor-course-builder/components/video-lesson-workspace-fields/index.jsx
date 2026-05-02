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
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';

const SOURCE_OPTIONS = [{ value: 'html-mp4', label: 'HTML (MP4)' }];

function MediaDropzone({
  accept,
  hint,
  hintWhenPreview,
  uploadButtonLabel,
  replaceButtonLabel,
  icon,
  onFiles,
  isVideo = false,
  disabled = false,
  previewUrl = '',
  uploading = false,
}) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      onFiles?.(acceptedFiles);
    },
    [onFiles]
  );

  const showPreview = Boolean(previewUrl);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: false,
    accept,
    disabled: disabled || uploading,
    noClick: true,
    noKeyboard: true,
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
      <Stack sx={{ alignItems: 'center', width: 1, gap: showPreview ? 1.5 : 0 }}>
        {showPreview ? (
          <Box sx={styles.previewWrap}>
            {isVideo ? (
              <Box
                component="video"
                src={previewUrl}
                controls
                playsInline
                sx={styles.videoPreview}
                {...(previewUrl.startsWith('blob:') ? { muted: true } : {})}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Box component="img" src={previewUrl} alt="" sx={styles.posterPreview} loading="lazy" />
            )}
            {uploading ? (
              <Box sx={(theme) => styles.uploadingOverlay(theme)}>
                <CircularProgress size={40} sx={{ color: 'common.white' }} />
              </Box>
            ) : null}
          </Box>
        ) : uploading ? (
          <CircularProgress sx={{ my: 2 }} />
        ) : (
          <Iconify
            icon={icon}
            width={isVideo ? 44 : 40}
            sx={{ color: isVideo ? 'text.secondary' : 'primary.main' }}
          />
        )}

        <Typography sx={styles.hint}>{showPreview || uploading ? hintWhenPreview ?? hint : hint}</Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} sx={styles.actionRow}>
          {!showPreview && !uploading ? (
            <Button
              type="button"
              variant="contained"
              color="primary"
              sx={styles.actionButton}
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            >
              {uploadButtonLabel}
            </Button>
          ) : null}
          {showPreview && !uploading ? (
            <Button
              type="button"
              variant="outlined"
              color="primary"
              sx={styles.actionButton}
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            >
              {replaceButtonLabel}
            </Button>
          ) : null}
          {uploading ? (
            <Button type="button" variant="contained" color="primary" sx={styles.actionButton} disabled>
              Uploading…
            </Button>
          ) : null}
        </Stack>
      </Stack>
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
  posterSecondaryHint = null,
  videoSecondaryHint = null,
  posterPreviewUrl = '',
  videoPreviewUrl = '',
  posterUploading = false,
  videoUploading = false,
  onPosterRemove,
  onVideoRemove,
  showPosterRemove = false,
  showVideoRemove = false,
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
          hint="Drag and drop an image here, or use the button below to choose a file."
          hintWhenPreview="Drag and drop to replace the poster, or use Replace."
          uploadButtonLabel="Upload an image"
          replaceButtonLabel="Replace image"
          icon="solar:gallery-bold"
          onFiles={onPosterFiles}
          disabled={posterUploading}
          previewUrl={posterPreviewUrl}
          uploading={posterUploading}
        />
        {posterSecondaryHint ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
            {posterSecondaryHint}
          </Typography>
        ) : null}
        {showPosterRemove ? (
          <Button
            type="button"
            size="small"
            color="error"
            sx={{ ...styles.removeLink, mt: 0.5, alignSelf: 'flex-start' }}
            disabled={posterUploading}
            onClick={onPosterRemove}
          >
            Remove poster
          </Button>
        ) : null}
      </Box>

      <Box>
        <Typography sx={styles.fieldLabel}>Lesson video</Typography>
        <MediaDropzone
          accept={{ 'video/*': ['.mp4', '.webm', '.ogg'] }}
          hint="Drag and drop a video here, or use the button below to browse."
          hintWhenPreview="Drag and drop to replace the video file, or use Replace."
          uploadButtonLabel="Browse files"
          replaceButtonLabel="Replace video"
          icon="solar:video-frame-play-horizontal-bold"
          onFiles={onVideoFiles}
          isVideo
          disabled={videoUploading}
          previewUrl={videoPreviewUrl}
          uploading={videoUploading}
        />
        {videoSecondaryHint ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
            {videoSecondaryHint}
          </Typography>
        ) : null}
        {showVideoRemove ? (
          <Button
            type="button"
            size="small"
            color="error"
            sx={{ ...styles.removeLink, mt: 0.5, alignSelf: 'flex-start' }}
            disabled={videoUploading}
            onClick={onVideoRemove}
          >
            Remove video
          </Button>
        ) : null}
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
