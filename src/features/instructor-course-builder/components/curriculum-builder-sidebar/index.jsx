import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';
import { CurriculumBuilderModuleCard } from '../curriculum-builder-module-card';
import { CurriculumSelectLessonTypeDialog } from '../curriculum-select-lesson-type-dialog';

export function CurriculumBuilderSidebar({
  modules,
  expandedByModuleId,
  onToggleModule,
  selectedLessonId,
  onSelectLesson,
  onAddLesson,
  disableAddLesson = false,
  onAddModule,
  disableAddModule = false,
  addLessonUnavailableTitle,
  onDeleteModule,
  onRenameModule,
  onDeleteLesson,
  liveMode = false,
}) {
  const theme = useTheme();
  const [lessonPickerOpen, setLessonPickerOpen] = useState(false);
  const [lessonPickerModuleId, setLessonPickerModuleId] = useState(null);

  const handleCloseLessonPicker = useCallback(() => {
    setLessonPickerOpen(false);
    setLessonPickerModuleId(null);
  }, []);

  const handleLessonTypeSelected = useCallback(
    (type) => {
      if (lessonPickerModuleId != null && typeof onAddLesson === 'function') {
        onAddLesson(lessonPickerModuleId, type);
      }
    },
    [lessonPickerModuleId, onAddLesson]
  );

  return (
    <Box sx={styles.root(theme)}>
      <Box sx={styles.heading}>
        <Stack direction="row" spacing={1} alignItems="center" sx={styles.headingLeft}>
          <Iconify icon="solar:widget-4-bold-duotone" width={22} color="primary.main" />
          <Typography variant="subtitle1" sx={styles.headingTitle}>
            Curriculum
          </Typography>
        </Stack>

        {typeof onAddModule === 'function' ? (
          <Button
            variant="text"
            color="primary"
            disableElevation
            disabled={disableAddModule}
            onClick={() => onAddModule()}
            startIcon={
              <Box sx={styles.addModuleIconWrap}>
                <Iconify icon="mingcute:add-line" width={12} sx={styles.addModuleIcon} />
              </Box>
            }
            sx={styles.addModuleButton}
          >
            Add a module
          </Button>
        ) : null}
      </Box>

      <Stack spacing={2}>
        {modules.map((mod) => (
          <CurriculumBuilderModuleCard
            key={mod.id}
            module={mod}
            expanded={expandedByModuleId[mod.id]}
            onToggle={onToggleModule}
            selectedLessonId={selectedLessonId}
            onSelectLesson={onSelectLesson}
            onBeginAddLesson={
              typeof onAddLesson === 'function' && !disableAddLesson
                ? () => {
                    setLessonPickerModuleId(mod.id);
                    setLessonPickerOpen(true);
                  }
                : undefined
            }
            disableAddLesson={disableAddLesson}
            addLessonUnavailableTitle={addLessonUnavailableTitle}
            onDeleteModule={onDeleteModule}
            onRenameModule={onRenameModule}
            onDeleteLesson={onDeleteLesson}
            liveMode={liveMode}
          />
        ))}
      </Stack>

      {!disableAddLesson ? (
        <CurriculumSelectLessonTypeDialog
          open={lessonPickerOpen}
          onClose={handleCloseLessonPicker}
          onSelectType={handleLessonTypeSelected}
        />
      ) : null}
    </Box>
  );
}
