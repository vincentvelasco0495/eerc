import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useLmsQuizzes } from 'src/hooks/use-lms';

import { QuizCard } from 'src/components/ui/quiz-card';
import { LmsStatCard } from 'src/components/ui/lms-stat-card';
import { LmsPageShell } from 'src/components/layout/lms-page-shell';

export function QuizListView() {
  const quizzes = useLmsQuizzes();
  const totalQuestions = quizzes.reduce((sum, quiz) => sum + quiz.questionPoolCount, 0);

  return (
    <LmsPageShell
      heading="Timed quizzes"
      eyebrow="Assessment center"
      description="High-quality timed assessments with randomized question pools, tracked attempts, and cleaner learner-facing presentation."
      links={[{ name: 'Quizzes' }]}
      action={
        <Button component={RouterLink} href={paths.dashboard.quizzes.history} variant="outlined">
          Quiz history
        </Button>
      }
    >
      <Stack spacing={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
            <LmsStatCard
              title="Quiz sets"
              value={quizzes.length}
              caption="Active timed assessments"
              icon="solar:document-text-bold-duotone"
              tone="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
            <LmsStatCard
              title="Question pool"
              value={totalQuestions}
              caption="Questions available for randomized attempts"
              icon="solar:question-circle-bold-duotone"
              tone="warning"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
            <LmsStatCard
              title="Attempt policy"
              value="Multi"
              caption="Repeated attempts with score history"
              icon="solar:history-bold-duotone"
              tone="info"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {quizzes.map((quiz) => (
            <Grid key={quiz.id} size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
              <QuizCard quiz={quiz} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </LmsPageShell>
  );
}
