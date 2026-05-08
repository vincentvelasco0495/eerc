import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { useLmsPrograms } from 'src/hooks/use-lms';

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
 * When `onEnsureCourse` is passed without `tiedCourse.id`, Save creates the catalog row then PATCHes it.
 */
export function CourseSettingsWorkspace({
  tiedCourse = null,
  onSaved,
  /** When set and there is no course id yet, Save calls this first (must return LMS `public_id`). */
  onEnsureCourse,
} = {}) {
  const hasCourseRow = tiedCourse?.id != null;
  const canPersistToLms = hasCourseRow || typeof onEnsureCourse === 'function';
  const { programs } = useLmsPrograms();

  const [courseName, setCourseName] = useState(curriculumBuilderCourse.title);
  const [slug, setSlug] = useState('how-to-design-components-right');
  const [programId, setProgramId] = useState('program-ce');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState('');
  const [instructor, setInstructor] = useState('Instructor');
  const [courseDuration, setCourseDuration] = useState('9 hours');
  const [videoDuration, setVideoDuration] = useState('5 hours');
  const [descriptionHtml, setDescriptionHtml] = useState(
    canPersistToLms ? '' : courseMainDescriptionSeedHtml
  );
  const [learnHtml, setLearnHtml] = useState(canPersistToLms ? '' : courseWhatYouLearnSeedHtml);
  const [previewDescription, setPreviewDescription] = useState(coursePreviewDescriptionSeedText);

  const [featuredCourse, setFeaturedCourse] = useState(false);
  const [lockLessonsInOrder, setLockLessonsInOrder] = useState(false);

  const [saveBusy, setSaveBusy] = useState(false);

  const baseUrlPrefix = curriculumBuilderCourse.baseUrlSlugPrefix ?? '';

  const programOptions = useMemo(() => {
    const list = Array.isArray(programs) ? programs : [];
    const active = list.filter((p) => String(p?.status ?? '').toLowerCase() === 'active');
    const opts = active.map((p) => ({
      id: p.id,
      label: String(p.title ?? p.code ?? p.id),
    }));

    // If the currently selected program is inactive/missing, include it as disabled to avoid blank UI.
    const selected = list.find((p) => String(p?.id) === String(programId));
    if (selected && String(selected?.status ?? '').toLowerCase() !== 'active') {
      opts.unshift({
        id: selected.id,
        label: `${String(selected.title ?? selected.code ?? selected.id)} (inactive)`,
        disabled: true,
      });
    }

    return opts.length ? opts : [{ id: programId, label: programId, disabled: true }];
  }, [programId, programs]);

  useEffect(() => {
    if (hasCourseRow) {
      return;
    }
    setCourseName(curriculumBuilderCourse.title);
    setSlug(curriculumBuilderCourse.defaultSlug ?? 'how-to-design-components-right');
    setProgramId(curriculumBuilderCourse.defaultProgramId ?? 'program-ce');
    setBannerUrl('');
    setBannerImageFile(null);
    setBannerPreviewUrl('');
    setInstructor('Instructor');
    setCourseDuration('9 hours');
    setVideoDuration('5 hours');
    setDescriptionHtml(canPersistToLms ? '' : courseMainDescriptionSeedHtml);
    setLearnHtml(canPersistToLms ? '' : courseWhatYouLearnSeedHtml);
    setPreviewDescription(coursePreviewDescriptionSeedText);
    setFeaturedCourse(false);
    setLockLessonsInOrder(false);
  }, [canPersistToLms, hasCourseRow]);

  useEffect(() => {
    if (!tiedCourse) {
      return;
    }
    const m = tiedCourse.marketing ?? {};
    const descriptionParagraphs = Array.isArray(m.description)
      ? m.description
      : Array.isArray(m.paragraphs)
        ? m.paragraphs
        : [];

    setCourseName(String(tiedCourse.title ?? '').trim() || curriculumBuilderCourse.title);
    setSlug(String(tiedCourse.slug ?? '').trim());
    setProgramId(String(tiedCourse.programId ?? '').trim());
    setInstructor(String(tiedCourse.mentor ?? '').trim() || 'Instructor');
    setBannerUrl(typeof m.bannerImageUrl === 'string' ? m.bannerImageUrl.trim() : '');
    setBannerImageFile(null);
    setBannerPreviewUrl('');
    setCourseDuration(`${Number.isFinite(Number(tiedCourse.hours)) ? tiedCourse.hours : 0} hours`);
    setVideoDuration(
      typeof tiedCourse.videoHoursLabel === 'string' ? tiedCourse.videoHoursLabel.trim() : ''
    );
    setPreviewDescription(String(tiedCourse.description ?? '').trim());
    const descFallback = paragraphsToHtml(descriptionParagraphs);
    const fromDesc = paragraphsToHtml([
      typeof tiedCourse.description === 'string' ? tiedCourse.description.trim() : '',
    ].filter(Boolean));
    setDescriptionHtml(descFallback || fromDesc || '');
    setLearnHtml(learningOutcomesToHtml(m.learningOutcomes ?? []) || '');
    setFeaturedCourse(Boolean(m.featuredCourse));
    setLockLessonsInOrder(Boolean(m.lockLessonsInOrder));
    // no-op: instructor value is stored on the course row
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed when switching authoring target only
  }, [tiedCourse?.id]);

  const handlePersistLmsSettings = useCallback(async () => {
    let courseId = tiedCourse?.id;
    if (!courseId && typeof onEnsureCourse === 'function') {
      try {
        courseId = await onEnsureCourse({
          title: courseName.trim(),
          programId: programId.trim(),
        });
      } catch {
        return;
      }
    }
    if (!courseId) {
      return;
    }
    try {
      setSaveBusy(true);
      const description = htmlToParagraphTexts(descriptionHtml);
      const learningOutcomes = htmlToLearningOutcomeLines(learnHtml);
      const marketingPayload = {
        ...(description.length ? { description } : {}),
        ...(learningOutcomes.length ? { learningOutcomes } : {}),
        bannerImageUrl: bannerUrl.trim() === '' ? null : bannerUrl.trim(),
        featuredCourse,
        lockLessonsInOrder,
      };

      if (bannerImageFile) {
        const formData = new FormData();
        formData.append('title', courseName.trim());
        formData.append('slug', slug.trim());
        formData.append('programId', programId || '');
        formData.append('description', previewDescription.trim());
        formData.append('mentor', instructor.trim());
        formData.append('hours', String(parseHoursLabel(courseDuration)));
        formData.append('videoHoursLabel', videoDuration.trim() === '' ? '' : videoDuration.trim());
        formData.append('marketingPayload', JSON.stringify(marketingPayload));
        formData.append('bannerImage', bannerImageFile);
        const json = await patchLmsCourse(courseId, formData);
        onSaved?.(json?.data);
      } else {
        const json = await patchLmsCourse(courseId, {
          title: courseName.trim(),
          slug: slug.trim(),
          programId: programId || null,
          description: previewDescription.trim(),
          mentor: instructor.trim(),
          hours: parseHoursLabel(courseDuration),
          videoHoursLabel: videoDuration.trim() === '' ? null : videoDuration.trim(),
          marketing: marketingPayload,
        });
        onSaved?.(json?.data);
      }
      toast.success('Course saved.');
      setBannerImageFile(null);
    } catch (e) {
      toast.error(e?.message ?? 'Save failed.');
    } finally {
      setSaveBusy(false);
    }
  }, [
    tiedCourse?.id,
    onEnsureCourse,
    bannerImageFile,
    bannerUrl,
    courseDuration,
    courseName,
    descriptionHtml,
    instructor,
    learnHtml,
    lockLessonsInOrder,
    previewDescription,
    programId,
    slug,
    videoDuration,
    featuredCourse,
    onSaved,
  ]);

  return (
    <Box sx={css.workspaceRoot}>
      <Box sx={css.pageCard}>
        <CourseInfoSection
          courseName={courseName}
          onCourseNameChange={setCourseName}
          slug={slug}
          slugReadOnly={false}
          onSlugChange={setSlug}
          fullCourseUrlPrefix={baseUrlPrefix}
          programId={programId}
          programDisabled={false}
          onProgramIdChange={setProgramId}
          programOptions={programOptions}
          ownerName={instructor}
          instructor={instructor}
          onInstructorChange={setInstructor}
          instructorOptions={[
            { value: 'Engr. Hannah Cruz', label: 'Engr. Hannah Cruz' },
            { value: 'Engr. Miguel Santos', label: 'Engr. Miguel Santos' },
            { value: 'Dr. Reese Navarro', label: 'Dr. Reese Navarro' },
            { value: 'Demo Instructor', label: 'Demo Instructor' },
          ]}
          onBannerImageFileChange={(file) => {
            setBannerImageFile(file);
            setBannerPreviewUrl(URL.createObjectURL(file));
          }}
          courseCoverSrc={
            bannerPreviewUrl ||
            (canPersistToLms ? bannerUrl?.trim() || curriculumCourseCoverImageUrl : curriculumCourseCoverImageUrl)
          }
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
          hideEmbeddedSaveFooter={canPersistToLms}
        />

        {canPersistToLms ? (
          <>
            <Divider sx={[css.dividerSection, { my: 3 }]} component="hr" />
            <Stack spacing={2}>
              <Typography variant="caption" color="text.secondary">
                {hasCourseRow
                  ? 'Editing a live LMS course row. Banner file path is stored server-side only.'
                  : 'Save creates the course in the catalog, then applies these settings.'}
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
