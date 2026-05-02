import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';
import { CurriculumDragHandle } from '../curriculum-drag-handle';
import { CurriculumLessonTypeIcon } from '../curriculum-lesson-type-icon';

export function CurriculumLessonRow({
  lesson,
  selected,
  onSelect,
  showDeleteLesson = false,
  onDeleteLesson,
}) {
  const theme = useTheme();

  return (
    <Box
      className="lesson-item"
      onClick={() => onSelect?.(lesson.id)}
      sx={styles.lessonItem(theme, { selected, draft: !!lesson.draft })}
    >
      <Stack direction="row" alignItems="center" sx={styles.leftCluster}>
        <CurriculumDragHandle />
        <CurriculumLessonTypeIcon type={lesson.type} />
        <Typography variant="body2" sx={styles.title} noWrap>
          {lesson.title}
        </Typography>
        {lesson.draft ? <Chip label="DRAFT" size="small" sx={styles.draftChip} /> : null}
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        className="lesson-actions"
        sx={{
          gap: '8px',
          minWidth: showDeleteLesson ? 72 : 36,
        }}
      >
        <IconButton size="small" sx={styles.iconButton} aria-label="Edit lesson">
          <Iconify icon="solar:pen-bold-duotone" width={18} />
        </IconButton>
        {showDeleteLesson && typeof onDeleteLesson === 'function' ? (
          <IconButton
            size="small"
            sx={styles.iconButton}
            aria-label="Delete lesson"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteLesson(lesson);
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold-duotone" width={18} />
          </IconButton>
        ) : null}
      </Stack>
    </Box>
  );
}
