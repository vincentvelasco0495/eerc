import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { styles, cardArtSx } from './styles';

function CourseMetaPill({ icon, children }) {
  return (
    <Stack direction="row" spacing={0.8} alignItems="center" sx={styles.courseMetaPill}>
      <Iconify icon={icon} width={16} />
      <Typography variant="body2">{children}</Typography>
    </Stack>
  );
}

export function StudentProfileCourseCard({ course }) {
  return (
    <Card sx={styles.card}>
      <CardContent sx={styles.cardContent}>
        <Stack spacing={2}>
          <Box sx={{ ...cardArtSx(course.variant), p: 1.25 }}>
            {course.badge ? (
              <Chip
                label={course.badge}
                color={course.badge === 'Needs Review' ? 'warning' : 'success'}
                size="small"
                sx={styles.badgeChip}
              />
            ) : null}
          </Box>

          <Stack spacing={1}>
            <Typography variant="caption" sx={styles.categoryCaption}>
              {course.category}
            </Typography>
            <Typography variant="h6" sx={styles.title}>
              {course.title}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <CourseMetaPill icon="solar:notebook-bookmark-bold-duotone">
              {course.lessons} Lectures
            </CourseMetaPill>
            <CourseMetaPill icon="solar:clock-circle-bold-duotone">
              {course.durationHours} Hours
            </CourseMetaPill>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Rating readOnly precision={0.1} value={course.rating} size="small" />
            <Typography variant="body2" sx={styles.ratingCaption}>
              {course.rating.toFixed(1)}
            </Typography>
          </Stack>

          <Button
            component={RouterLink}
            href={
              course.courseSlug
                ? paths.dashboard.courseDetails(course.courseSlug)
                : course.courseId
                  ? paths.dashboard.courses.details(course.courseId)
                  : paths.dashboard.courses.root
            }
            variant="contained"
            sx={styles.startCourseBtn}
          >
            Start Course
          </Button>

          <Typography variant="caption" sx={styles.startedCaption}>
            Started {course.startedAt}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
