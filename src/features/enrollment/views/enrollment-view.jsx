import { useMemo, useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { useEnrollment, useLmsActions, useLmsCourses } from 'src/hooks/use-lms';

import { LmsStatCard } from 'src/components/ui/lms-stat-card';
import { LmsPageShell } from 'src/components/layout/lms-page-shell';

export function EnrollmentView() {
  const courses = useLmsCourses();
  const enrollment = useEnrollment();
  const { submitEnrollment } = useLmsActions();
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const nextCourse = useMemo(
    () => courses.find((course) => !enrollment.some((item) => item.courseId === course.id)),
    [courses, enrollment]
  );

  useEffect(() => {
    if (!selectedCourseId && nextCourse?.id) {
      setSelectedCourseId(nextCourse.id);
    }
  }, [nextCourse?.id, selectedCourseId]);

  return (
    <LmsPageShell
      heading="Enrollment"
      links={[{ name: 'Enrollment' }]}
      eyebrow="Course access"
      description="A cleaner enrollment experience for learners to apply, track status, and review approval outcomes."
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <LmsStatCard
            title="Applications"
            value={enrollment.length}
            caption="Enrollment requests recorded"
            icon="solar:clipboard-list-bold-duotone"
            tone="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <LmsStatCard
            title="Approved"
            value={enrollment.filter((item) => item.status === 'approved').length}
            caption="Approved learning tracks"
            icon="solar:check-circle-bold-duotone"
            tone="success"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <LmsStatCard
            title="Pending"
            value={enrollment.filter((item) => item.status === 'pending').length}
            caption="Awaiting admin review"
            icon="solar:alarm-bold-duotone"
            tone="warning"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            sx={{
              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
              boxShadow: 'none',
            }}
          >
            <CardContent>
              <Stack spacing={2.5}>
                <Typography variant="h6">Apply for a course</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Choose a program-aligned course and submit a learner application.
                </Typography>
                <TextField
                  select
                  value={selectedCourseId}
                  label="Program course"
                  helperText="UI-only application flow for learner enrollment."
                  onChange={(event) => setSelectedCourseId(event.target.value)}
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.title}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  disabled={!selectedCourseId}
                  onClick={() => selectedCourseId && submitEnrollment(selectedCourseId)}
                  variant="contained"
                >
                  Submit application
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            sx={{
              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
              boxShadow: 'none',
            }}
          >
            <CardContent>
              <Stack spacing={2.5}>
                <Typography variant="h6">Approval status</Typography>
                {enrollment.map((item) => (
                  <Stack key={item.id} spacing={1.5}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      justifyContent="space-between"
                      alignItems={{ sm: 'center' }}
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2">
                          {courses.find((course) => course.id === item.courseId)?.title ?? item.courseId}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Submitted on {item.submittedAt}
                        </Typography>
                      </Stack>
                      <Chip
                        label={item.status}
                        color={item.status === 'approved' ? 'success' : 'warning'}
                      />
                    </Stack>
                    <Divider />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </LmsPageShell>
  );
}
