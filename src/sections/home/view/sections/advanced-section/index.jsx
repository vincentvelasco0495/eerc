import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';
import { INTEGRATION_ITEMS } from '../shared/data';
import {
  IntegrationCard,
  CollaborationPreview,
  LessonQuizStylesPreview,
  TranslationReadyIllustration,
} from '../shared/visuals';

const LESSON_STYLE_ITEMS = [
  {
    title: 'DARK AND LIGHT MODES',
    description:
      'Let engineering learners switch between light and dark lesson views so long review sessions stay comfortable and readable.',
    icon: 'mdi:weather-night',
    active: false,
  },
  {
    title: 'CURRICULUM & DISCUSSIONS SECTIONS',
    description:
      'Keep each module organized with expandable curriculum panels and discussion areas for technical questions and peer review.',
    icon: 'mdi:forum-outline',
    active: false,
  },
  {
    title: 'QUIZ PAGINATION',
    description:
      'Present engineering quiz questions in clear steps so learners can focus on one item at a time during mock-board practice.',
    icon: 'mdi:view-carousel-outline',
    active: true,
  },
];

const COLLAB_ITEMS = [
  {
    title: 'ASSIGNMENTS',
    description:
      'Create engineering tasks and ask learners to upload design files, worksheets, computations, or technical essays.',
    icon: 'mdi:file-document-edit-outline',
    active: true,
  },
  {
    title: 'MESSAGE SYSTEM',
    description:
      'Give instructors and learners a direct channel for course-related questions, clarifications, and review reminders.',
    icon: 'mdi:email-outline',
    active: false,
  },
  {
    title: 'ANNOUNCEMENT',
    description:
      'Publish important updates about schedules, module releases, exam drills, and engineering review notices.',
    icon: 'mdi:bullhorn-outline',
    active: false,
  },
  {
    title: 'STUDENT FORUM',
    description:
      'Provide a discussion space where learners can share solutions, ask technical questions, and compare review strategies.',
    icon: 'mdi:forum-outline',
    active: false,
  },
];

export function AdvancedSection() {
  return (
    <>
      <Box sx={styles.lessonQuiz.root}>
        <Container maxWidth="xl" sx={styles.lessonQuiz.container}>
          <Stack spacing={2} alignItems="center" sx={styles.lessonQuiz.header}>
            <Typography variant="h2" sx={styles.lessonQuiz.heading}>LESSONS & QUIZZES STYLES</Typography>
            <Typography variant="body1" sx={styles.lessonQuiz.copy}>
              Build well-structured engineering lesson pages and intuitive quiz flows that make
              technical review content easier to study, navigate, and complete.
            </Typography>
          </Stack>

          <Grid container spacing={{ xs: 4, md: 5 }} alignItems="center" sx={styles.lessonQuiz.grid}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={2}>
                {LESSON_STYLE_ITEMS.map((item) => (
                  <Box key={item.title} sx={styles.lessonQuiz.card(item.active)}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={styles.lessonQuiz.cardIcon(item.active)}>
                        <Iconify icon={item.icon} width={24} />
                      </Box>
                      <Stack spacing={0.8}>
                        <Typography variant="h6" sx={styles.lessonQuiz.cardTitle(item.active)}>{item.title}</Typography>
                        <Typography variant="body2" sx={styles.lessonQuiz.cardDescription(item.active)}>{item.description}</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <LessonQuizStylesPreview />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={styles.collaboration.root}>
        <Container maxWidth="xl" sx={styles.collaboration.container}>
          <Grid container spacing={{ xs: 5, md: 6 }} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={2}>
                {COLLAB_ITEMS.map((item) => (
                  <Box key={item.title} sx={styles.collaboration.card(item.active)}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={styles.collaboration.cardIcon(item.active)}>
                        <Iconify icon={item.icon} width={24} />
                      </Box>
                      <Stack spacing={0.75}>
                        <Typography variant="h6" sx={styles.collaboration.cardTitle(item.active)}>{item.title}</Typography>
                        <Typography variant="body2" sx={styles.collaboration.cardDescription(item.active)}>{item.description}</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <CollaborationPreview />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={styles.integrations.root}>
        <Container maxWidth="xl" sx={styles.integrations.container}>
          <Stack spacing={2} alignItems="center" sx={styles.integrations.header}>
            <Typography variant="h2" sx={styles.integrations.heading}>INTEGRATIONS</Typography>
            <Typography variant="body1" sx={styles.integrations.copy}>
              EERC LMS integrates with the most helpful tools for course delivery, payments,
              communication, interactive content, and learner management so the platform can fit
              your full training workflow.
            </Typography>
          </Stack>

          <Grid container spacing={{ xs: 2, md: 2.5 }} sx={styles.integrations.grid}>
            {INTEGRATION_ITEMS.map((item) => (
              <Grid key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
                <IntegrationCard item={item} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={styles.translation.root}>
        <Container maxWidth="xl" sx={styles.translation.container}>
          <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TranslationReadyIllustration />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={3} sx={styles.translation.content}>
                <Typography variant="h2" sx={styles.translation.heading}>TRANSLATION READY</Typography>
                <Typography variant="body1" sx={styles.translation.copyPrimary}>
                  Make your engineering learning platform accessible to more learners with
                  multilingual-ready pages, course content, and navigation across the full LMS
                  experience.
                </Typography>
                <Typography variant="body1" sx={styles.translation.copySecondary}>
                  EERC LMS can support different audiences, helping review centers deliver training,
                  announcements, and study materials in the language that best fits each learner
                  group.
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
