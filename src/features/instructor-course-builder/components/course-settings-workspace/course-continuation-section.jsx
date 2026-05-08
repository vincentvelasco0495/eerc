import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Editor } from 'src/components/editor';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { css } from './styles';

export function CourseContinuationSection({
  learnHtml,
  onLearnHtmlChange,
  previewDescription,
  onPreviewDescriptionChange,
  featuredCourse,
  onFeaturedCourseChange,
  lockLessonsInOrder,
  onLockLessonsInOrderChange,
  onSave,
  hideEmbeddedSaveFooter = false,
}) {
  return (
    <>
      <Divider sx={css.dividerSection} component="hr" />

      <Typography sx={css.sectionHeadingMuted} component="h2">
        What you&apos;ll learn
      </Typography>
      <Editor
        value={learnHtml}
        onChange={onLearnHtmlChange}
        chrome="tinymce"
        sx={{
          mt: 1,
          minHeight: 220,
          maxHeight: 420,
        }}
        tinymceResizeBounds={{ min: 100, max: 320 }}
      />

      <Box sx={{ mt: 3 }}>
        <Typography sx={css.fieldLabel} component="label" htmlFor="course-preview-description">
          Course preview description
        </Typography>
        <TextField
          id="course-preview-description"
          multiline
          minRows={5}
          fullWidth
          value={previewDescription}
          onChange={(e) => onPreviewDescriptionChange(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              alignItems: 'flex-start',
            },
          }}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <StackedToggleRow
          checked={featuredCourse}
          onChange={(e) => onFeaturedCourseChange(e.target.checked)}
          label="Featured course"
          info="Feature this course in catalog highlights (subject to quota)."
        />

        <StackedToggleRow
          checked={lockLessonsInOrder}
          onChange={(e) => onLockLessonsInOrderChange(e.target.checked)}
          label="Lock lessons in order"
          info="Learners must finish lessons sequentially before unlocking the next."
        />

        {featuredCourse ? (
          <Alert severity="warning" icon={<Iconify icon="solar:danger-circle-bold" width={22} />} sx={css.quotaAlert}>
            You have reached your featured courses quota limit!
          </Alert>
        ) : null}
      </Box>

      {!hideEmbeddedSaveFooter ? (
        <Box sx={css.footerRow}>
          <Button
            variant="contained"
            color="primary"
            sx={css.saveBtn}
            onClick={() => {
              onSave?.();
              toast.success('Course settings saved (demo).');
            }}
          >
            Save
          </Button>
        </Box>
      ) : null}
    </>
  );
}

function StackedToggleRow({ checked, onChange, label, info }) {
  return (
    <FormControlLabel
      sx={{
        m: 0,
        mr: 'auto!important',
        alignItems: 'flex-start',
        gap: 0.75,
        py: 0.75,
        '& .MuiFormControlLabel-label': {
          mt: 0.5,
          fontWeight: 500,
          fontSize: 14,
          color: 'text.primary',
        },
      }}
      control={<Switch checked={checked} color="primary" onChange={onChange} />}
      label={
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35 }}>
          <Typography component="span" fontWeight={500} fontSize={14}>
            {label}
          </Typography>
          <Tooltip title={info}>
            <IconButton size="small" aria-label={`About ${label}`} sx={{ p: 0.25 }}>
              <Iconify icon="solar:info-circle-bold" width={20} sx={{ color: 'primary.main' }} />
            </IconButton>
          </Tooltip>
        </Box>
      }
    />
  );
}
