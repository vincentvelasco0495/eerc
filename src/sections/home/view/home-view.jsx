import Box from '@mui/material/Box';

import { BackToTopButton } from 'src/components/animate/back-to-top-button';

import { styles } from './home-view.styles';
import {
  FaqSection,
  HeroSection,
  QuizzesSection,
  AdvancedSection,
  DeliverySection,
  LearningSection,
  ExperienceSection,
  TestimonialsSection,
  CourseManagementSection,
  PlatformOverviewSection,
} from './sections';

export function HomeView() {
  return (
    <Box sx={styles.root}>
      <BackToTopButton />
      <HeroSection />
      <PlatformOverviewSection />
      <DeliverySection />
      <LearningSection />
      <QuizzesSection />
      <CourseManagementSection />
      <ExperienceSection />
      <AdvancedSection />
      <TestimonialsSection />
      <FaqSection />
    </Box>
  );
}

export default HomeView;
