import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';

export function CurriculumModuleFooterActions({ onAddLessonClick }) {
  const theme = useTheme();

  return (
    <Stack direction="row" alignItems="center" flexWrap="wrap" sx={styles.root}>
      <Button
        variant="text"
        color="primary"
        disableElevation
        onClick={onAddLessonClick}
        startIcon={
          <Box sx={styles.addIconWrap}>
            <Iconify icon="mingcute:add-line" width={12} sx={styles.addIcon} />
          </Box>
        }
        sx={styles.addButton}
      >
        Add a lesson
      </Button>
      <Button
        variant="outlined"
        disableElevation
        startIcon={<Iconify icon="solar:magnifer-linear" width={18} sx={styles.searchIcon} />}
        sx={styles.searchButton(theme)}
      >
        Search materials
      </Button>
    </Stack>
  );
}
