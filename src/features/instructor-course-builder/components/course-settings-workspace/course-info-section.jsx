import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';

import { CONFIG } from 'src/global-config';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';

import { css } from './styles';

function resolveServerAssetUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (/^(https?:\/\/|blob:|data:)/i.test(raw)) return raw;

  const configured = String(CONFIG.serverUrl ?? '').trim();
  const fallback =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : '';
  const origin = configured || fallback;
  if (!origin) return raw;

  if (raw.startsWith('/')) {
    return `${origin}${raw}`;
  }
  return `${origin}/storage/${raw.replace(/^\/+/, '')}`;
}

export function CourseInfoSection({
  courseName,
  onCourseNameChange,
  slug,
  onSlugChange,
  slugReadOnly = false,
  fullCourseUrlPrefix,
  programId,
  onProgramIdChange,
  programDisabled = false,
  programOptions = [],
  onBannerImageFileChange,
  ownerName,
  instructor = '',
  instructorOptions = [],
  onInstructorChange,
  courseCoverSrc,
  courseDuration,
  onCourseDurationChange,
  videoDuration,
  onVideoDurationChange,
  descriptionHtml,
  onDescriptionHtmlChange,
}) {
  const displayUrlPrefix = `${fullCourseUrlPrefix.replace(/\/$/, '')}/`;
  const coverSrcResolved = resolveServerAssetUrl(courseCoverSrc);

  return (
    <>
      <Typography sx={css.pageTitle} component="h1">
        Main
      </Typography>

      <Typography sx={css.sectionHeadingCourseInfo} component="h2">
        Course info
      </Typography>

      <Box>
        <Typography sx={css.fieldLabel} component="label" htmlFor="course-name-settings">
          Course name
        </Typography>
        <TextField
          id="course-name-settings"
          fullWidth
          size="small"
          value={courseName}
          onChange={(e) => onCourseNameChange(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />
      </Box>

      <Box sx={{ mt: 2.5 }}>
        <Typography sx={css.fieldLabel} component="label" htmlFor="course-slug">
          Url:
        </Typography>
        <Typography sx={css.urlHelper}>{displayUrlPrefix}</Typography>
        <TextField
          id="course-slug"
          fullWidth
          size="small"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          disabled={slugReadOnly}
          InputProps={{
            readOnly: slugReadOnly,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" edge="end" aria-label="Edit slug">
                  <Iconify icon="solar:pen-bold" width={20} sx={{ opacity: 0.55 }} />
                </IconButton>
              </InputAdornment>
            ),
            sx: { borderRadius: '8px' },
          }}
        />
      </Box>

      <Box sx={{ mt: 2.5 }}>
        <Typography sx={css.fieldLabel}>Programs</Typography>
        <FormControl fullWidth size="small" disabled={programDisabled}>
          <Select
            value={programId}
            onChange={(e) => onProgramIdChange(e.target.value)}
            sx={{ borderRadius: '8px' }}
          >
            {programOptions.map((o) => (
              <MenuItem key={o.id} value={o.id} disabled={o.disabled}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2.5} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography sx={css.fieldLabel}>Owner</Typography>
          <Box sx={css.avatarWithName}>
            <Avatar sx={{ bgcolor: 'primary.dark', fontWeight: 700, width: 44, height: 44 }}>
              {ownerName
                ?.trim()
                .split(/\s/)
                .map((w) => w[0])
                .join('')
                .slice(0, 2) || 'DI'}
            </Avatar>
            <Typography fontWeight={600} fontSize={15}>
              {ownerName || 'Demo Instructor'}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography sx={css.fieldLabel}>Instructor</Typography>
          <FormControl fullWidth size="small">
            <Select
              displayEmpty
              value={instructor}
              onChange={(e) => onInstructorChange?.(String(e.target.value))}
              renderValue={(selected) => (selected ? String(selected) : 'Choose instructor')}
              sx={{ borderRadius: '8px' }}
            >
              {instructorOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2.5 }}>
        <Typography sx={css.fieldLabel}>Banner image</Typography>
        <Button variant="outlined" component="label" sx={{ borderRadius: '8px' }}>
          Upload banner image
          <input
            type="file"
            hidden
            accept="image/*"
            onClick={(event) => {
              event.currentTarget.value = '';
            }}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              if (!file) return;
              onBannerImageFileChange?.(file);
            }}
          />
        </Button>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography sx={css.fieldLabel}>Image</Typography>
        <Box sx={css.imageDropzone}>
          <Box
            component="img"
            alt=""
            src={coverSrcResolved}
            sx={{ width: 1, maxHeight: 320, objectFit: 'cover' }}
          />
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography sx={css.fieldLabel} component="label" htmlFor="course-duration-setting">
            Course duration
          </Typography>
          <TextField
            id="course-duration-setting"
            fullWidth
            size="small"
            value={courseDuration}
            onChange={(e) => onCourseDurationChange(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography sx={css.fieldLabel} component="label" htmlFor="video-duration-setting">
            Video duration
          </Typography>
          <TextField
            id="video-duration-setting"
            fullWidth
            size="small"
            value={videoDuration}
            onChange={(e) => onVideoDurationChange(e.target.value)}
          />
        </Grid>
      </Grid>

      <Typography sx={[css.sectionHeadingMuted, { mt: 4 }]} component="h2">
        Description
      </Typography>
      <Editor
        value={descriptionHtml}
        onChange={onDescriptionHtmlChange}
        chrome="tinymce"
        sx={{
          mt: 1,
          minHeight: 280,
          maxHeight: 520,
        }}
        tinymceResizeBounds={{
          min: 120,
          max: 400,
        }}
      />
    </>
  );
}
