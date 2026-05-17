import { useMemo, useState, useEffect, useCallback, useRef } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { useLmsActions, useLmsPrograms, useLmsInstructors } from 'src/hooks/use-lms';

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
  const { instructors: instructorCatalog } = useLmsInstructors();
  const { runCommand } = useLmsActions();

  const [selectedInstructorIds, setSelectedInstructorIds] = useState([]);

  const activeInstructors = useMemo(() => {
    const list = Array.isArray(instructorCatalog) ? instructorCatalog : [];
    return list.filter((row) => String(row?.status ?? 'active').toLowerCase() === 'active');
  }, [instructorCatalog]);

  const instructorOptions = useMemo(() => {
    const activeOpts = activeInstructors.map((row) => ({
      value: row.id,
      label: String(row.name ?? '').trim() || String(row.id),
    }));
    const catalog = Array.isArray(instructorCatalog) ? instructorCatalog : [];
    const extras = selectedInstructorIds
      .filter((id) => !activeOpts.some((o) => String(o.value) === String(id)))
      .map((id) => catalog.find((r) => String(r?.id) === String(id)))
      .filter(Boolean)
      .map((row) => ({
        value: row.id,
        label: String(row.name ?? '').trim() || String(row.id),
      }));
    const seen = new Set(activeOpts.map((o) => String(o.value)));
    const merged = [...activeOpts];
    extras.forEach((o) => {
      if (!seen.has(String(o.value))) {
        merged.push(o);
        seen.add(String(o.value));
      }
    });
    return merged;
  }, [activeInstructors, instructorCatalog, selectedInstructorIds]);

  const instructorNameById = useMemo(() => {
    const m = new Map();
    (Array.isArray(instructorCatalog) ? instructorCatalog : []).forEach((row) => {
      if (row?.id) {
        m.set(String(row.id), String(row.name ?? '').trim());
      }
    });
    return m;
  }, [instructorCatalog]);

  const [courseName, setCourseName] = useState(curriculumBuilderCourse.title);
  const [slug, setSlug] = useState('how-to-design-components-right');
  const [programId, setProgramId] = useState('program-ce');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState('');
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
    setSelectedInstructorIds([]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed when switching authoring target only
  }, [tiedCourse?.id]);

  const coInstructorsSerialized = useMemo(
    () =>
      JSON.stringify(
        Array.isArray(tiedCourse?.marketing?.coInstructors) ? tiedCourse.marketing.coInstructors : []
      ),
    [tiedCourse?.marketing?.coInstructors]
  );

  /** Stable signature so Redux ref churn on `instructorCatalog` does not retrigger sync every render. */
  const instructorCatalogSig = useMemo(
    () =>
      JSON.stringify(
        (Array.isArray(instructorCatalog) ? instructorCatalog : []).map((r) => [
          r?.id,
          r?.name,
          r?.status,
        ])
      ),
    [instructorCatalog]
  );

  const lastSyncedInstructorPickRef = useRef({ courseId: null, courseSig: '', catalogSig: '', idsKey: '' });

  useEffect(() => {
    if (!tiedCourse?.id) {
      return;
    }
    const m = tiedCourse.marketing ?? {};
    const co = Array.isArray(m.coInstructors) ? m.coInstructors : [];
    const mentorStr = String(tiedCourse.mentor ?? '').trim();
    const nameList =
      co.length > 0
        ? co.map((s) => String(s ?? '').trim()).filter(Boolean)
        : mentorStr
          ? mentorStr.split(/\s*,\s*/).map((s) => s.trim()).filter(Boolean)
          : [];

    const catalog = Array.isArray(instructorCatalog) ? instructorCatalog : [];
    const ids = nameList
      .map((name) =>
        catalog.find((r) => String(r?.name ?? '').trim().toLowerCase() === String(name).toLowerCase())
      )
      .filter(Boolean)
      .map((r) => r.id);

    const courseSig = `${tiedCourse?.id}|${String(tiedCourse?.mentor ?? '')}|${coInstructorsSerialized}`;
    const idsKey = JSON.stringify(ids);
    const prev = lastSyncedInstructorPickRef.current;
    if (
      prev.courseId === tiedCourse.id &&
      prev.courseSig === courseSig &&
      prev.catalogSig === instructorCatalogSig &&
      prev.idsKey === idsKey
    ) {
      return;
    }
    lastSyncedInstructorPickRef.current = {
      courseId: tiedCourse.id,
      courseSig,
      catalogSig: instructorCatalogSig,
      idsKey,
    };

    setSelectedInstructorIds((prevIds) => {
      if (
        prevIds.length === ids.length &&
        prevIds.every((id, i) => String(id) === String(ids[i]))
      ) {
        return prevIds;
      }
      return ids;
    });
  }, [tiedCourse?.id, tiedCourse?.mentor, coInstructorsSerialized, instructorCatalogSig]);

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
      const instructorNames = selectedInstructorIds
        .map((id) => instructorNameById.get(String(id)))
        .filter(Boolean);
      const mentorDisplay = instructorNames[0] ?? '';

      const marketingPayload = {
        ...(description.length ? { description } : {}),
        ...(learningOutcomes.length ? { learningOutcomes } : {}),
        bannerImageUrl: bannerUrl.trim() === '' ? null : bannerUrl.trim(),
        featuredCourse,
        lockLessonsInOrder,
        ...(instructorNames.length ? { coInstructors: instructorNames } : {}),
      };

      if (bannerImageFile) {
        const formData = new FormData();
        formData.append('title', courseName.trim());
        formData.append('slug', slug.trim());
        formData.append('programId', programId || '');
        formData.append('description', previewDescription.trim());
        formData.append('mentor', mentorDisplay);
        formData.append('hours', String(parseHoursLabel(courseDuration)));
        formData.append('videoHoursLabel', videoDuration.trim() === '' ? '' : videoDuration.trim());
        formData.append('marketingPayload', JSON.stringify(marketingPayload));
        formData.append('bannerImage', bannerImageFile);
        const json = await runCommand('course.update', {
          publicId: courseId,
          body: formData,
        });
        onSaved?.(json?.data);
      } else {
        const json = await runCommand('course.update', {
          publicId: courseId,
          body: {
          title: courseName.trim(),
          slug: slug.trim(),
          programId: programId || null,
          description: previewDescription.trim(),
          mentor: mentorDisplay,
          hours: parseHoursLabel(courseDuration),
          videoHoursLabel: videoDuration.trim() === '' ? null : videoDuration.trim(),
          marketing: marketingPayload,
          },
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
    runCommand,
    bannerImageFile,
    bannerUrl,
    courseDuration,
    courseName,
    descriptionHtml,
    instructorNameById,
    learnHtml,
    selectedInstructorIds,
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
          instructorIds={selectedInstructorIds}
          onInstructorIdsChange={setSelectedInstructorIds}
          instructorOptions={instructorOptions}
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
