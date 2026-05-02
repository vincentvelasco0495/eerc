import { useState } from 'react';
import { useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';

import { toast } from 'src/components/snackbar';
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

export function InstructorCourseCard({ course, onCourseUpdate }) {
  const navigate = useNavigate();

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const menuOpen = Boolean(menuAnchorEl);

  const handleOpenMenu = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleMoveToDrafts = () => {
    handleCloseMenu();
    if (course.status === 'draft' || !onCourseUpdate) {
      return;
    }
    onCourseUpdate(course.id, (current) => ({
      ...current,
      publishSnapshot: {
        status: current.status,
        badge: current.badge,
        badgeColor: current.badgeColor,
      },
      status: 'draft',
      badge: 'Draft',
      badgeColor: 'warning',
    }));
    toast.info(`"${course.title}" moved to drafts (demo).`);
  };

  const handlePublish = () => {
    handleCloseMenu();
    if (course.status !== 'draft' || !onCourseUpdate) {
      return;
    }
    onCourseUpdate(course.id, (current) => {
      const snapshot = current.publishSnapshot;

      if (!snapshot) {
        const next = { ...current };
        delete next.publishSnapshot;
        return {
          ...next,
          status: 'published',
          badge: null,
          badgeColor: 'default',
        };
      }

      const { badge, badgeColor, status: snapshotStatus } = snapshot;

      const next = { ...current };
      delete next.publishSnapshot;

      return {
        ...next,
        status: snapshotStatus,
        badge,
        badgeColor,
      };
    });
    toast.success(`"${course.title}" is published (demo).`);
  };

  const handleEdit = () => {
    handleCloseMenu();
    const slugOrId = typeof course.detailSlug === 'string' ? course.detailSlug.trim() : '';
    if (!slugOrId) {
      toast.error('This course cannot be edited (missing slug or id from the API).');
      return;
    }
    navigate(paths.dashboard.instructorCourseEdit(slugOrId));
  };

  const handleManageCourse = (event) => {
    event.stopPropagation();
    const slugOrId = typeof course.detailSlug === 'string' ? course.detailSlug.trim() : '';
    if (!slugOrId) {
      toast.error('This course cannot be opened (missing slug or id from the API).');
      return;
    }
    navigate(paths.dashboard.instructorCourseEdit(slugOrId));
  };

  const handleOpenCourseDetail = () => {
    const slugOrId = typeof course.detailSlug === 'string' ? course.detailSlug.trim() : '';
    if (!slugOrId) {
      toast.error('This course cannot be opened (missing slug or id from the API).');
      return;
    }
    navigate(paths.dashboard.courseDetails(slugOrId));
  };

  const handlePreviewKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpenCourseDetail();
    }
  };

  const handleMakeFeatured = () => {
    handleCloseMenu();
    toast.success(`"${course.title}" is now featured (demo).`);
  };

  return (
    <Card sx={styles.card}>
      <CardContent sx={styles.cardContent}>
        <Stack spacing={1.6}>
          {/* Course-detail navigation is limited to this block so menu (React tree) clicks do not bubble to it. */}
          <Box
            component="div"
            role="button"
            tabIndex={0}
            aria-label={`Open course: ${course.title}`}
            onClick={handleOpenCourseDetail}
            onKeyDown={handlePreviewKeyDown}
            sx={styles.previewClickable}
          >
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
            </Stack>
          </Box>

          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Button variant="soft" color="inherit" onClick={handleManageCourse}>
              Manage course
            </Button>

            <>
              <IconButton
                color="inherit"
                aria-label={`Course actions: ${course.title}`}
                aria-controls={menuOpen ? `course-menu-${course.id}` : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
                onClick={handleOpenMenu}
                sx={styles.menuTrigger}
              >
                <Iconify icon="mdi:dots-vertical" width={20} />
              </IconButton>

              <Menu
                id={`course-menu-${course.id}`}
                anchorEl={menuAnchorEl}
                open={menuOpen}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: styles.menuPaper } }}
              >
                {course.status === 'draft' ? (
                  <MenuItem dense onClick={handlePublish} sx={styles.menuItem}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Iconify icon="solar:check-circle-bold-duotone" width={20} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Publish"
                      slotProps={{ primary: { typography: 'body2' } }}
                    />
                  </MenuItem>
                ) : (
                  <MenuItem dense onClick={handleMoveToDrafts} sx={styles.menuItem}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Iconify icon="solar:document-text-bold-duotone" width={20} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Move to drafts"
                      slotProps={{ primary: { typography: 'body2' } }}
                    />
                  </MenuItem>
                )}

                <MenuItem dense onClick={handleEdit} sx={styles.menuItem}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Iconify icon="solar:pen-bold-duotone" width={20} />
                  </ListItemIcon>
                  <ListItemText primary="Edit" slotProps={{ primary: { typography: 'body2' } }} />
                </MenuItem>

                <MenuItem dense onClick={handleMakeFeatured} sx={styles.menuItem}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Iconify icon="eva:star-outline" width={20} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Make Featured"
                    slotProps={{ primary: { typography: 'body2' } }}
                  />
                </MenuItem>
              </Menu>
            </>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
