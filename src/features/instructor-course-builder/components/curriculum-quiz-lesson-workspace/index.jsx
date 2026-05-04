import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { styles } from './styles';
import { QuizTabs } from './quiz-tabs';
import { AnswerList } from './answer-list';
import { QuizHeader } from './quiz-header';
import { FooterActions } from './footer-actions';
import { QuestionEditor } from './question-editor';
import { QuestionSettings } from './question-settings';
import { QuizSettingsPanel } from './quiz-settings-panel';
import { QuestionCardChrome } from './question-card-chrome';
import { QuestionCollapsedBar } from './question-collapsed-bar';
import { QuizQuestionSortableItem } from './quiz-question-sortable-item';
import { nid, createDemoQuestion, createBlankQuestion } from './quiz-question-factory';
import { useQuizQuestionListDropMonitor } from './use-quiz-question-list-drop-monitor';

function normalizeLoadedQuizQuestions(rows) {
  const list = Array.isArray(rows) ? rows : [];
  if (list.length === 0) {
    return [createDemoQuestion()];
  }
  return list.map((q) => {
    const optionsRaw = Array.isArray(q?.options)
      ? q.options
      : Array.isArray(q?.choices)
        ? q.choices.map((label) => ({ label, isCorrect: false }))
        : [];
    const answers = optionsRaw.map((opt) => ({
      id: typeof opt?.id === 'string' ? opt.id : nid(),
      text: String(opt?.label ?? ''),
      isCorrect: Boolean(opt?.isCorrect),
    }));
    const fallbackId = answers[0]?.id ?? nid();
    const correct = answers.find((a) => a.isCorrect)?.id ?? fallbackId;
    return {
      id: typeof q?.id === 'string' ? q.id : nid(),
      collapsed: true,
      questionText: typeof q?.prompt === 'string' ? q.prompt : '',
      questionType: 'single_choice',
      required: false,
      answers: answers.length > 0 ? answers.map(({ id, text }) => ({ id, text })) : [{ id: fallbackId, text: '' }],
      correctAnswerId: correct,
      newAnswerDraft: '',
    };
  });
}

function toPersistedQuizQuestions(questions) {
  return (Array.isArray(questions) ? questions : [])
    .map((q) => ({
      prompt: String(q?.questionText ?? '').trim(),
      choices: (Array.isArray(q?.answers) ? q.answers : [])
        .map((a) => ({
          label: String(a?.text ?? '').trim(),
          isCorrect: String(a?.id ?? '') === String(q?.correctAnswerId ?? ''),
        }))
        .filter((c) => c.label !== ''),
    }))
    .filter((q) => q.prompt !== '' && q.choices.length >= 2);
}

