import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Step from '@mui/material/Step';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Divider from '@mui/material/Divider';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useLmsCourse, useLmsModulesByCourse } from 'src/hooks/use-lms';

import { LEARNING_FLOW_STEPS } from 'src/constants/lms';

import { ModuleList } from 'src/components/ui/module-list';
import { LmsStatCard } from 'src/components/ui/lms-stat-card';
import { LmsPageShell } from 'src/components/layout/lms-page-shell';

export function CourseDetailsView({ courseId }) {
  const course = useLmsCourse(courseId);
  const modules = useLmsModulesByCourse(courseId);

  if (!course) {
    return (
      <LmsPageShell heading="Course not found" links={[{ name: 'Courses', href: paths.dashboard.courses.root }]}>
        <Typography variant="body2">This course is not available in the current LMS mock set.</Typography>
      </LmsPageShell>
    );
  }

  return (
    <LmsPageShell
      heading={course.title}
      eyebrow={course.level}
      description="A structured LMS course experience with clear program context, guided flow stages, and an organized module library."
      links={[
        { name: 'Courses', href: paths.dashboard.courses.root },
        { name: course.title },
      ]}
      action={
        <Button
          component={RouterLink}
          href={paths.dashboard.modules.details(course.nextModuleId)}
          variant="contained"
        >
          Resume learning
        </Button>
      }
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <LmsStatCard
            title="Modules completed"
            value={`${course.completedModules}/${course.totalModules}`}
            caption="Current course progress"
            icon="solar:checklist-minimalistic-bold-duotone"
            tone="success"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <LmsStatCard
            title="Course hours"
            value={course.hours}
            caption="Estimated review time"
            icon="solar:clock-circle-bold-duotone"
            tone="info"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <LmsStatCard
            title="Active learners"
            value={course.learners.toLocaleString()}
            caption="Current enrolled learners"
            icon="solar:users-group-rounded-bold-duotone"
            tone="primary"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Card
            sx={{
              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
              boxShadow: 'none',
            }}
          >
            <CardContent>
              <Stack spacing={3}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {course.tags.map((tag) => (
                      <Chip key={tag} label={tag} color="primary" variant="outlined" size="small" />
                    ))}
                  </Stack>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {course.description}
                  </Typography>
                </Stack>

                <Divider />

                <Stack spacing={2}>
                  <Typography variant="h6">Learning flow</Typography>
                  <Stepper activeStep={1} alternativeLabel>
                    {LEARNING_FLOW_STEPS.map((step) => (
                      <Step key={step}>
                        <StepLabel>{step}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Stack>

                <Divider />

                <Stack spacing={1.5}>
                  <Typography variant="h6">Course structure</Typography>
                  {course.subjects.map((subject) => (
                    <Chip
                      key={subject}
                      label={`Subject: ${subject} > Topic > Subtopic`}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
              boxShadow: 'none',
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Course stats</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Mentor
                </Typography>
                <Typography variant="subtitle2">{course.mentor}</Typography>
                <Divider />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Subjects covered
                </Typography>
                {course.subjects.map((subject) => (
                  <Typography key={subject} variant="subtitle2">
                    {subject}
                  </Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Stack spacing={2}>
            <Typography variant="h6">Modules</Typography>
            <ModuleList modules={modules} />
          </Stack>
        </Grid>
      </Grid>
    </LmsPageShell>
  );
}
