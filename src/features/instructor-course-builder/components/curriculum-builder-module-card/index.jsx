import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';
import { CurriculumLessonRow } from '../curriculum-lesson-row';
import { CurriculumDragHandle } from '../curriculum-drag-handle';
import { CurriculumModuleFooterActions } from '../curriculum-module-footer-actions';
import { CurriculumSelectLessonTypeDialog } from '../curriculum-select-lesson-type-dialog';

export function CurriculumBuilderModuleCard({
  module: mod,
  expanded,
  onToggle,
  selectedLessonId,
  onSelectLesson,
  onAddLesson,
}) {
  const [lessonTypeOpen, setLessonTypeOpen] = useState(false);

  const handleSelectLessonType = useCallback(
    (type) => {
      onAddLesson?.(mod.id, type);
    },
    [mod.id, onAddLesson]
  );

  return (
    <Card sx={styles.card}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.25}
        sx={styles.header}
        onClick={() => onToggle?.(mod.id)}
      >
        <CurriculumDragHandle />
        <Typography variant="subtitle2" sx={styles.title}>
          {mod.title}
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.(mod.id);
          }}
          sx={styles.expandButton}
        >
          <Iconify
            icon={expanded ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'}
            width={18}
          />
        </IconButton>
      </Stack>

      {expanded ? (
        <>
          <Divider />
          <Box sx={styles.lessons}>
            {mod.lessons.map((lesson) => (
              <CurriculumLessonRow
                key={lesson.id}
                lesson={lesson}
                selected={lesson.id === selectedLessonId}
                onSelect={onSelectLesson}
              />
            ))}
          </Box>
        </>
      ) : (
        <Divider />
      )}

      <CurriculumModuleFooterActions onAddLessonClick={() => setLessonTypeOpen(true)} />

      <CurriculumSelectLessonTypeDialog
        open={lessonTypeOpen}
        onClose={() => setLessonTypeOpen(false)}
        onSelectType={handleSelectLessonType}
      />
    </Card>
  );
}
