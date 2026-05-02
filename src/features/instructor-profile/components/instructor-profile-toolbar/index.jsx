import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';

export function InstructorProfileToolbar({ period, periods, onPeriodChange }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      justifyContent="space-between"
      alignItems={{ xs: 'stretch', md: 'center' }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: 1, md: 'auto' }, ml: { md: 'auto' } }}>
        <TextField
          select
          size="small"
          value={period}
          onChange={(event) => onPeriodChange(event.target.value)}
          sx={styles.periodSelect}
          slotProps={{
            select: {
              MenuProps: {
                slotProps: {
                  paper: {
                    sx: styles.periodMenuPaper,
                  },
                },
              },
            },
          }}
        >
          {periods.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon="solar:file-text-bold-duotone" />}
          sx={styles.toolbarButton}
        >
          Detailed reports
        </Button>

        <Button
          component={RouterLink}
          href={paths.dashboard.instructorCourseCurriculum}
          variant="contained"
          startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
          sx={styles.toolbarButton}
        >
          Add new course
        </Button>
      </Stack>
    </Stack>
  );
}
