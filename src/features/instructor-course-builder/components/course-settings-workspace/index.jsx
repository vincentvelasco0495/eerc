import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';

import { css } from './styles';
import { CourseInfoSection } from './course-info-section';
import { CourseContinuationSection } from './course-continuation-section';
import {
  curriculumBuilderCourse,
  courseWhatYouLearnSeedHtml,
  curriculumCourseCoverImageUrl,
  courseMainDescriptionSeedHtml,
  coursePreviewDescriptionSeedText,
} from '../../instructor-course-curriculum-data';

/** Full-width settings layout for navbar “Settings” tab (Course info + continuation). */

export function CourseSettingsWorkspace() {
  const [courseName, setCourseName] = useState(curriculumBuilderCourse.title);
  const [slug, setSlug] = useState('how-to-design-components-right');
  const [level, setLevel] = useState('advanced');
  const [coInstructor, setCoInstructor] = useState('');
  const [courseDuration, setCourseDuration] = useState('9 hours');
  const [videoDuration, setVideoDuration] = useState('5 hours');
  const [descriptionHtml, setDescriptionHtml] = useState(courseMainDescriptionSeedHtml);
  const [learnHtml, setLearnHtml] = useState(courseWhatYouLearnSeedHtml);
  const [previewDescription, setPreviewDescription] = useState(coursePreviewDescriptionSeedText);

  const [featuredCourse, setFeaturedCourse] = useState(false);
  const [lockLessonsInOrder, setLockLessonsInOrder] = useState(false);

  const [accessDuration, setAccessDuration] = useState('');
  const [accessDeviceTypes, setAccessDeviceTypes] = useState('');
  const [certificateInfo, setCertificateInfo] = useState('');

  const baseUrlPrefix = curriculumBuilderCourse.baseUrlSlugPrefix ?? '';

  useEffect(() => {
    setCourseName(curriculumBuilderCourse.title);
    setSlug(curriculumBuilderCourse.defaultSlug ?? 'how-to-design-components-right');
    setLevel(curriculumBuilderCourse.defaultLevel ?? 'advanced');
    setCoInstructor('');
    setCourseDuration('9 hours');
    setVideoDuration('5 hours');
    setDescriptionHtml(courseMainDescriptionSeedHtml);
    setLearnHtml(courseWhatYouLearnSeedHtml);
    setPreviewDescription(coursePreviewDescriptionSeedText);
    setFeaturedCourse(false);
    setLockLessonsInOrder(false);
    setAccessDuration('');
    setAccessDeviceTypes('');
    setCertificateInfo('');
  }, []);

  return (
    <Box sx={css.workspaceRoot}>
      <Box sx={css.pageCard}>
        <CourseInfoSection
          courseName={courseName}
          onCourseNameChange={setCourseName}
          slug={slug}
          onSlugChange={setSlug}
          fullCourseUrlPrefix={baseUrlPrefix}
          level={level}
          onLevelChange={setLevel}
          ownerName="Demo Instructor"
          coInstructor={coInstructor}
          onCoInstructorChange={setCoInstructor}
          courseCoverSrc={curriculumCourseCoverImageUrl}
          courseDuration={courseDuration}
          onCourseDurationChange={setCourseDuration}
          videoDuration={videoDuration}
          onVideoDurationChange={setVideoDuration}
          descriptionHtml={descriptionHtml}
          onDescriptionHtmlChange={setDescriptionHtml}
        />
        <CourseContinuationSection
          learnHtml={learnHtml}
          onLearnHtmlChange={setLearnHtml}
          previewDescription={previewDescription}
          onPreviewDescriptionChange={setPreviewDescription}
          featuredCourse={featuredCourse}
          onFeaturedCourseChange={setFeaturedCourse}
          lockLessonsInOrder={lockLessonsInOrder}
          onLockLessonsInOrderChange={setLockLessonsInOrder}
          accessDuration={accessDuration}
          onAccessDurationChange={setAccessDuration}
          accessDeviceTypes={accessDeviceTypes}
          onAccessDeviceTypesChange={setAccessDeviceTypes}
          certificateInfo={certificateInfo}
          onCertificateInfoChange={setCertificateInfo}
        />
      </Box>
    </Box>
  );
}
