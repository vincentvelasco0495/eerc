import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import TabList from '@mui/lab/TabList';
import Stack from '@mui/material/Stack';
import TabPanel from '@mui/lab/TabPanel';
import Divider from '@mui/material/Divider';
import TabContext from '@mui/lab/TabContext';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';

import { styles } from './about-view.styles';

// ----------------------------------------------------------------------

const SKILL_ITEMS = [
  'Structured engineering review tracks for civil, plumbing, and materials-focused learners.',
  'Protected course delivery with modules, quizzes, and guided lesson progression.',
  'Centralized dashboards for learners, instructors, and program administrators.',
  'Progress tracking, enrollment flow, and course navigation in one LMS workspace.',
  'Flexible online access for review centers, institutions, and self-paced students.',
  'Built-in content organization for technical lessons, assessments, and learning journeys.',
];

const CONTACT_ITEMS = [
  'Platform support for learner access, account setup, and course availability.',
  'Onboarding help for review centers, instructors, and EERC LMS administrators.',
  'Guidance for publishing modules, quizzes, notices, and protected video lessons.',
  'Assistance with curriculum flow, enrollment, and dashboard configuration.',
  'Responsive support for teams delivering modern engineering education online.',
];

const CERTIFICATIONS = [
  'Civil Engineering Track',
  'Master Plumbing Track',
  'Materials Engineering Track',
];

export function AboutView() {
  const [tabValue, setTabValue] = useState('skills');

  return (
    <Box component="main" sx={styles.root}>
      <Container maxWidth="xl" sx={styles.container}>
        <Grid container spacing={{ xs: 4, md: 6 }} sx={styles.introGrid}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2.5}>
              <Typography variant="h2" sx={styles.introTitle}>
                Welcome to EERC LMS!
              </Typography>

              <Typography variant="body1" sx={styles.introCopy}>
                EERC LMS is built for engineering education teams that need a cleaner way to manage
                review programs, technical lessons, learner progress, and guided assessments in one
                platform. It helps institutions and review centers deliver flexible online learning
                without losing structure, control, or academic clarity.
              </Typography>

              <Typography variant="h6" sx={styles.subheading}>
                What EERC LMS supports
              </Typography>

              <Box component="ul" sx={styles.list}>
                {[
                  'Engineering-focused programs with organized modules and course paths.',
                  'Digital quizzes, progress checkpoints, and learner-friendly dashboards.',
                  'Administrative tools for enrollment, updates, and content management.',
                ].map((item) => (
                  <Box component="li" key={item} sx={styles.listItem}>
                    <Iconify icon="solar:medal-ribbons-star-outline" width={18} sx={styles.listIcon} />
                    <Typography variant="body2">{item}</Typography>
                  </Box>
                ))}
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={styles.photoCard}>
              <Box sx={styles.photoFrame}>
                <Image
                  alt="EERC LMS learning experience"
                  src={`${CONFIG.assetsDir}/assets/images/about/what-large.webp`}
                  sx={{ width: 1, height: 1, objectFit: 'cover' }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={{ xs: 4, md: 6 }} sx={styles.featureGrid}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={styles.illustrationCard}>
              <Box sx={{ ...styles.illustrationGlow, width: 120, height: 120, top: -18, right: 24, bgcolor: 'rgba(255,255,255,0.12)' }} />
              <Box sx={{ ...styles.illustrationGlow, width: 88, height: 88, bottom: 24, left: 42, bgcolor: 'rgba(255,255,255,0.08)' }} />
              <Box sx={styles.illustrationMonitor}>
                <Stack spacing={1.25}>
                  <Box sx={{ height: 14, width: '42%', borderRadius: 999, bgcolor: '#e4ecff' }} />
                  <Grid container spacing={1.2}>
                    <Grid size={{ xs: 7 }}>
                      <Box sx={{ height: 82, borderRadius: 2, bgcolor: '#eff4ff' }} />
                    </Grid>
                    <Grid size={{ xs: 5 }}>
                      <Stack spacing={1.2}>
                        <Box sx={{ height: 24, borderRadius: 1.5, bgcolor: '#ffd3e2' }} />
                        <Box sx={{ height: 24, borderRadius: 1.5, bgcolor: '#dce8ff' }} />
                        <Box sx={{ height: 24, borderRadius: 1.5, bgcolor: '#f7d27b' }} />
                      </Stack>
                    </Grid>
                  </Grid>
                </Stack>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  right: { xs: 24, md: 38 },
                  bottom: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Iconify icon="solar:user-rounded-bold-duotone" width={68} sx={{ color: '#ff7c59' }} />
                <Box sx={{ width: 28, height: 42, borderRadius: 999, bgcolor: '#ffcf54' }} />
              </Box>
              <Box sx={styles.illustrationStand} />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={styles.tabCard}>
              <TabContext value={tabValue}>
                <Box sx={styles.tabListWrap}>
                  <TabList onChange={(_, value) => setTabValue(value)} sx={styles.tabList}>
                    <Tab label="Platform Features" value="skills" disableRipple />
                    <Tab label="Contact Us" value="contact" disableRipple />
                  </TabList>
                </Box>

                <TabPanel value="skills" sx={styles.tabPanel}>
                  <Stack spacing={2}>
                    <Typography variant="h4" sx={styles.tabPanelTitle}>
                      EERC LMS core capabilities
                    </Typography>
                    <Box component="ul" sx={styles.bulletList}>
                      {SKILL_ITEMS.map((item) => (
                        <Typography key={item} component="li" variant="body2">
                          {item}
                        </Typography>
                      ))}
                    </Box>
                  </Stack>
                </TabPanel>

                <TabPanel value="contact" sx={styles.tabPanel}>
                  <Stack spacing={2}>
                    <Typography variant="h4" sx={styles.tabPanelTitle}>
                      Contact and implementation support
                    </Typography>
                    <Typography variant="body1" sx={styles.tabPanelCopy}>
                      We help schools, review centers, and training teams launch and manage EERC LMS
                      with a more organized and effective learning setup.
                    </Typography>
                    <Box component="ul" sx={styles.bulletList}>
                      {CONTACT_ITEMS.map((item) => (
                        <Typography key={item} component="li" variant="body2">
                          {item}
                        </Typography>
                      ))}
                    </Box>
                  </Stack>
                </TabPanel>
              </TabContext>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={styles.divider} />

        <Stack spacing={1}>
          <Typography variant="h2" sx={styles.sectionTitle}>
            EERC LMS programs
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 3, md: 4 }} sx={styles.certGrid}>
          {CERTIFICATIONS.map((item) => (
            <Grid key={item} size={{ xs: 12, md: 4 }}>
              <Stack spacing={2} sx={styles.certItem}>
                <Box sx={styles.certCard}>
                  <Box sx={styles.certPaper}>
                    <Stack spacing={1.8} alignItems="center" sx={{ textAlign: 'center' }}>
                      <Typography variant="overline" sx={{ color: '#7a5e4f', letterSpacing: 2 }}>
                        UK Ltd.
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#8d7767' }}>
                        THIS PROGRAM SUPPORTS
                      </Typography>
                      <Typography variant="h3" sx={{ color: '#5f4035', fontFamily: '"Times New Roman", serif' }}>
                        EERC LMS
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#8d7767', maxWidth: 220, lineHeight: 1.6 }}>
                        A structured learning environment for technical review content, guided
                        coursework, and protected engineering training delivery.
                      </Typography>
                      <Box sx={styles.certSeal} />
                    </Stack>
                  </Box>
                </Box>
                <Typography variant="subtitle1" sx={styles.certLabel}>
                  {item}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
