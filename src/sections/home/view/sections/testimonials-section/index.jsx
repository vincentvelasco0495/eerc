import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { styles } from './styles';
import { TESTIMONIAL_ITEMS } from '../shared/data';
import { TestimonialCard, TestimonialBackdrop } from '../shared/visuals';

export function TestimonialsSection() {
  return (
    <Box sx={styles.root}>
      <TestimonialBackdrop />
      <Container maxWidth="xl" sx={styles.container}>
        <Stack spacing={0.75} alignItems="center" sx={styles.header}>
          <Typography variant="h2" sx={styles.heading}>TESTIMONIALS</Typography>
          <Typography variant="overline" sx={styles.overline}>OUR CUSTOMERS FEEDBACK</Typography>
        </Stack>

        <Grid container spacing={{ xs: 2, md: 2.5 }} sx={styles.grid}>
          {TESTIMONIAL_ITEMS.map((item) => (
            <Grid key={item.author} size={{ xs: 12, sm: 6, lg: 3 }}>
              <TestimonialCard item={item} />
            </Grid>
          ))}
        </Grid>

        <Stack direction="row" spacing={1} justifyContent="center" sx={styles.dots}>
          <Box sx={styles.activeDot} />
          <Box sx={styles.inactiveDot} />
        </Stack>
      </Container>
    </Box>
  );
}
