import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { toast } from 'src/components/snackbar';

import { styles } from '../curriculum-text-lesson-workspace/styles';
import { VideoLessonWorkspaceHeader } from '../video-lesson-workspace-header';
import { VideoLessonWorkspaceFields } from '../video-lesson-workspace-fields';
import { TextLessonWorkspaceSettings } from '../text-lesson-workspace-settings';
import { TextLessonWorkspaceMaterials } from '../text-lesson-workspace-materials';
import { TextLessonWorkspaceEditorSection } from '../text-lesson-workspace-editor-section';

export function CurriculumVideoLessonWorkspace({ lesson, onLessonTitleChange, onLessonSave }) {
  const [workspaceTab, setWorkspaceTab] = useState(0);
  const [sourceType, setSourceType] = useState('html-mp4');
  const [videoWidth, setVideoWidth] = useState('');
  const [duration, setDuration] = useState('');
  const [lessonPreview, setLessonPreview] = useState(false);
  const [unlockAfterPurchase, setUnlockAfterPurchase] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [shortDescriptionHtml, setShortDescriptionHtml] = useState('');
  const [lessonContentHtml, setLessonContentHtml] = useState('');

  useEffect(() => {
    setWorkspaceTab(0);
    setSourceType('html-mp4');
    setVideoWidth('');
    setDuration('');
    setLessonPreview(false);
    setUnlockAfterPurchase(false);
    setStartDate(null);
    setStartTime(null);
    setShortDescriptionHtml('');
    setLessonContentHtml('');
  }, [lesson.id, lesson.type]);

  const handleCreate = useCallback(() => {
    onLessonSave?.(lesson.id);
    toast.success(`Lesson “${lesson.title}” saved (demo).`);
  }, [lesson.id, lesson.title, onLessonSave]);

  return (
    <Box sx={(theme) => styles.root(theme)}>
      <VideoLessonWorkspaceHeader
        lessonTitle={lesson.title}
        onLessonTitleChange={(title) => onLessonTitleChange(lesson.id, title)}
        onCreate={handleCreate}
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
            onPosterFiles={() => {}}
            onVideoFiles={() => {}}
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
          />

          <TextLessonWorkspaceMaterials key={`${lesson.id}-files`} />
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
        <Button variant="contained" color="primary" onClick={handleCreate} sx={styles.footerButton}>
          Create
        </Button>
      </Stack>
    </Box>
  );
}
