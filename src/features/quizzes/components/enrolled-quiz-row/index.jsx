import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { styles, GRADE_STYLES } from './styles';

function QuizMetric({ children, minWidth }) {
  return (
    <Typography variant="body2" sx={{ ...styles.metricText, minWidth }}>
      {children}
    </Typography>
  );
}

export function EnrolledQuizRow({ quiz, isLast }) {
  const gradeStyle = GRADE_STYLES[quiz.gradeLabel] ?? GRADE_STYLES.B;

  return (
    <>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', lg: 'center' }}
        sx={styles.mainRow}
      >
        <Stack spacing={0.9} sx={styles.primaryStack}>
          <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="subtitle1" sx={styles.quizTitle}>
              {quiz.title}
            </Typography>
            <Chip
              label={quiz.status.toUpperCase()}
              size="small"
              color={quiz.status === 'Passed' ? 'success' : 'error'}
              sx={styles.statusChip}
            />
          </Stack>

          <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
            <QuizMetric>{quiz.attemptsLabel}</QuizMetric>
            <Typography variant="body2" sx={styles.metricSep}>
              •
            </Typography>
            <QuizMetric>{quiz.questionsLabel}</QuizMetric>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          spacing={{ xs: 2, md: 3 }}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={styles.actionsStrip}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={styles.gradeLane}>
            <Box sx={styles.gradeCircle(gradeStyle)}>{quiz.gradeLabel}</Box>
            <Typography variant="body2" sx={styles.gradeScoreLabel}>
              {quiz.scoreLabel}
            </Typography>
          </Stack>

          <Typography variant="body2" sx={styles.progressLine}>
            {quiz.progressLabel}
          </Typography>

          <Button
            component={RouterLink}
            href={paths.dashboard.quizzes.details(quiz.quizId)}
            variant="soft"
            color="inherit"
            sx={styles.detailsBtn}
          >
            Details
          </Button>
        </Stack>
      </Stack>

      {!isLast ? <Divider /> : null}
    </>
  );
}
