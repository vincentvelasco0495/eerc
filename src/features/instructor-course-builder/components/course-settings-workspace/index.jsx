import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { patchLmsCourse } from 'src/lib/lms-instructor-api';

import { toast } from 'src/components/snackbar';

import { css } from './styles';
import { CourseInfoSection } from './course-info-section';
import { CourseContinuationSection } from './course-continuation-section';
import {
  paragraphsToHtml,
  htmlToParagraphTexts,
  learningOutcomesToHtml,
  htmlToLearningOutcomeLines,
} from '../../utils/course-marketing-html';
import {
  curriculumBuilderCourse,
  courseWhatYouLearnSeedHtml,
  curriculumCourseCoverImageUrl,
  courseMainDescriptionSeedHtml,
  coursePreviewDescriptionSeedText,
} from '../../instructor-course-curriculum-data';

function parseHoursLabel(label) {
  const n = Number.parseInt(String(label ?? '').replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Navbar “Course” tab — offline demo sandbox, or live LMS authoring when `tiedCourse` is set.
 */
export function CourseSettingsWorkspace({ tiedCourse = null, onSaved } = {}) {
  const isLive = tiedCourse?.id != null;

  const [courseName, setCourseName] = useState(curriculumBuilderCourse.title);
  const [slug, setSlug] = useState('how-to-design-components-right');
  const [programId, setProgramId] = useState('program-ce');
  const [level, setLevel] = useState('');
  const [mentorDisplayName, setMentorDisplayName] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [coInstructor, setCoInstructor] = useState('');
  const [courseDuration, setCourseDuration] = useState('9 hours');
  const [videoDuration, setVideoDuration] = useState('5 hours');
  const [descriptionHtml, setDescriptionHtml] = useState(courseMainDescriptionSeedHtml);
  const [audienceHtml, setAudienceHtml] = useState('');
  const [learnHtml, setLearnHtml] = useState(courseWhatYouLearnSeedHtml);
  const [previewDescription, setPreviewDescription] = useState(coursePreviewDescriptionSeedText);

  const [featuredCourse, setFeaturedCourse] = useState(false);
  const [lockLessonsInOrder, setLockLessonsInOrder] = useState(false);

  const [accessDuration, setAccessDuration] = useState('');
  const [accessDeviceTypes, setAccessDeviceTypes] = useState('');
  const [certificateInfo, setCertificateInfo] = useState('');

  const [saveBusy, setSaveBusy] = useState(false);

  const baseUrlPrefix = curriculumBuilderCourse.baseUrlSlugPrefix ?? '';

  useEffect(() => {
    if (isLive) {
      return;
    }
    setCourseName(curriculumBuilderCourse.title);
    setSlug(curriculumBuilderCourse.defaultSlug ?? 'how-to-design-components-right');
    setProgramId(curriculumBuilderCourse.defaultProgramId ?? 'program-ce');
    setLevel('');
    setMentorDisplayName('');
    setBannerUrl('');
    setCoInstructor('');
    setCourseDuration('9 hours');
    setVideoDuration('5 hours');
    setAudienceHtml('');
    setDescriptionHtml(courseMainDescriptionSeedHtml);
    setLearnHtml(courseWhatYouLearnSeedHtml);
    setPreviewDescription(coursePreviewDescriptionSeedText);
    setFeaturedCourse(false);
    setLockLessonsInOrder(false);
    setAccessDuration('');
    setAccessDeviceTypes('');
    setCertificateInfo('');
  }, [isLive]);

  useEffect(() => {
    if (!tiedCourse) {
      return;
    }
    const m = tiedCourse.marketing ?? {};
    const paragraphs = Array.isArray(m.paragraphs) ? m.paragraphs : [];

    setCourseName(String(tiedCourse.title ?? '').trim() || curriculumBuilderCourse.title);
    setSlug(String(tiedCourse.slug ?? '').trim());
    setProgramId(String(tiedCourse.programId ?? '').trim());
    setLevel(String(tiedCourse.level ?? '').trim());
    setMentorDisplayName(String(tiedCourse.mentor ?? '').trim());
    setBannerUrl(typeof m.bannerImageUrl === 'string' ? m.bannerImageUrl.trim() : '');
    setCourseDuration(`${Number.isFinite(Number(tiedCourse.hours)) ? tiedCourse.hours : 0} hours`);
    setVideoDuration(
      typeof tiedCourse.videoHoursLabel === 'string' ? tiedCourse.videoHoursLabel.trim() : ''
    );
    setPreviewDescription(String(tiedCourse.description ?? '').trim());
    const descFallback = paragraphsToHtml(paragraphs);
    const fromDesc = paragraphsToHtml([
      typeof tiedCourse.description === 'string' ? tiedCourse.description.trim() : '',
    ].filter(Boolean));
    setDescriptionHtml(descFallback || fromDesc || courseMainDescriptionSeedHtml);
    setLearnHtml(learningOutcomesToHtml(m.learningOutcomes ?? []) || courseWhatYouLearnSeedHtml);
    setAudienceHtml(learningOutcomesToHtml(m.audience ?? []));

    setFeaturedCourse(false);
    setLockLessonsInOrder(false);
    setAccessDuration('');
    setAccessDeviceTypes('');
    setCertificateInfo('');
    setCoInstructor('');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed when switching authoring target only
  }, [tiedCourse?.id]);

  const handlePersistLmsSettings = useCallback(async () => {
    if (!tiedCourse?.id) {
      return;
    }
    try {
      setSaveBusy(true);
      await patchLmsCourse(tiedCourse.id, {
        title: courseName.trim(),
        description: previewDescription.trim(),
        mentor: mentorDisplayName.trim(),
        level: level.trim(),
        hours: parseHoursLabel(courseDuration),
        videoHoursLabel: videoDuration.trim() === '' ? null : videoDuration.trim(),
        marketing: {
          paragraphs: htmlToParagraphTexts(descriptionHtml),
          learningOutcomes: htmlToLearningOutcomeLines(learnHtml),
          audience: htmlToLearningOutcomeLines(audienceHtml),
          bannerImageUrl: bannerUrl.trim() === '' ? null : bannerUrl.trim(),
        },
      });
      toast.success('Course saved.');
      onSaved?.();
    } catch (e) {
      toast.error(e?.message ?? 'Save failed.');
    } finally {
      setSaveBusy(false);
    }
  }, [
    tiedCourse?.id,
    audienceHtml,
    bannerUrl,
    courseDuration,
    courseName,
    descriptionHtml,
    learnHtml,
    level,
    mentorDisplayName,
    previewDescription,
    videoDuration,
    onSaved,
  ]);

  return (
    <Box sx={css.workspaceRoot}>
      <Box sx={css.pageCard}>
        <CourseInfoSection
          courseName={courseName}
          onCourseNameChange={setCourseName}
          slug={slug}
          slugReadOnly={isLive}
          onSlugChange={setSlug}
          fullCourseUrlPrefix={baseUrlPrefix}
          programId={programId}
          programDisabled={isLive}
          onProgramIdChange={setProgramId}
          ownerName={isLive ? mentorDisplayName || 'Instructor' : 'Demo Instructor'}
          mentorDisplayName={mentorDisplayName}
          onMentorDisplayNameChange={isLive ? setMentorDisplayName : undefined}
          bannerImageUrl={bannerUrl}
          onBannerImageUrlChange={isLive ? setBannerUrl : undefined}
          coInstructor={coInstructor}
          onCoInstructorChange={setCoInstructor}
          courseCoverSrc={isLive ? (bannerUrl?.trim() || curriculumCourseCoverImageUrl) : curriculumCourseCoverImageUrl}
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
          audienceHtml={audienceHtml}
          onAudienceHtmlChange={setAudienceHtml}
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
          hideEmbeddedSaveFooter={isLive}
        />

        {isLive ? (
          <>
            <Divider sx={[css.dividerSection, { my: 3 }]} component="hr" />
            <Stack spacing={2}>
              <TextField
                label="Difficulty / level label"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
              <Typography variant="caption" color="text.secondary">
                Slug and program assignments are locked while editing a live LMS course catalog row.
              </Typography>
              <Stack direction="row" justifyContent="flex-end">
                <Button variant="contained" onClick={handlePersistLmsSettings} disabled={saveBusy}>
                  {saveBusy ? 'Saving…' : 'Save course'}
                </Button>
              </Stack>
            </Stack>
          </>
        ) : null}
      </Box>
    </Box>
  );
}
