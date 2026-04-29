import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { toast } from 'src/components/snackbar';

import { styles } from './styles';
import { InstructorWorkspaceShell } from '../../components/instructor-workspace-shell';
import {
  instructorAnnouncementCourseOptions,
  instructorAnnouncementCoursePlaceholder,
} from '../../instructor-announcement-data';

export function InstructorAnnouncementView() {
  const [course, setCourse] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!course) {
      toast.error('Please choose a course for the announcement.');
      return;
    }
    toast.success('Announcement saved (demo).');
    setMessage('');
  };

  return (
    <InstructorWorkspaceShell>
      <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
        <Typography variant="h4" sx={styles.pageTitle}>
          Announcement
        </Typography>

        <Box sx={styles.formSurface}>
          <Stack spacing={2.5}>
            <TextField
              select
              fullWidth
              value={course}
              onChange={(event) => setCourse(event.target.value)}
              slotProps={{
                select: {
                  displayEmpty: true,
                  renderValue: (selected) =>
                    selected ? (
                      selected
                    ) : (
                      <Box component="span" sx={styles.selectPlaceholder}>
                        {instructorAnnouncementCoursePlaceholder}
                      </Box>
                    ),
                },
              }}
              sx={styles.selectFieldRoot}
            >
              <MenuItem value="" sx={styles.menuPlaceholder}>
                <em>{instructorAnnouncementCoursePlaceholder}</em>
              </MenuItem>
              {instructorAnnouncementCourseOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              multiline
              minRows={8}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Enter message for students"
              inputProps={{ 'aria-label': 'Announcement message for students' }}
              sx={styles.messageField}
            />

            <Stack direction="row" justifyContent="flex-end" sx={styles.actionsRow}>
              <Button type="submit" variant="contained" size="large" sx={styles.submitButton}>
                Submit
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </InstructorWorkspaceShell>
  );
}
