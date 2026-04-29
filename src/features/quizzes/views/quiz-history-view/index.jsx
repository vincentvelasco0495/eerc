import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';

import { useLmsQuizResults } from 'src/hooks/use-lms';

import { LmsStatCard } from 'src/components/ui/lms-stat-card';
import { LmsPageShell } from 'src/components/layout/lms-page-shell';

import { styles } from './styles';

export function QuizHistoryView() {
  const results = useLmsQuizResults();
  const bestScore = Math.max(...results.map((result) => result.score));

  return (
    <LmsPageShell
      heading="Quiz history"
      links={[{ name: 'Quizzes' }, { name: 'History' }]}
      eyebrow="Attempt archive"
      description="Cleaner historical visibility into quiz performance, scoring trends, and previous timed attempts."
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <LmsStatCard
            title="Attempts logged"
            value={results.length}
            caption="Across all tracked quizzes"
            icon="solar:history-bold-duotone"
            tone="primary"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <LmsStatCard
            title="Best score"
            value={`${bestScore}%`}
            caption="Top result in history"
            icon="solar:trophy-bold-duotone"
            tone="success"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <LmsStatCard
            title="Latest activity"
            value={results[0]?.date ?? 'N/A'}
            caption="Most recent recorded attempt"
            icon="solar:calendar-bold-duotone"
            tone="info"
          />
        </Grid>

        <Grid item xs={12}>
          <Card sx={styles.cardBorderVars}>
            <CardContent>
              <Typography variant="h6" sx={styles.tableHeading}>
                Attempt records
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Quiz</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Correct</TableCell>
                      <TableCell>Time used</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id} hover>
                        <TableCell>{result.date}</TableCell>
                        <TableCell>{result.quizId}</TableCell>
                        <TableCell>{result.score}%</TableCell>
                        <TableCell>
                          {result.correctAnswers}/{result.totalQuestions}
                        </TableCell>
                        <TableCell>{result.durationUsed}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </LmsPageShell>
  );
}
