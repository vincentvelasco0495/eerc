import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { CmsImage } from '../components/CmsImage';
import { sectionStyles } from '../styles/section-styles';
import { SectionDecor } from '../components/SectionDecor';
import { ScrollReveal } from '../components/ScrollReveal';
import { useHomepageV2SectionContent } from '../context/homepage-v2-content-context';

const MASONRY_SPANS = [
  { aspectRatio: '3 / 4' },
  { aspectRatio: '1 / 1' },
  { aspectRatio: '4 / 5' },
  { aspectRatio: '3 / 4' },
  { aspectRatio: '1 / 1' },
  { aspectRatio: '4 / 5' },
];

export function InstructorSection() {
  const content = useHomepageV2SectionContent('instructors');

  if (!content?.visible) {
    return null;
  }

  const images = Array.isArray(content.images) ? content.images : [];
  const button = content.button ?? {};

  return (
    <Box component="section" sx={sectionStyles.subtleSection}>
      <SectionDecor variant="rings" />
      <Container maxWidth="xl" sx={sectionStyles.container}>
        <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <ScrollReveal direction="inLeft">
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                  gap: { xs: 1.5, md: 2 },
                  alignItems: 'start',
                }}
              >
                {images.map((image, index) => (
                  <Box
                    key={image.id ?? image.label ?? index}
                    sx={{ transform: index % 2 === 0 ? 'none' : { md: 'translateY(16px)' } }}
                  >
                    <CmsImage
                      media={image}
                      label={image.label ?? `Instructor ${index + 1}`}
                      aspectRatio={MASONRY_SPANS[index]?.aspectRatio ?? '3 / 4'}
                    />
                  </Box>
                ))}
              </Box>
            </ScrollReveal>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ScrollReveal direction="inRight">
              <Stack spacing={{ xs: 2.5, md: 3 }} sx={{ maxWidth: 520, ml: { md: 'auto' } }}>
                {content.label ? (
                  <Chip label={content.label} color="primary" variant="soft" sx={sectionStyles.eyebrow} />
                ) : null}

                <Typography component="h2" variant="inherit" sx={sectionStyles.sectionHeading}>
                  {content.title}
                </Typography>

                <Typography sx={sectionStyles.bodyLead}>{content.description}</Typography>

                {button.text ? (
                  <Button
                    component={RouterLink}
                    href={button.link || '/'}
                    size="large"
                    variant="contained"
                    startIcon={<Iconify icon="solar:user-plus-bold" />}
                    sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, mt: 1 }}
                  >
                    {button.text}
                  </Button>
                ) : null}
              </Stack>
            </ScrollReveal>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
