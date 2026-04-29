import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { styles } from './styles';

export function GradebookCourseSelect({ value, onChange, options }) {
  return (
    <Box sx={styles.root}>
      <TextField
        select
        fullWidth
        value={value}
        onChange={(event) => onChange(event.target.value)}
        size="small"
        sx={styles.field}
      >
        {options.map((course) => (
          <MenuItem key={course.id} value={course.id}>
            {course.title}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}
