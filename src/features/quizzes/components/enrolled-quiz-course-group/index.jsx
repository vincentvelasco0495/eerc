import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { styles } from './styles';
import { EnrolledQuizRow } from '../enrolled-quiz-row';

export function EnrolledQuizCourseGroup({ group }) {
  return (
    <Card sx={styles.card}>
      <CardContent sx={styles.cardContent}>
        <Stack spacing={0.45} sx={styles.headerStack}>
          <Typography variant="caption" sx={styles.courseCaption}>
            Course:
          </Typography>
          <Typography variant="subtitle1" sx={styles.courseTitle}>
            {group.courseTitle}
          </Typography>
        </Stack>

        <Stack sx={styles.rowsStack}>
          {group.items.map((quiz, index) => (
            <EnrolledQuizRow
              key={quiz.id}
              quiz={quiz}
              isLast={index === group.items.length - 1}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
