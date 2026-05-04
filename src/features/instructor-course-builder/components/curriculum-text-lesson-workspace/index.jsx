import dayjs from 'dayjs';
import { useMemo, useState, useEffect, useCallback, useLayoutEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';
import { getLmsAxiosErrorMessage } from 'src/lib/lms-instructor-api';

import { toast } from 'src/components/snackbar';

import { styles } from './styles';
import { TextLessonWorkspaceHeader } from '../text-lesson-workspace-header';
import { TextLessonWorkspaceSettings } from '../text-lesson-workspace-settings';
import { TextLessonWorkspaceMaterials } from '../text-lesson-workspace-materials';
import { TextLessonWorkspaceEditorSection } from '../text-lesson-workspace-editor-section';
import { dayjsFromClockString, normalizeLessonMetaForApi } from '../../utils/lesson-authoring-helpers';

/**
 * @typedef {object} LiveLessonAuthoringHydration
 * @property {string} [updatedAt]
 * @property {string} [excerptHtml]
 * @property {string} [bodyHtml]
 * @property {string} [durationLabel]
 * @property {boolean} [lessonPreview]
 * @property {boolean} [unlockAfterPurchase]
 * @property {string|null} [startDate]
 * @property {string|null} [startTime]
 * @property {Array<{ id: string, name: string, mime?: string|null, sizeBytes?: number }>} [lessonMaterials]
 * @property {string} modulePublicId
 * @property {string|null} [standaloneLessonPublicId]
 * @property {boolean} [isCoreLesson]
 */

export function CurriculumTextLessonWorkspace({
  lesson,
  onLessonTitleChange,
  onLessonSave,
  /** When set, PATCH live LMS authoring fields (`excerpt_html`, `body_html`, `lesson_meta`, …). */
  saveLiveRichLesson,
  /** Server snapshot driving initial field values (`GET /modules?courseId=…`). */
  liveLessonAuthoring = null,
  /** Refetch modules catalog after uploads / deletes. */
  onLessonMaterialsInvalidate,
}) {
  const [workspaceTab, setWorkspaceTab] = useState(0);
  const [duration, setDuration] = useState('');
  const [lessonPreview, setLessonPreview] = useState(false);
  const [unlockAfterPurchase, setUnlockAfterPurchase] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [shortDescriptionHtml, setShortDescriptionHtml] = useState('');
  const [lessonContentHtml, setLessonContentHtml] = useState('');

  /** Bump TipTap `--contentRevision` when catalog data changes (save + `/modules` refresh, etc.). */
  const lessonAuthorFingerprint = useMemo(() => {
    if (!saveLiveRichLesson || !liveLessonAuthoring) {
      return '';
    }
    const excerpt = liveLessonAuthoring.excerptHtml ?? '';
    const body = liveLessonAuthoring.bodyHtml ?? '';
    const lite = (raw) => {
      const str = typeof raw === 'string' ? raw : String(raw ?? '');
      const cap = str.length <= 2048 ? str : `${str.slice(0, 512)}::${str.slice(-512)}`;
      return `${str.length}:${cap}`;
    };
    const meta = liveLessonAuthoring.lessonMeta ?? {};
    let metaStable = '';
    try {
      metaStable = JSON.stringify(meta);
    } catch {
      metaStable = String(meta);
    }
    const matsKey = Array.isArray(liveLessonAuthoring.lessonMaterials)
      ? liveLessonAuthoring.lessonMaterials
          .map((x) => x?.id)
          .filter(Boolean)
          .sort()
          .join(',')
      : '';
    return [
      lite(excerpt),
      lite(body),
      metaStable,
      matsKey,
      liveLessonAuthoring.isCoreLesson ? 'core' : 'standalone',
    ].join('|');
  }, [liveLessonAuthoring, saveLiveRichLesson]);

  const materialModulePublicId = useMemo(() => {
    if (liveLessonAuthoring?.modulePublicId != null && String(liveLessonAuthoring.modulePublicId).trim() !== '') {
      return liveLessonAuthoring.modulePublicId;
    }
    const id = lesson?.id;
    if (typeof id === 'string' && id.endsWith('-core')) {
      return id.slice(0, -'-core'.length);
    }
    return null;
  }, [lesson?.id, liveLessonAuthoring?.modulePublicId]);

  const materialStandaloneLessonPublicId = useMemo(() => {
    if (
      liveLessonAuthoring?.standaloneLessonPublicId != null &&
      String(liveLessonAuthoring.standaloneLessonPublicId).trim() !== ''
    ) {
      return liveLessonAuthoring.standaloneLessonPublicId;
    }
    const id = lesson?.id;
    if (
      typeof id !== 'string' ||
      (lesson?.type !== 'document' && lesson?.type !== 'video') ||
      id.endsWith('-core')
    ) {
      return null;
    }
    return id;
  }, [lesson?.id, lesson?.type, liveLessonAuthoring?.standaloneLessonPublicId]);

  useEffect(() => {
    setWorkspaceTab(0);
  }, [lesson.id, lesson.type]);

  useLayoutEffect(() => {
    if (!saveLiveRichLesson || !liveLessonAuthoring) {
      setDuration('');
      setLessonPreview(false);
      setUnlockAfterPurchase(false);
      setStartDate(null);
      setStartTime(null);
      setShortDescriptionHtml('');
      setLessonContentHtml('');
      return;
    }

    const lm =
      liveLessonAuthoring.lessonMeta && typeof liveLessonAuthoring.lessonMeta === 'object'
        ? liveLessonAuthoring.lessonMeta
        : {};

    if (liveLessonAuthoring.isCoreLesson) {
      setDuration(
        String(
          liveLessonAuthoring.duration ??
            lm.durationLabel ??
            liveLessonAuthoring.durationLabel ??
            ''
        ).trim()
      );
    } else {
      setDuration(String(lm.durationLabel ?? liveLessonAuthoring.durationLabel ?? '').trim());
    }

    setLessonPreview(!!lm.lessonPreview);
    setUnlockAfterPurchase(!!lm.unlockAfterPurchase);
    const startD = lm.startDate ? dayjs(String(lm.startDate)) : null;
    setStartDate(startD?.isValid() ? startD.startOf('day') : null);
    setStartTime(dayjsFromClockString(lm.startTime != null ? String(lm.startTime) : '') || null);

    setShortDescriptionHtml(String(liveLessonAuthoring.excerptHtml ?? '').trim());
    setLessonContentHtml(String(liveLessonAuthoring.bodyHtml ?? '').trim());
  }, [lesson.id, lesson.type, saveLiveRichLesson, liveLessonAuthoring, lessonAuthorFingerprint]);

  const persistLesson = useCallback(async () => {
    if (saveLiveRichLesson) {
      try {
        const normalizedMeta = normalizeLessonMetaForApi(
          {
            lessonPreview,
            unlockAfterPurchase,
            startDate,
            startTime,
            durationLabel: duration.trim(),
          },
          { durationLabelFallback: duration }
        );

        await saveLiveRichLesson({
          title: lesson.title,
          durationLabel: duration.trim(),
          shortDescriptionHtml,
          lessonContentHtml,
          lessonMeta: normalizedMeta,
        });
        toast.success('Lesson saved.');
      } catch (e) {
        toast.error(getLmsAxiosErrorMessage(e, 'Save failed.'));
      }
      return;
    }
    onLessonSave?.(lesson.id);
    toast.success(`Lesson “${lesson.title}” saved (demo).`);
  }, [
    duration,
    lesson.id,
    lesson.title,
    lessonContentHtml,
    lessonPreview,
    onLessonSave,
    saveLiveRichLesson,
    shortDescriptionHtml,
    startDate,
    startTime,
    unlockAfterPurchase,
  ]);

  return (
    <Box sx={(theme) => styles.root(theme)}>
      <TextLessonWorkspaceHeader
        lessonTitle={lesson.title}
        onLessonTitleChange={(title) => onLessonTitleChange(lesson.id, title)}
        onCreate={persistLesson}
        actionLabel={saveLiveRichLesson ? 'Save lesson' : 'Create'}
      />

      <Box sx={styles.tabsBar}>
        <Tabs
          value={workspaceTab}
          onChange={(_, v) => setWorkspaceTab(v)}
          variant="fullWidth"
          sx={(theme) => styles.tabs(theme)}
        >
          <Tab label="Lesson" disableRipple />
          <Tab label="Q&A" disableRipple />
        </Tabs>
      </Box>

      {workspaceTab === 0 ? (
        <Stack sx={styles.lessonPanel}>
          <TextLessonWorkspaceSettings
            duration={duration}
            onDurationChange={setDuration}
            lessonPreview={lessonPreview}
            onLessonPreviewChange={setLessonPreview}
            unlockAfterPurchase={unlockAfterPurchase}
            onUnlockAfterPurchaseChange={setUnlockAfterPurchase}
            startDate={startDate}
            onStartDateChange={setStartDate}
            startTime={startTime}
            onStartTimeChange={setStartTime}
          />

          <TextLessonWorkspaceEditorSection
            key={`${lesson.id}-short`}
            label="Short description of the lesson"
            value={shortDescriptionHtml}
            onChange={setShortDescriptionHtml}
            placeholder="Summarize this lesson for the course outline…"
            minHeight={380}
            maxHeight={640}
            contentRevision={
              saveLiveRichLesson && lessonAuthorFingerprint
                ? `short|${lessonAuthorFingerprint}`
                : undefined
            }
            revisionApplyHtml={
              saveLiveRichLesson ? String(liveLessonAuthoring?.excerptHtml ?? '').trim() : undefined
            }
          />

          <TextLessonWorkspaceEditorSection
            key={`${lesson.id}-content`}
            label="Lesson content"
            value={lessonContentHtml}
            onChange={setLessonContentHtml}
            placeholder="Write the full lesson content…"
            minHeight={440}
            maxHeight={880}
            fullItem
            contentRevision={
              saveLiveRichLesson && lessonAuthorFingerprint
                ? `body|${lessonAuthorFingerprint}`
                : undefined
            }
            revisionApplyHtml={
              saveLiveRichLesson ? String(liveLessonAuthoring?.bodyHtml ?? '').trim() : undefined
            }
          />

          <TextLessonWorkspaceMaterials
            key={`${lesson.id}-files`}
            lessonMaterials={liveLessonAuthoring?.lessonMaterials ?? []}
            apiConfigured={Boolean(CONFIG.serverUrl?.trim())}
            modulePublicId={materialModulePublicId}
            moduleResourcePublicId={
              liveLessonAuthoring?.isCoreLesson
                ? liveLessonAuthoring?.moduleLessonResourcePublicId ?? null
                : null
            }
            standaloneLessonPublicId={materialStandaloneLessonPublicId}
            onAfterMaterialsChange={() => {
              void onLessonMaterialsInvalidate?.();
            }}
          />
        </Stack>
      ) : (
        <Box sx={styles.qaPanel}>
          <Typography sx={styles.qaText}>
            Q&A for this lesson will appear here. Learners can ask questions after the lesson is
            published (demo).
          </Typography>
        </Box>
      )}

      <Stack direction="row" justifyContent="flex-end" sx={styles.footer}>
        <Button variant="contained" color="primary" onClick={persistLesson} sx={styles.footerButton}>
          {saveLiveRichLesson ? 'Save lesson' : 'Create'}
        </Button>
      </Stack>
    </Box>
  );
}
