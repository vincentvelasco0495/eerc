import { CourseDetailLayout } from '../../components/course-detail/CourseDetailLayout';
import {
  faqItemsMock,
  courseDetailMock,
  noticeContentMock,
  popularCoursesMock,
  relatedCoursesMock,
  curriculumModulesMock,
  noticeRelatedCoursesMock,
} from '../../components/course-detail/course-detail-data';

/** Standalone reference page at `/course-detail` — same chrome as LMS course-detail. */
export default function CourseDetail() {
  const { heroImageUrl, details, completion } = courseDetailMock;

  return (
    <CourseDetailLayout
      data={courseDetailMock}
      heroImageUrl={heroImageUrl}
      completion={completion}
      detailRows={details}
      curriculumModules={curriculumModulesMock}
      popularCoursesItems={popularCoursesMock}
      relatedCoursesItems={relatedCoursesMock}
      noticeContent={noticeContentMock}
      noticeRelatedCoursesItems={noticeRelatedCoursesMock}
      faqItems={faqItemsMock}
      continueHref="#"
      wrapMinHeightPage
    />
  );
}