export function CurriculumQuizLessonWorkspace({
  lesson,
  onLessonTitleChange,
  onLessonSave,
  liveQuizLoader,
  saveLiveQuizLesson,
  liveQuizAuthoring,
  saveLiveQuizSettings,
}) {
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState(() => [createDemoQuestion()]);
  const [savingLive, setSavingLive] = useState(false);
  const [savingQuizSettings, setSavingQuizSettings] = useState(false);
  const mainColumnRef = useRef(null);
  const quizSettingsPanelRef = useRef(null);

  useEffect(() => {
    setActiveTab('questions');
  }, [lesson.id]);

  useEffect(() => {
    let alive = true;

    if (typeof liveQuizLoader !== 'function') {
      setQuestions([createDemoQuestion()]);
      return () => {
        alive = false;
      };
    }

    void (async () => {
      try {
        const rows = await liveQuizLoader(lesson.id);
        if (alive) {
          setQuestions(normalizeLoadedQuizQuestions(rows));
        }
      } catch {
        if (alive) {
          setQuestions([createDemoQuestion()]);
          toast.error('Could not load quiz questions.');
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [lesson.id, liveQuizLoader]);

  const reorderQuestions = useCallback((updateList) => {
    setQuestions((prev) => updateList(prev));
  }, []);

  useQuizQuestionListDropMonitor({ listRef: mainColumnRef, onReorder: reorderQuestions });

  const saveQuizNow = useCallback(async () => {
    if (typeof saveLiveQuizLesson === 'function') {
      setSavingLive(true);
      try {
        const payloadQuestions = toPersistedQuizQuestions(questions);
        await saveLiveQuizLesson({
          quizId: lesson.id,
          title: lesson.title,
          questions: payloadQuestions,
        });
        onLessonSave?.(lesson.id);
        toast.success(`Quiz “${lesson.title}” saved.`);
      } finally {
        setSavingLive(false);
      }
      return;
    }

    onLessonSave?.(lesson.id);
    toast.success(`Quiz “${lesson.title}” saved (demo).`);
  }, [lesson.id, lesson.title, onLessonSave, questions, saveLiveQuizLesson]);

  const handleHeaderSave = useCallback(() => {
    if (activeTab === 'settings') {
      void quizSettingsPanelRef.current?.save?.();
      return;
    }
    void saveQuizNow();
  }, [activeTab, saveQuizNow]);

  const saveLiveQuizSettingsForPanel = useMemo(() => {
    if (typeof saveLiveQuizSettings !== 'function') {
      return undefined;
    }
    return async (settingsPayload) => {
      await saveLiveQuizSettings({
        quizId: lesson.id,
        title: lesson.title,
        ...settingsPayload,
      });
    };
  }, [lesson.id, lesson.title, saveLiveQuizSettings]);

  const handleFooterSave = useCallback(() => {
    void saveQuizNow();
  }, [saveQuizNow]);

  const handleAddQuestion = useCallback(() => {
    setQuestions((prev) => [...prev.map((q) => ({ ...q, collapsed: true })), createBlankQuestion()]);
  }, []);

  const patchQuestion = useCallback((questionId, partial) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, ...partial } : q))
    );
  }, []);

  const handleAnswerText = useCallback((questionId, answerId, text) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id !== questionId
          ? q
          : { ...q, answers: q.answers.map((a) => (a.id === answerId ? { ...a, text } : a)) }
      )
    );
  }, []);

  const handleAddAnswer = useCallback((questionId) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const t = q.newAnswerDraft.trim();
        if (!t) return q;
        return {
          ...q,
          answers: [...q.answers, { id: nid(), text: t }],
          newAnswerDraft: '',
        };
      })
    );
  }, []);

  const handleDeleteQuestion = useCallback((questionId) => {
    setQuestions((prev) => {
      if (prev.length <= 1) {
        toast.warning('Add another question before removing this one.');
        return prev;
      }
      return prev.filter((q) => q.id !== questionId);
    });
  }, []);

  const allQuestionsCollapsed =
    questions.length > 0 && questions.every((question) => question.collapsed);

  const handleToggleAllQuestionsCollapsed = useCallback(() => {
    setQuestions((prev) => {
      const shouldCollapse = prev.some((q) => !q.collapsed);
      return prev.map((q) => ({ ...q, collapsed: shouldCollapse }));
    });
  }, []);

  return (
    <Box sx={styles.root}>
      <QuizHeader
        title={lesson.title}
        onTitleChange={(title) => onLessonTitleChange?.(lesson.id, title)}
        onSave={handleHeaderSave}
        saveDisabled={activeTab === 'settings' ? savingQuizSettings : savingLive}
      />

      <Box sx={styles.tabsRow}>
        <QuizTabs activeTab={activeTab} onTabChange={setActiveTab} questionCount={questions.length} />
        {activeTab === 'questions' ? (
          <Box sx={styles.tabActions}>
            <IconButton
              sx={styles.listIconBtn}
              aria-label={allQuestionsCollapsed ? 'Expand all questions' : 'Collapse all questions'}
              aria-expanded={!allQuestionsCollapsed}
              size="small"
              onClick={handleToggleAllQuestionsCollapsed}
            >
              <Iconify
                icon={allQuestionsCollapsed ? 'solar:double-alt-arrow-down-linear' : 'solar:list-linear'}
                width={22}
              />
            </IconButton>
            <Button variant="outlined" sx={styles.libraryBtn} onClick={() => toast.info('Questions library (demo).')}>
              Questions library
            </Button>
          </Box>
        ) : (
          <Box sx={{ minWidth: { xs: 0, sm: 40 } }} aria-hidden />
        )}
      </Box>

      {activeTab === 'questions' ? (
        <>
          <Box ref={mainColumnRef} sx={styles.mainColumn}>
            {questions.map((q) => (
              <QuizQuestionSortableItem
                key={q.id}
                questionId={q.id}
                chromeSurface={q.collapsed ? 'collapsed' : 'expanded'}
              >
                {({ dragHandleRef }) => (
                  <Box sx={styles.card}>
                    {q.collapsed ? (
                      <QuestionCollapsedBar
                        questionText={q.questionText}
                        collapsed={q.collapsed}
                        onToggleCollapse={() => patchQuestion(q.id, { collapsed: !q.collapsed })}
                        onDelete={() => handleDeleteQuestion(q.id)}
                        dragHandleRef={dragHandleRef}
                      />
                    ) : (
                      <>
                        <QuestionCardChrome
                          collapsed={q.collapsed}
                          onToggleCollapse={() => patchQuestion(q.id, { collapsed: !q.collapsed })}
                          onDelete={() => handleDeleteQuestion(q.id)}
                          dragHandleRef={dragHandleRef}
                        />
                        <QuestionEditor
                          questionText={q.questionText}
                          onQuestionTextChange={(html) => patchQuestion(q.id, { questionText: html })}
                        />
                        <QuestionSettings
                          required={q.required}
                          onRequiredChange={(required) => patchQuestion(q.id, { required })}
                        />
                        <AnswerList
                          embedded
                          answers={q.answers}
                          correctAnswerId={q.correctAnswerId}
                          onAnswerTextChange={(answerId, text) => handleAnswerText(q.id, answerId, text)}
                          onCorrectChange={(correctAnswerId) => patchQuestion(q.id, { correctAnswerId })}
                          newAnswerDraft={q.newAnswerDraft}
                          onNewAnswerDraftChange={(newAnswerDraft) =>
                            patchQuestion(q.id, { newAnswerDraft })
                          }
                          onAddAnswer={() => handleAddAnswer(q.id)}
                        />
                      </>
                    )}
                  </Box>
                )}
              </QuizQuestionSortableItem>
            ))}
          </Box>

          <FooterActions
            onAddQuestion={handleAddQuestion}
            onQuestionBank={() => toast.info('Question bank (demo).')}
            onSave={handleFooterSave}
            saveDisabled={savingLive}
          />
        </>
      ) : (
        <QuizSettingsPanel
          ref={quizSettingsPanelRef}
          lesson={lesson}
          liveAuthoring={liveQuizAuthoring}
          saveLiveQuizSettings={saveLiveQuizSettingsForPanel}
          onLessonSave={onLessonSave}
          onSavingChange={setSavingQuizSettings}
        />
      )}
    </Box>
  );
}
