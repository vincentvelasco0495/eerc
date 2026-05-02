import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { CONFIG } from 'src/global-config';
import { InstructorCourseCurriculumView } from 'src/features/instructor-course-builder/views/instructor-course-curriculum-view';

const metadata = { title: `Course curriculum | Dashboard - ${CONFIG.appName}` };

/** Resolves LMS course slug / public id: query `course` beats env default. Omit both for offline demo curriculum. */
function useEffectiveCourseLookup() {
  const [searchParams] = useSearchParams();
  return useMemo(() => {
    const qp = searchParams.get('course')?.trim();
    const envFallback = CONFIG.instructorCurriculumCourseLookup?.trim();
    const merged = qp || envFallback || '';
    return merged || null;
  }, [searchParams]);
}

export default function InstructorCourseCurriculumPage() {
  const courseLookup = useEffectiveCourseLookup();

  return (
    <>
      <title>{metadata.title}</title>

      <InstructorCourseCurriculumView courseLookup={courseLookup} />
    </>
  );
}
