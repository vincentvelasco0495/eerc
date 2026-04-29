import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { styles } from './styles';

export function StudentSettingsProfileFields({ values, displayOptions, onChange }) {
  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="First Name"
            value={values.firstName}
            onChange={(event) => onChange('firstName', event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Last Name"
            value={values.lastName}
            onChange={(event) => onChange('lastName', event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
      </Grid>

      <Stack spacing={1}>
        <TextField
          select
          label="Display name publicly as:"
          value={values.displayName}
          onChange={(event) => onChange('displayName', event.target.value)}
          sx={styles.displayNameField}
          slotProps={{ inputLabel: { shrink: true } }}
        >
          {displayOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <Typography variant="body2" sx={styles.hint}>
          The display name is shown in all public fields, such as the author name, instructor
          name, and student name.
        </Typography>
      </Stack>
    </Stack>
  );
}
