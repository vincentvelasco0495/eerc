import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';
import { CurriculumDragHandle } from '../curriculum-drag-handle';
import { CurriculumLessonTypeIcon } from '../curriculum-lesson-type-icon';

export function CurriculumLessonRow({ lesson, selected, onSelect }) {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.25}
      onClick={() => onSelect?.(lesson.id)}
      sx={styles.row(theme, { selected, draft: !!lesson.draft })}
    >
      <CurriculumDragHandle />
      <CurriculumLessonTypeIcon type={lesson.type} />
      <Typography variant="body2" sx={styles.title} noWrap>
        {lesson.title}
      </Typography>
      {lesson.draft ? <Chip label="DRAFT" size="small" sx={styles.draftChip} /> : null}
      <Stack
        direction="row"
        spacing={0.25}
        className="curriculum-row-actions"
        sx={styles.actions(theme)}
      >
        <IconButton size="small" sx={styles.iconButton}>
          <Iconify icon="solar:pen-bold-duotone" width={18} />
        </IconButton>
        <IconButton size="small" sx={styles.iconButton}>
          <Iconify icon="solar:trash-bin-trash-bold-duotone" width={18} />
        </IconButton>
      </Stack>
    </Stack>
  );
}
