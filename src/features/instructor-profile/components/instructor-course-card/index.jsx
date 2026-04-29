import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { Iconify } from 'src/components/iconify';

import { styles, getCourseArtSx } from './styles';

function CourseMetaItem({ icon, children }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Iconify icon={icon} width={16} sx={styles.courseMetaIcon} />
      <Typography variant="body2" sx={styles.courseMetaText}>
        {children}
      </Typography>
    </Stack>
  );
}

export function InstructorCourseCard({ course }) {
  return (
    <Card sx={styles.card}>
      <CardContent sx={styles.cardContent}>
        <Stack spacing={1.6}>
          <Box sx={{ ...getCourseArtSx(course.tone), p: 1.25 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Typography variant="caption" sx={styles.categoryCaptionOuter}>
                {course.category}
              </Typography>

              {course.badge ? (
                <Chip
                  label={course.badge}
                  color={course.badgeColor}
                  size="small"
                  sx={styles.badgeChip}
                />
              ) : null}
            </Stack>

            <Stack sx={styles.artIconStack}>
              <Iconify icon={course.icon} width={30} />
            </Stack>
          </Box>

          <Stack spacing={0.6}>
            <Typography variant="caption" sx={styles.categoryCaption}>
              {course.category}
            </Typography>
            <Typography variant="h6" sx={styles.title}>
              {course.title}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <CourseMetaItem icon="solar:list-check-bold-duotone">
              {course.lessons} Lectures
            </CourseMetaItem>
            <CourseMetaItem icon="solar:clock-circle-bold-duotone">
              {course.durationHours} Hours
            </CourseMetaItem>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Rating readOnly precision={0.1} value={course.rating} size="small" />
            <Typography variant="body2" sx={styles.ratingCaption}>
              {course.rating.toFixed(1)}
            </Typography>
          </Stack>

          <Divider />

          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Stack spacing={0.25}>
              <Typography variant="caption" sx={styles.statusCaption}>
                Course status:
              </Typography>
              <Chip
                label={course.status}
                color={
                  course.status === 'published' ? 'success' : course.status === 'draft' ? 'warning' : 'info'
                }
                size="small"
                sx={styles.statusChip}
              />
            </Stack>

            <Stack spacing={0.25} sx={{ minWidth: 0, textAlign: 'right' }}>
              <Typography variant="caption" sx={styles.updatedCaption}>
                Last updated:
              </Typography>
              <Typography variant="body2" sx={styles.updatedValue}>
                {course.updatedAt}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Button variant="soft" color="inherit">
              Manage course
            </Button>

            <IconButton color="inherit">
              <Iconify icon="solar:menu-dots-bold" width={20} />
            </IconButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
