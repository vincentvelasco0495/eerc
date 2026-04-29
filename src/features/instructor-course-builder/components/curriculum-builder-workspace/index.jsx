import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { toast } from 'src/components/snackbar';

import { CurriculumTextLessonWorkspace } from '../curriculum-text-lesson-workspace';
import { CurriculumQuizLessonWorkspace } from '../curriculum-quiz-lesson-workspace';
import { CurriculumVideoLessonWorkspace } from '../curriculum-video-lesson-workspace';
import { CurriculumBuilderEmptyWorkspace } from '../curriculum-builder-empty-workspace';

const placeholderSx = (theme) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 320,
  px: 3,
  bgcolor: alpha(theme.palette.grey[500], 0.04),
  border: '1px dashed',
  borderColor: 'divider',
  borderRadius: 2,
});

export function CurriculumBuilderWorkspace({ lesson, onLessonTitleChange, onLessonSave }) {
  if (!lesson) {
    return <CurriculumBuilderEmptyWorkspace />;
  }

  if (lesson.type === 'document') {
    return (
      <CurriculumTextLessonWorkspace
        lesson={lesson}
        onLessonTitleChange={onLessonTitleChange}
        onLessonSave={onLessonSave}
      />
    );
  }

  if (lesson.type === 'video') {
    return (
      <CurriculumVideoLessonWorkspace
        lesson={lesson}
        onLessonTitleChange={onLessonTitleChange}
        onLessonSave={onLessonSave}
      />
    );
  }

  if (lesson.type === 'quiz') {
    return (
      <CurriculumQuizLessonWorkspace
        lesson={lesson}
        onLessonTitleChange={onLessonTitleChange}
        onLessonSave={onLessonSave}
      />
    );
  }

  return (
    <Box sx={(theme) => placeholderSx(theme)}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="body1" color="text.secondary" textAlign="center">
          Editor for <strong>{lesson.type}</strong> lessons is not in this prototype. Select a text
          lesson to see the full layout.
        </Typography>
        {lesson.draft ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              onLessonSave?.(lesson.id);
              toast.success(`Lesson “${lesson.title}” saved (demo).`);
            }}
          >
            Create
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}
