import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';

export function InstructorProfileToolbar() {
  return (
    <Stack direction="row" spacing={1.5} justifyContent="flex-end" alignItems="center">
      <Button
        component={RouterLink}
        href={paths.dashboard.newCourseCurriculum}
        variant="contained"
        startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
        sx={styles.toolbarButton}
      >
        Add new course
      </Button>
    </Stack>
  );
}
