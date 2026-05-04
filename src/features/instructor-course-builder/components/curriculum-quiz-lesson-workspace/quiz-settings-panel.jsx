import {
  useState,
  useEffect,
  forwardRef,
  useCallback,
  useImperativeHandle,
} from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Editor } from 'src/components/editor';
import { toast } from 'src/components/snackbar';

import { styles } from './styles';

const TIME_UNIT_OPTIONS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
];

const QUIZ_STYLE_OPTIONS = [{ value: 'global', label: 'Global' }];

const TOGGLE_GROUPS = [
  [
    { key: 'randomizeQuestions', label: 'Randomize questions' },
    { key: 'showCorrectAnswer', label: 'Show correct answer' },
    { key: 'retakeAfterPass', label: 'Retake After Pass' },
  ],
  [
    { key: 'randomizeAnswers', label: 'Randomize answers' },
    { key: 'quizAttemptHistory', label: 'Quiz Attempt History' },
    { key: 'limitedRetakeAttempts', label: 'Limited attempts to retake quizzes' },
  ],
];

const DEFAULT_TOGGLES = {
  randomizeQuestions: false,
  showCorrectAnswer: false,
  retakeAfterPass: false,
  randomizeAnswers: false,
  quizAttemptHistory: false,
  limitedRetakeAttempts: false,
};

function hydrateFromAuthoring(authoring) {
  if (!authoring || typeof authoring !== 'object') {
    return {
      shortDescription: '',
      duration: 80,
      timeUnit: 'minutes',
      quizStyle: 'global',
      passingGrade: 0,
      pointsCutAfterRetake: '',
      toggles: { ...DEFAULT_TOGGLES },
      lessonContentHtml: '',
    };
  }

  const tu =
    authoring.timeUnit === 'hours' || authoring.timeUnit === 'minutes'
      ? authoring.timeUnit
      : 'minutes';
  const dur =
    typeof authoring.duration === 'number' && !Number.isNaN(authoring.duration)
      ? authoring.duration
      : typeof authoring.durationMinutes === 'number'
        ? authoring.durationMinutes
        : 80;

  const pc = authoring.pointsCutAfterRetake;
  const pointsStr =
    pc === null || pc === undefined || Number.isNaN(Number(pc)) ? '' : String(pc);

  return {
    shortDescription: typeof authoring.shortDescription === 'string' ? authoring.shortDescription : '',
    duration: Math.max(0, dur),
    timeUnit: tu,
    quizStyle: typeof authoring.quizStyle === 'string' && authoring.quizStyle ? authoring.quizStyle : 'global',
    passingGrade:
      typeof authoring.passingGrade === 'number' && !Number.isNaN(authoring.passingGrade)
        ? authoring.passingGrade
        : 0,
    pointsCutAfterRetake: pointsStr,
    toggles: {
      randomizeQuestions: Boolean(authoring.randomizeQuestions),
      showCorrectAnswer: Boolean(authoring.showCorrectAnswer),
      retakeAfterPass: Boolean(authoring.retakeAfterPass),
      randomizeAnswers: Boolean(authoring.randomizeAnswers),
      quizAttemptHistory: Boolean(authoring.quizAttemptHistory),
      limitedRetakeAttempts: Boolean(authoring.limitedRetakeAttempts),
    },
    lessonContentHtml:
      typeof authoring.lessonContentHtml === 'string' ? authoring.lessonContentHtml : '',
  };
}

