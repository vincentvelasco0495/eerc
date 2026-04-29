import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';
import { CurriculumBuilderModuleCard } from '../curriculum-builder-module-card';

export function CurriculumBuilderSidebar({
  modules,
  expandedByModuleId,
  onToggleModule,
  selectedLessonId,
  onSelectLesson,
  onAddLesson,
}) {
  const theme = useTheme();

  return (
    <Box sx={styles.root(theme)}>
      <Stack direction="row" spacing={1} alignItems="center" sx={styles.heading}>
        <Iconify icon="solar:widget-4-bold-duotone" width={22} color="primary.main" />
        <Typography variant="subtitle1" sx={styles.headingTitle}>
          Curriculum
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {modules.map((mod) => (
          <CurriculumBuilderModuleCard
            key={mod.id}
            module={mod}
            expanded={expandedByModuleId[mod.id]}
            onToggle={onToggleModule}
            selectedLessonId={selectedLessonId}
            onSelectLesson={onSelectLesson}
            onAddLesson={onAddLesson}
          />
        ))}
      </Stack>
    </Box>
  );
}
