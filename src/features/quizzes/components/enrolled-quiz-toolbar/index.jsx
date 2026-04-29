import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';

export function EnrolledQuizToolbar({ query, onQueryChange }) {
  return (
    <Stack
      direction={{ xs: 'column', xl: 'row' }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', xl: 'center' }}
    >
      <Typography variant="h4" sx={styles.title}>
        Enrolled Quizzes
      </Typography>

      <TextField
        value={query}
        placeholder="Search course or quiz"
        onChange={(event) => onQueryChange(event.target.value)}
        sx={styles.searchField}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Iconify icon="solar:magnifer-linear" width={18} />
              </InputAdornment>
            ),
          },
        }}
      />
    </Stack>
  );
}