export const QuizSettingsPanel = forwardRef(function QuizSettingsPanel(
  { lesson, liveAuthoring, saveLiveQuizSettings, onLessonSave, onSavingChange },
  ref
) {
  const [shortDescription, setShortDescription] = useState('');
  const [duration, setDuration] = useState(80);
  const [timeUnit, setTimeUnit] = useState('minutes');
  const [quizStyle, setQuizStyle] = useState('global');
  const [passingGrade, setPassingGrade] = useState(0);
  const [pointsCutAfterRetake, setPointsCutAfterRetake] = useState('');

  const [toggles, setToggles] = useState({ ...DEFAULT_TOGGLES });

  const [lessonContentHtml, setLessonContentHtml] = useState('');
  const [saving, setSaving] = useState(false);

  const live = typeof saveLiveQuizSettings === 'function';

  useEffect(() => {
    const h = hydrateFromAuthoring(live ? liveAuthoring : null);
    setShortDescription(h.shortDescription);
    setDuration(h.duration);
    setTimeUnit(h.timeUnit);
    setQuizStyle(h.quizStyle);
    setPassingGrade(h.passingGrade);
    setPointsCutAfterRetake(h.pointsCutAfterRetake);
    setToggles(h.toggles);
    setLessonContentHtml(h.lessonContentHtml);
  }, [lesson.id, live, liveAuthoring]);

  useEffect(() => {
    onSavingChange?.(saving);
    return () => onSavingChange?.(false);
  }, [saving, onSavingChange]);

  const handleToggle = useCallback((key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const buildPayload = useCallback(() => {
    const tu = timeUnit === 'hours' || timeUnit === 'minutes' ? timeUnit : 'minutes';
    const pointsTrim = String(pointsCutAfterRetake).trim();
    return {
      shortDescription,
      lessonContentHtml,
      duration: Math.max(0, Number(duration) || 0),
      timeUnit: tu,
      quizStyle: quizStyle || 'global',
      passingGrade: Math.min(100, Math.max(0, Number(passingGrade) || 0)),
      pointsCutAfterRetake: pointsTrim === '' ? null : Number(pointsTrim),
      randomizeQuestions: toggles.randomizeQuestions,
      randomizeAnswers: toggles.randomizeAnswers,
      showCorrectAnswer: toggles.showCorrectAnswer,
      quizAttemptHistory: toggles.quizAttemptHistory,
      retakeAfterPass: toggles.retakeAfterPass,
      limitedRetakeAttempts: toggles.limitedRetakeAttempts,
    };
  }, [
    shortDescription,
    lessonContentHtml,
    duration,
    timeUnit,
    quizStyle,
    passingGrade,
    pointsCutAfterRetake,
    toggles,
  ]);

  const handleSave = useCallback(async () => {
    if (live) {
      setSaving(true);
      try {
        await saveLiveQuizSettings(buildPayload());
        onLessonSave?.(lesson.id);
        toast.success(`Quiz “${lesson.title}” settings saved.`);
      } catch {
        toast.error('Could not save quiz settings.');
      } finally {
        setSaving(false);
      }
      return;
    }

    onLessonSave?.(lesson.id);
    toast.success(`Quiz “${lesson.title}” settings saved (demo).`);
  }, [buildPayload, lesson.id, lesson.title, live, onLessonSave, saveLiveQuizSettings]);

  useImperativeHandle(ref, () => ({ save: () => handleSave() }), [handleSave]);

  return (
    <Box sx={styles.quizSettingsRoot}>
      <Box sx={styles.quizSettingsCard}>
        <Typography component="label" sx={styles.quizSettingsFieldLabel} htmlFor="quiz-short-desc">
          Short description of the quiz
        </Typography>
        <TextField
          id="quiz-short-desc"
          multiline
          minRows={4}
          fullWidth
          placeholder="Quiz description"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          sx={styles.quizSettingsTextArea}
          size="small"
        />

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography component="label" sx={styles.quizSettingsFieldLabel} htmlFor="quiz-duration">
              Quiz duration
            </Typography>
            <TextField
              id="quiz-duration"
              type="number"
              fullWidth
              size="small"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) || 0)}
              InputProps={{
                sx: styles.quizSettingsNumberInput,
              }}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography component="label" sx={styles.quizSettingsFieldLabel}>
              Time unit
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                displayEmpty
                value={timeUnit}
                onChange={(e) => setTimeUnit(e.target.value)}
                sx={styles.quizSettingsSelect}
              >
                {TIME_UNIT_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <Typography component="label" sx={styles.quizSettingsFieldLabel}>
              Quiz style
            </Typography>
            <FormControl fullWidth size="small">
              <Select value={quizStyle} onChange={(e) => setQuizStyle(e.target.value)}>
                {QUIZ_STYLE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={styles.quizSettingsToggleGrid}>
          {TOGGLE_GROUPS.map((column, colIdx) => (
            <Box key={colIdx} sx={styles.quizSettingsToggleCol}>
              {column.map(({ key, label }) => (
                <FormControlLabel
                  key={key}
                  sx={styles.quizSettingsSwitchRow}
                  control={
                    <Switch
                      size="medium"
                      color="primary"
                      checked={!!toggles[key]}
                      onChange={() => handleToggle(key)}
                      inputProps={{ 'aria-label': label }}
                    />
                  }
                  label={label}
                />
              ))}
            </Box>
          ))}
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography component="label" sx={styles.quizSettingsFieldLabel} htmlFor="passing-grade">
              Passing grade (%)
            </Typography>
            <TextField
              id="passing-grade"
              type="number"
              fullWidth
              size="small"
              value={passingGrade}
              onChange={(e) => setPassingGrade(Number(e.target.value) || 0)}
              InputProps={{
                sx: styles.quizSettingsNumberInput,
              }}
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography component="label" sx={styles.quizSettingsFieldLabel} htmlFor="points-cut">
              Points cut after retake (%)
            </Typography>
            <TextField
              id="points-cut"
              type="number"
              fullWidth
              size="small"
              placeholder="Enter points cut after retake"
              value={pointsCutAfterRetake}
              onChange={(e) => setPointsCutAfterRetake(e.target.value)}
              InputProps={{
                sx: styles.quizSettingsNumberInput,
              }}
            />
          </Grid>
        </Grid>

        <Typography sx={{ ...styles.quizSettingsFieldLabel, mt: 3, display: 'block' }}>
          Lesson content
        </Typography>
        <Editor
          key={`${lesson.id}-quiz-settings-lesson`}
          value={lessonContentHtml}
          onChange={setLessonContentHtml}
          placeholder=""
          chrome="tinymce"
          sx={{
            mt: 1,
            minHeight: 260,
            maxHeight: 520,
          }}
          tinymceResizeBounds={{
            min: 120,
            max: Math.max(200, 360),
          }}
        />

        <Box sx={styles.quizSettingsSaveRow}>
          <Button
            variant="contained"
            sx={styles.quizSettingsFooterSaveBtn}
            onClick={() => {
              void handleSave();
            }}
            disabled={saving}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );
});
