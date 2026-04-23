import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';

import { useLmsQuiz, useLmsActions, useLmsQuizHistory, useLmsQuestionSets } from 'src/hooks/use-lms';

import { LmsStatCard } from 'src/components/ui/lms-stat-card';
import { LmsPageShell } from 'src/components/layout/lms-page-shell';

export function QuizDetailsView({ quizId }) {
  const quiz = useLmsQuiz(quizId);
  const history = useLmsQuizHistory(quizId);
  const questionSets = useLmsQuestionSets();
  const { fetchQuestionSet, simulateQuiz } = useLmsActions();

  useEffect(() => {
    if (quizId) {
      fetchQuestionSet(quizId);
    }
  }, [fetchQuestionSet, quizId]);

  if (!quiz) {
    return (
      <LmsPageShell heading="Quiz not found" links={[{ name: 'Quizzes', href: paths.dashboard.quizzes.root }]}>
        <Typography variant="body2">This quiz is unavailable.</Typography>
      </LmsPageShell>
    );
  }

  const questions = questionSets[quizId] ?? [];

  return (
    <LmsPageShell
      heading={quiz.title}
      eyebrow="Assessment detail"
      description="Preview randomized questions, review time limits, and run simulated attempts from a more structured quiz workspace."
      links={[
        { name: 'Quizzes', href: paths.dashboard.quizzes.root },
        { name: quiz.title },
      ]}
      action={
        <Button onClick={() => simulateQuiz(quiz.id)} variant="contained">
          Simulate attempt
        </Button>
      }
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <LmsStatCard
            title="Timer"
            value={`${quiz.durationMinutes} min`}
            caption="Per quiz attempt"
            icon="solar:clock-circle-bold-duotone"
            tone="warning"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <LmsStatCard
            title="Question pool"
            value={quiz.questionPoolCount}
            caption={`${quiz.questionCount} selected each attempt`}
            icon="solar:question-circle-bold-duotone"
            tone="info"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <LmsStatCard
            title="Best score"
            value={`${quiz.bestScore}%`}
            caption={`${history.length} recorded attempts`}
            icon="solar:trophy-bold-duotone"
            tone="success"
          />
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
                <Typography variant="h6">Quiz settings</Typography>
                <Chip label={`${quiz.durationMinutes} minute timer`} color="primary" />
                <Typography variant="body2">
                  Randomized from a pool of {quiz.questionPoolCount} questions.
                </Typography>
                <Typography variant="body2">
                  Attempts used: {quiz.attemptsUsed} / {quiz.attemptsAllowed}
                </Typography>
                <Typography variant="body2">Best score: {quiz.bestScore}%</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card
            sx={{
              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
              boxShadow: 'none',
            }}
          >
            <CardContent>
              <Stack spacing={2.5}>
                <Typography variant="h6">Question preview</Typography>
                <List
                  disablePadding
                  sx={{
                    borderRadius: 2,
                    bgcolor: 'background.neutral',
                    px: 2.5,
                  }}
                >
                  {questions.slice(0, quiz.questionCount).map((question, index) => (
                    <ListItem
                      key={question.id}
                      divider
                      sx={{ px: 0, py: 2, alignItems: 'flex-start', flexDirection: 'column' }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                        <Chip label={`Q${index + 1}`} size="small" color="primary" />
                        <Typography variant="subtitle2">{question.prompt}</Typography>
                      </Stack>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {question.choices.join(' • ')}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ px: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Latest attempt count: {history.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </LmsPageShell>
  );
}
