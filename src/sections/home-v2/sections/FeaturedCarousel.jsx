import { useState } from 'react';
import { m } from 'framer-motion';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import { CmsImage } from '../components/CmsImage';
import { sectionStyles } from '../styles/section-styles';
import { SectionDecor } from '../components/SectionDecor';
import { ScrollReveal } from '../components/ScrollReveal';
import { useHomepageV2SectionContent } from '../context/homepage-v2-content-context';

export function FeaturedCarousel() {
  const content = useHomepageV2SectionContent('featured_content');
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down('sm'));
  const items = Array.isArray(content?.items) ? content.items : [];
  const centerIndex = Math.min(2, Math.max(0, Math.floor(items.length / 2)));
  const [activeIndex, setActiveIndex] = useState(centerIndex);
  const xStep = smDown ? 56 : 120;

  if (!content?.visible) {
    return null;
  }

  return (
    <Box component="section" sx={[sectionStyles.surfaceSection, { pb: { xs: 10, md: 14 } }]}>
      <SectionDecor variant="rings" />
      <Container maxWidth="xl" sx={sectionStyles.container}>
        <ScrollReveal>
          <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: { xs: 5, md: 8 } }}>
            {content.eyebrow ? (
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                {content.eyebrow}
              </Typography>
            ) : null}
            <Typography component="h2" variant="inherit" sx={sectionStyles.sectionHeading}>
              {content.title}
            </Typography>
            {content.description ? (
              <Typography sx={{ ...sectionStyles.bodyLead, mx: 'auto', textAlign: 'center' }}>
                {content.description}
              </Typography>
            ) : null}
          </Stack>
        </ScrollReveal>

        <Box
          sx={{
            position: 'relative',
            minHeight: { xs: 280, sm: 340, md: 400 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 1, md: 4 },
          }}
        >
          {items.map((item, index) => {
            const offset = index - activeIndex;
            const isCenter = offset === 0;
            const absOffset = Math.abs(offset);

            return (
              <Box
                key={item.id ?? item.title ?? index}
                component={m.div}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                tabIndex={0}
                role="button"
                aria-label={`Focus ${item.title}`}
                animate={{
                  x: offset * xStep,
                  scale: isCenter ? 1 : 0.82 - absOffset * 0.04,
                  opacity: isCenter ? 1 : 0.55 - absOffset * 0.12,
                  zIndex: 10 - absOffset,
                  rotateY: offset * -6,
                }}
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                sx={{
                  position: 'absolute',
                  width: { xs: '72%', sm: '48%', md: '36%' },
                  maxWidth: 420,
                  cursor: 'pointer',
                  outline: 'none',
                  '&:focus-visible': {
                    boxShadow: (t) => `0 0 0 3px ${varAlpha(t.vars.palette.primary.mainChannel, 0.4)}`,
                    borderRadius: 4,
                  },
                }}
              >
                <CmsImage
                  media={item.thumbnail}
                  label={item.thumbnail?.label ?? item.title ?? 'Video'}
                  aspectRatio="16 / 10"
                  sx={{
                    borderRadius: 4,
                    boxShadow: (t) =>
                      isCenter
                        ? `0 28px 60px ${varAlpha(t.vars.palette.grey['500Channel'], 0.28)}`
                        : `0 12px 32px ${varAlpha(t.vars.palette.grey['500Channel'], 0.16)}`,
                  }}
                />
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
