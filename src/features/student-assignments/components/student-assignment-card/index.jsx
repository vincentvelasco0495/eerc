import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { styles } from './styles';

function AssignmentMetaBlock({ label, value, children }) {
  return (
    <Stack spacing={0.35} sx={styles.metaBlock}>
      <Typography variant="caption" sx={styles.metaCaption}>
        {label}
      </Typography>
      {children ?? (
        <Typography variant="body2" sx={styles.metaValue}>
          {value}
        </Typography>
      )}
    </Stack>
  );
}

export function StudentAssignmentCard({ assignment }) {
  const initials = assignment.teacher.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  return (
    <Card sx={styles.card}>
      <CardContent sx={styles.cardContent}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={styles.title}>
            {assignment.title}
          </Typography>

          <Box sx={styles.grid}>
            <AssignmentMetaBlock label="Course:" value={assignment.course} />

            <AssignmentMetaBlock
              label="Teacher:"
              children={
                <Stack direction="row" spacing={1} alignItems="center" sx={styles.teacherRow}>
                  <Avatar sx={styles.teacherAvatar}>{initials}</Avatar>
                  <Typography variant="body2" sx={styles.teacherName}>
                    {assignment.teacher}
                  </Typography>
                </Stack>
              }
            />

            <AssignmentMetaBlock label="Last update:" value={assignment.updatedAt} />
            <AssignmentMetaBlock label="Status:" value={assignment.status} />

            <Stack direction="row" spacing={1} alignItems="center" sx={styles.gradeRow}>
              <Avatar sx={styles.gradeAvatar}>{assignment.gradeLabel}</Avatar>
              <Stack spacing={0.15}>
                <Typography variant="body2" sx={styles.gradeScoreLine}>
                  {assignment.scoreLabel}
                </Typography>
                <Typography variant="caption" sx={styles.gradeProgress}>
                  {assignment.progressLabel}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
