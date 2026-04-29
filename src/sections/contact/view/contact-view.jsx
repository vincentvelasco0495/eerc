import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { _mock } from 'src/_mock';

import { Iconify } from 'src/components/iconify';

import { styles } from './contact-view.styles';

// ----------------------------------------------------------------------

const CONTACT_INFO = [
  {
    label: 'Postal Address',
    value: 'EERC LMS Operations, 567 Learning Avenue, Quezon City, Metro Manila, Philippines',
    icon: 'solar:map-point-bold-duotone',
  },
  {
    label: 'Phone',
    value: '+63 (2) 8555-2740',
    icon: 'solar:phone-calling-rounded-bold-duotone',
  },
  {
    label: 'Email',
    value: 'support@eerclms.com',
    icon: 'solar:letter-bold-duotone',
  },
  {
    label: 'Web',
    value: 'www.eerclms.com',
    icon: 'solar:global-bold-duotone',
  },
];

const CONTACT_PEOPLE = [
  {
    name: 'Bernard Hannen',
    role: 'Head of LMS operations',
    phone: '+63 (2) 8555-2741',
    email: 'bernard@eerclms.com',
    extra: 'Learner support and implementation',
    avatarUrl: _mock.image.avatar(1),
  },
  {
    name: 'Henry Miller',
    role: 'Head of academic technology',
    phone: '+63 (2) 8555-2742',
    email: 'henry@eerclms.com',
    extra: 'Instructor onboarding and content setup',
    avatarUrl: _mock.image.avatar(2),
  },
];

export function ContactView() {
  return (
    <Box component="main" sx={styles.root}>
      <Container maxWidth="xl" sx={styles.container}>
        <Grid container spacing={{ xs: 4, md: 6 }} sx={styles.topGrid}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h2" sx={styles.sectionTitle}>
              Contact Info:
            </Typography>

            <Box sx={styles.infoPanel}>
              {CONTACT_INFO.map((item) => (
                <Box key={item.label} sx={styles.infoRow}>
                  <Iconify icon={item.icon} width={28} sx={styles.infoIcon} />
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1">{item.label}:</Typography>
                    {item.label === 'Web' ? (
                      <Link href="https://www.eerclms.com" underline="hover" color="inherit" sx={styles.infoMeta}>
                        {item.value}
                      </Link>
                    ) : (
                      <Typography variant="body2" sx={styles.infoMeta}>
                        {item.value}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h2" sx={styles.sectionTitle}>
              Location Info:
            </Typography>

            <Box sx={styles.locationCard}>
              <Box sx={styles.mapWrap}>
                <Box
                  component="iframe"
                  title="EERC LMS location"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps?q=Quezon%20City%20Philippines&z=12&output=embed"
                  sx={styles.mapFrame}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={styles.divider} />

        <Grid container spacing={{ xs: 4, md: 6 }} sx={styles.bottomGrid}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h2" sx={styles.sectionTitle}>
              Feedback:
            </Typography>

            <Box component="form" sx={styles.formCard}>
              <Box sx={styles.formRow}>
                <TextField fullWidth placeholder="Your Name" sx={styles.input} />
                <TextField fullWidth placeholder="Your Email" sx={styles.input} />
              </Box>

              <TextField
                fullWidth
                multiline
                minRows={7}
                placeholder="Tell us how we can help with EERC LMS, your program setup, learner support, or course delivery needs."
                sx={styles.textArea}
              />

              <Button variant="contained" size="large" sx={styles.submitButton}>
                Submit
              </Button>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="h2" sx={styles.sectionTitle}>
              Your Contact
            </Typography>

            <Box sx={styles.contactList}>
              {CONTACT_PEOPLE.map((person) => (
                <Box key={person.email} sx={styles.personCard}>
                  <Avatar alt={person.name} src={person.avatarUrl} variant="rounded" sx={styles.personImage} />

                  <Box sx={styles.personMeta}>
                    <Typography variant="h6" color="text.primary">
                      {person.name}
                    </Typography>
                    <Typography variant="body2">{person.role}</Typography>
                    <Typography variant="body2">
                      <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                        Phone:
                      </Box>{' '}
                      {person.phone}
                    </Typography>
                    <Typography variant="body2">
                      <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                        Email:
                      </Box>{' '}
                      {person.email}
                    </Typography>
                    <Typography variant="body2">
                      <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                        Role:
                      </Box>{' '}
                      {person.extra}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
