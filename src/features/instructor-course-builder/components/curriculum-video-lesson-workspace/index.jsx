import dayjs from 'dayjs';
import { useRef, useMemo, useState, useEffect, useCallback, useLayoutEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';
import {
  deleteLessonMaterial,
  getLmsAxiosErrorMessage,
  fetchLessonMaterialBlob,
  postLessonMaterialForModule,
  postLessonMaterialForStandaloneLesson,
} from 'src/lib/lms-instructor-api';

import { toast } from 'src/components/snackbar';

import { styles } from '../curriculum-text-lesson-workspace/styles';
import { VideoLessonWorkspaceHeader } from '../video-lesson-workspace-header';
import { VideoLessonWorkspaceFields } from '../video-lesson-workspace-fields';
import { TextLessonWorkspaceSettings } from '../text-lesson-workspace-settings';
import { TextLessonWorkspaceMaterials } from '../text-lesson-workspace-materials';
import { TextLessonWorkspaceEditorSection } from '../text-lesson-workspace-editor-section';
import {
  dayjsFromClockString,
  normalizeVideoWorkspaceMeta,
} from '../../utils/lesson-authoring-helpers';

export function CurriculumVideoLessonWorkspace({
  lesson,
  onLessonTitleChange,
  onLessonSave,
  saveLiveRichLesson,
  liveLessonAuthoring = null,
  onLessonMaterialsInvalidate,
}) {
  const [workspaceTab, setWorkspaceTab] = useState(0);
  const [posterUploading, setPosterUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState('');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const posterBlobRef = useRef(null);
  const videoBlobRef = useRef(null);

  const assignPosterPreviewUrl = useCallback((blobUrlOrNull) => {
    const next =
      typeof blobUrlOrNull === 'string' && blobUrlOrNull.startsWith('blob:') ? blobUrlOrNull : null;
    const prev = posterBlobRef.current;
    if (prev && prev !== next) {
      URL.revokeObjectURL(prev);
    }
    posterBlobRef.current = next;
    setPosterPreviewUrl(next ?? '');
  }, []);

  const assignVideoPreviewUrl = useCallback((blobUrlOrNull) => {
    const next =
      typeof blobUrlOrNull === 'string' && blobUrlOrNull.startsWith('blob:') ? blobUrlOrNull : null;
    const prev = videoBlobRef.current;
    if (prev && prev !== next) {
      URL.revokeObjectURL(prev);
    }
    videoBlobRef.current = next;
    setVideoPreviewUrl(next ?? '');
  }, []);

  useEffect(
    () => () => {
      if (posterBlobRef.current) {
        URL.revokeObjectURL(posterBlobRef.current);
      }
      if (videoBlobRef.current) {
        URL.revokeObjectURL(videoBlobRef.current);
      }
    },
    []
  );
  const [sourceType, setSourceType] = useState('html-mp4');
  const [videoWidth, setVideoWidth] = useState('');
  const [duration, setDuration] = useState('');
  const [videoPosterLessonMaterialPublicId, setVideoPosterLessonMaterialPublicId] = useState(null);
  const [videoLessonMaterialPublicId, setVideoLessonMaterialPublicId] = useState(null);
  const [lessonPreview, setLessonPreview] = useState(false);
  const [unlockAfterPurchase, setUnlockAfterPurchase] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [shortDescriptionHtml, setShortDescriptionHtml] = useState('');
  const [lessonContentHtml, setLessonContentHtml] = useState('');

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
    const t = lesson?.type;
    if (typeof id !== 'string' || (t !== 'document' && t !== 'video') || id.endsWith('-core')) {
      return null;
    }
    return id;
  }, [lesson?.id, lesson?.type, liveLessonAuthoring?.standaloneLessonPublicId]);

  const lessonMaterials = useMemo(
    () => (Array.isArray(liveLessonAuthoring?.lessonMaterials) ? liveLessonAuthoring.lessonMaterials : []),
    [liveLessonAuthoring?.lessonMaterials]
  );

  const posterLinkedName = useMemo(() => {
    if (!videoPosterLessonMaterialPublicId) return null;
    return lessonMaterials.find((m) => m.id === videoPosterLessonMaterialPublicId)?.name ?? null;
  }, [lessonMaterials, videoPosterLessonMaterialPublicId]);

  const videoLinkedName = useMemo(() => {
    if (!videoLessonMaterialPublicId) return null;
    return lessonMaterials.find((m) => m.id === videoLessonMaterialPublicId)?.name ?? null;
  }, [lessonMaterials, videoLessonMaterialPublicId]);

  useEffect(() => {
    setWorkspaceTab(0);
  }, [lesson.id, lesson.type]);

  useLayoutEffect(() => {
    if (!saveLiveRichLesson || !liveLessonAuthoring) {
      setSourceType('html-mp4');
      setVideoWidth('');
      setDuration('');
      setVideoPosterLessonMaterialPublicId(null);
      setVideoLessonMaterialPublicId(null);
      setLessonPreview(false);
      setUnlockAfterPurchase(false);
      setStartDate(null);
      setStartTime(null);
      setShortDescriptionHtml('');
      setLessonContentHtml('');
      assignPosterPreviewUrl(null);
      assignVideoPreviewUrl(null);
      return;
    }

    const lm =
      liveLessonAuthoring.lessonMeta && typeof liveLessonAuthoring.lessonMeta === 'object'
        ? liveLessonAuthoring.lessonMeta
        : {};

    const vst = lm.videoSourceType != null ? String(lm.videoSourceType).trim() : '';
    setSourceType(vst || 'html-mp4');

    const w = lm.videoWidthPx != null ? String(lm.videoWidthPx).trim() : '';
    setVideoWidth(w);

    setVideoPosterLessonMaterialPublicId(
      lm.videoPosterLessonMaterialPublicId != null &&
        String(lm.videoPosterLessonMaterialPublicId).trim() !== ''
        ? String(lm.videoPosterLessonMaterialPublicId).trim()
        : null
    );
    setVideoLessonMaterialPublicId(
      lm.videoLessonMaterialPublicId != null &&
        String(lm.videoLessonMaterialPublicId).trim() !== ''
        ? String(lm.videoLessonMaterialPublicId).trim()
        : null
    );

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
  }, [
    lesson.id,
    lesson.type,
    saveLiveRichLesson,
    liveLessonAuthoring,
    lessonAuthorFingerprint,
    assignPosterPreviewUrl,
    assignVideoPreviewUrl,
  ]);

  useEffect(() => {
    let cancelled = false;
    const pid =
      typeof videoPosterLessonMaterialPublicId === 'string'
        ? videoPosterLessonMaterialPublicId.trim()
        : '';

    async function load() {
      if (posterUploading) return;
      if (!pid || !CONFIG.serverUrl?.trim()) {
        assignPosterPreviewUrl(null);
        return;
      }

      try {
        const blob = await fetchLessonMaterialBlob(pid);
        if (cancelled || posterUploading) return;
        assignPosterPreviewUrl(URL.createObjectURL(blob));
      } catch {
        /* keep thumbnail from local blob if catalog refetch lagged */
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [videoPosterLessonMaterialPublicId, posterUploading, assignPosterPreviewUrl]);

  useEffect(() => {
    let cancelled = false;
    const vid =
      typeof videoLessonMaterialPublicId === 'string'
        ? videoLessonMaterialPublicId.trim()
        : '';

    async function load() {
      if (videoUploading) return;
      if (!vid || !CONFIG.serverUrl?.trim()) {
        assignVideoPreviewUrl(null);
        return;
      }

      try {
        const blob = await fetchLessonMaterialBlob(vid);
        if (cancelled || videoUploading) return;
        assignVideoPreviewUrl(URL.createObjectURL(blob));
      } catch {
        /* keep optimistic preview during transient API errors */
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [videoLessonMaterialPublicId, videoUploading, assignVideoPreviewUrl]);

  const buildLessonMetaForSave = useCallback(
    (overrides = {}) =>
      normalizeVideoWorkspaceMeta(
        {
          lessonPreview,
          unlockAfterPurchase,
          startDate,
          startTime,
          durationLabel: duration.trim(),
          videoSourceType: sourceType,
          videoWidthPx: videoWidth,
          videoPosterLessonMaterialPublicId,
          videoLessonMaterialPublicId,
          ...overrides,
        },
        { durationLabelFallback: duration }
      ),
    [
      duration,
      lessonPreview,
      sourceType,
      startDate,
      startTime,
      unlockAfterPurchase,
      videoLessonMaterialPublicId,
      videoPosterLessonMaterialPublicId,
      videoWidth,
    ]
  );

  const persistLesson = useCallback(async () => {
    if (saveLiveRichLesson) {
      try {
        await saveLiveRichLesson({
          title: lesson.title,
          durationLabel: duration.trim(),
          shortDescriptionHtml,
          lessonContentHtml,
          lessonMeta: buildLessonMetaForSave(),
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
    buildLessonMetaForSave,
    duration,
    lesson.id,
    lesson.title,
    lessonContentHtml,
    onLessonSave,
    saveLiveRichLesson,
    shortDescriptionHtml,
  ]);

  const materialUploadTarget = useMemo(() => {
    const hasStandalone = Boolean(
      materialStandaloneLessonPublicId &&
        String(materialStandaloneLessonPublicId).trim() !== ''
    );
    if (hasStandalone) {
      return { kind: 'standalone', id: materialStandaloneLessonPublicId };
    }
    if (materialModulePublicId && String(materialModulePublicId).trim() !== '') {
      return { kind: 'module', id: materialModulePublicId };
    }
    return null;
  }, [materialModulePublicId, materialStandaloneLessonPublicId]);

  const uploadLessonMaterialAndLink = useCallback(
    async (file, linkField) => {
      if (!file) {
        return;
      }
      if (!CONFIG.serverUrl?.trim()) {
        toast.error(
          'Set VITE_SERVER_URL to your Laravel app origin (e.g. http://127.0.0.1:8000) and restart the dev server.'
        );
        return;
      }
      if (!materialUploadTarget) {
        toast.error('Select a video lesson tied to your course before uploading.');
        return;
      }
      if (!saveLiveRichLesson) {
        toast.error('Sign in with LMS authoring enabled to upload files.');
        return;
      }

      const setBusy = linkField === 'poster' ? setPosterUploading : setVideoUploading;
      const assignPreview =
        linkField === 'poster' ? assignPosterPreviewUrl : assignVideoPreviewUrl;

      setBusy(true);
      assignPreview(URL.createObjectURL(file));
      try {
        const raw =
          materialUploadTarget.kind === 'standalone'
            ? await postLessonMaterialForStandaloneLesson(materialUploadTarget.id, file)
            : await postLessonMaterialForModule(materialUploadTarget.id, file);
        const uploadedId =
          raw?.data?.id != null
            ? String(raw.data.id)
            : raw?.id != null
              ? String(raw.id)
              : null;
        if (!uploadedId) {
          throw new Error('Upload response missing material id.');
        }

        const nextPoster =
          linkField === 'poster' ? uploadedId : videoPosterLessonMaterialPublicId;
        const nextVideo =
          linkField === 'video' ? uploadedId : videoLessonMaterialPublicId;

        if (linkField === 'poster') {
          setVideoPosterLessonMaterialPublicId(uploadedId);
        } else {
          setVideoLessonMaterialPublicId(uploadedId);
        }

        await saveLiveRichLesson({
          title: lesson.title,
          durationLabel: duration.trim(),
          shortDescriptionHtml,
          lessonContentHtml,
          lessonMeta: buildLessonMetaForSave({
            videoPosterLessonMaterialPublicId: nextPoster,
            videoLessonMaterialPublicId: nextVideo,
          }),
        });

        toast.success(linkField === 'poster' ? 'Poster uploaded and linked.' : 'Video uploaded and linked.');
      } catch (e) {
        toast.error(getLmsAxiosErrorMessage(e, 'Upload failed.'));
      } finally {
        setBusy(false);
      }
    },
    [
      assignPosterPreviewUrl,
      assignVideoPreviewUrl,
      buildLessonMetaForSave,
      duration,
      lesson.title,
      lessonContentHtml,
      materialUploadTarget,
      saveLiveRichLesson,
      shortDescriptionHtml,
      videoLessonMaterialPublicId,
      videoPosterLessonMaterialPublicId,
    ]
  );

  const handlePosterFiles = useCallback(
    (files) => {
      const f = files?.[0];
      void uploadLessonMaterialAndLink(f, 'poster');
    },
    [uploadLessonMaterialAndLink]
  );

  const handleVideoFiles = useCallback(
    (files) => {
      const f = files?.[0];
      void uploadLessonMaterialAndLink(f, 'video');
    },
    [uploadLessonMaterialAndLink]
  );

  const handleRemovePoster = useCallback(async () => {
    const rawId =
      typeof videoPosterLessonMaterialPublicId === 'string'
        ? videoPosterLessonMaterialPublicId.trim()
        : '';

    if (!rawId) {
      assignPosterPreviewUrl(null);
      return;
    }

    if (!saveLiveRichLesson) {
      assignPosterPreviewUrl(null);
      setVideoPosterLessonMaterialPublicId(null);
      toast.success('Poster cleared.');
      return;
    }

    if (!window.confirm('Remove this poster from the lesson? The uploaded image will be deleted.')) {
      return;
    }

    setPosterUploading(true);
    try {
      await saveLiveRichLesson({
        title: lesson.title,
        durationLabel: duration.trim(),
        shortDescriptionHtml,
        lessonContentHtml,
        lessonMeta: buildLessonMetaForSave({
          videoPosterLessonMaterialPublicId: null,
        }),
      });
      assignPosterPreviewUrl(null);
      setVideoPosterLessonMaterialPublicId(null);
      await deleteLessonMaterial(rawId);
      await onLessonMaterialsInvalidate?.();
      toast.success('Poster removed.');
    } catch (e) {
      toast.error(getLmsAxiosErrorMessage(e, 'Could not remove poster.'));
    } finally {
      setPosterUploading(false);
    }
  }, [
    assignPosterPreviewUrl,
    buildLessonMetaForSave,
    duration,
    lesson.title,
    lessonContentHtml,
    onLessonMaterialsInvalidate,
    saveLiveRichLesson,
    shortDescriptionHtml,
    videoPosterLessonMaterialPublicId,
  ]);

  const handleRemoveVideo = useCallback(async () => {
    const rawId =
      typeof videoLessonMaterialPublicId === 'string' ? videoLessonMaterialPublicId.trim() : '';

    if (!rawId) {
      assignVideoPreviewUrl(null);
      return;
    }

    if (!saveLiveRichLesson) {
      assignVideoPreviewUrl(null);
      setVideoLessonMaterialPublicId(null);
      toast.success('Video cleared.');
      return;
    }

    if (!window.confirm('Remove this video from the lesson? The uploaded file will be deleted.')) {
      return;
    }

    setVideoUploading(true);
    try {
      await saveLiveRichLesson({
        title: lesson.title,
        durationLabel: duration.trim(),
        shortDescriptionHtml,
        lessonContentHtml,
        lessonMeta: buildLessonMetaForSave({
          videoLessonMaterialPublicId: null,
        }),
      });
      assignVideoPreviewUrl(null);
      setVideoLessonMaterialPublicId(null);
      await deleteLessonMaterial(rawId);
      await onLessonMaterialsInvalidate?.();
      toast.success('Video removed.');
    } catch (e) {
      toast.error(getLmsAxiosErrorMessage(e, 'Could not remove video.'));
    } finally {
      setVideoUploading(false);
    }
  }, [
    assignVideoPreviewUrl,
    buildLessonMetaForSave,
    duration,
    lesson.title,
    lessonContentHtml,
    onLessonMaterialsInvalidate,
    saveLiveRichLesson,
    shortDescriptionHtml,
    videoLessonMaterialPublicId,
  ]);

  const showPosterRemoveControls = Boolean(
    saveLiveRichLesson ? videoPosterLessonMaterialPublicId : posterPreviewUrl
  );
  const showVideoRemoveControls = Boolean(
    saveLiveRichLesson ? videoLessonMaterialPublicId : videoPreviewUrl
  );

  const posterSecondaryHint =
    videoPosterLessonMaterialPublicId ?
      posterLinkedName ?
        `Linked: ${posterLinkedName}`
      : `Linked material id: ${videoPosterLessonMaterialPublicId}`
    : null;

  const videoSecondaryHint =
    videoLessonMaterialPublicId ?
      videoLinkedName ?
        `Linked: ${videoLinkedName}`
      : `Linked material id: ${videoLessonMaterialPublicId}`
    : null;

  return (
    <Box sx={(theme) => styles.root(theme)}>
      <VideoLessonWorkspaceHeader
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
          <VideoLessonWorkspaceFields
            sourceType={sourceType}
            onSourceTypeChange={setSourceType}
            videoWidth={videoWidth}
            onVideoWidthChange={setVideoWidth}
            duration={duration}
            onDurationChange={setDuration}
            onPosterFiles={handlePosterFiles}
            onVideoFiles={handleVideoFiles}
            posterSecondaryHint={posterSecondaryHint}
            videoSecondaryHint={videoSecondaryHint}
            posterPreviewUrl={posterPreviewUrl}
            videoPreviewUrl={videoPreviewUrl}
            posterUploading={posterUploading}
            videoUploading={videoUploading}
            onPosterRemove={handleRemovePoster}
            onVideoRemove={handleRemoveVideo}
            showPosterRemove={showPosterRemoveControls}
            showVideoRemove={showVideoRemoveControls}
          />

          <TextLessonWorkspaceSettings
            lessonPreview={lessonPreview}
            onLessonPreviewChange={setLessonPreview}
            unlockAfterPurchase={unlockAfterPurchase}
            onUnlockAfterPurchaseChange={setUnlockAfterPurchase}
            startDate={startDate}
            onStartDateChange={setStartDate}
            startTime={startTime}
            onStartTimeChange={setStartTime}
            hideDuration
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
            placeholder="Write supporting notes or a transcript…"
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
            lessonMaterials={lessonMaterials}
            apiConfigured={Boolean(CONFIG.serverUrl?.trim())}
            modulePublicId={materialModulePublicId}
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
        <Button
          variant="contained"
          color="primary"
          onClick={persistLesson}
          sx={styles.footerButton}
          disabled={posterUploading || videoUploading}
        >
          {saveLiveRichLesson ? 'Save lesson' : 'Create'}
        </Button>
      </Stack>
    </Box>
  );
}
