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
import { isSimulationDiagramQuestion } from './quiz-question-types';
import { QuizQuestionSortableItem } from './quiz-question-sortable-item';
import { nid, createDemoQuestion, createBlankQuestion } from './quiz-question-factory';
import { useQuizQuestionListDropMonitor } from './use-quiz-question-list-drop-monitor';

function readImageMaterialId(q, primaryKey, legacyKey) {
  const primary = typeof q?.[primaryKey] === 'string' ? q[primaryKey].trim() : '';
  if (primary) return primary;
  if (legacyKey && typeof q?.[legacyKey] === 'string' && q[legacyKey].trim() !== '') {
    return q[legacyKey].trim();
  }
  return null;
}

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
    const questionType =
      q?.questionType === 'simulation_diagram' ? 'simulation_diagram' : 'single_choice';

    return {
      id: typeof q?.id === 'string' ? q.id : nid(),
      collapsed: true,
      questionText: typeof q?.prompt === 'string' ? q.prompt : '',
      questionType,
      required: Boolean(q?.required),
      problemImageMaterialPublicId: readImageMaterialId(
        q,
        'problemImageMaterialPublicId',
        'diagramMaterialPublicId'
      ),
      problemImagePreviewUrl:
        typeof q?.problemImageUrl === 'string'
          ? q.problemImageUrl
          : typeof q?.diagramUrl === 'string'
            ? q.diagramUrl
            : null,
      problemImageName:
        typeof q?.problemImageName === 'string'
          ? q.problemImageName
          : typeof q?.diagramName === 'string'
            ? q.diagramName
            : null,
      solutionImageMaterialPublicId: readImageMaterialId(q, 'solutionImageMaterialPublicId'),
      solutionImagePreviewUrl: typeof q?.solutionImageUrl === 'string' ? q.solutionImageUrl : null,
      solutionImageName: typeof q?.solutionImageName === 'string' ? q.solutionImageName : null,
      answers: answers.length > 0 ? answers.map(({ id, text }) => ({ id, text })) : [{ id: fallbackId, text: '' }],
      correctAnswerId: correct,
      newAnswerDraft: '',
    };
  });
}

function toPersistedQuizQuestions(questions) {
  return (Array.isArray(questions) ? questions : [])
    .map((q) => {
      const questionType = isSimulationDiagramQuestion(q?.questionType)
        ? 'simulation_diagram'
        : 'single_choice';
      const problemImageMaterialPublicId =
        typeof q?.problemImageMaterialPublicId === 'string' && q.problemImageMaterialPublicId.trim() !== ''
          ? q.problemImageMaterialPublicId.trim()
          : null;
      const solutionImageMaterialPublicId =
        typeof q?.solutionImageMaterialPublicId === 'string' &&
        q.solutionImageMaterialPublicId.trim() !== ''
          ? q.solutionImageMaterialPublicId.trim()
          : null;

      return {
        prompt: String(q?.questionText ?? '').trim(),
        questionType,
        required: Boolean(q?.required),
        problemImageMaterialPublicId:
          questionType === 'simulation_diagram' ? problemImageMaterialPublicId : null,
        solutionImageMaterialPublicId:
          questionType === 'simulation_diagram' ? solutionImageMaterialPublicId : null,
        choices: (Array.isArray(q?.answers) ? q.answers : [])
          .map((a) => ({
            label: String(a?.text ?? '').trim(),
            isCorrect: String(a?.id ?? '') === String(q?.correctAnswerId ?? ''),
          }))
          .filter((c) => c.label !== ''),
      };
    })
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
  quizModulePublicId = null,
  onLessonMaterialsChange,
}) {
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState(() => [createDemoQuestion()]);
  const [savingLive, setSavingLive] = useState(false);
  const [savingQuizSettings, setSavingQuizSettings] = useState(false);
  const [imageUploadingByQuestionId, setImageUploadingByQuestionId] = useState({});
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
    const missingProblemImage = questions.some(
      (q) =>
        isSimulationDiagramQuestion(q.questionType) &&
        !(
          typeof q.problemImageMaterialPublicId === 'string' &&
          q.problemImageMaterialPublicId.trim() !== ''
        )
    );
    const missingSolutionImage = questions.some(
      (q) =>
        isSimulationDiagramQuestion(q.questionType) &&
        !(
          typeof q.solutionImageMaterialPublicId === 'string' &&
          q.solutionImageMaterialPublicId.trim() !== ''
        )
    );
    if (missingProblemImage || missingSolutionImage) {
      toast.warning(
        missingProblemImage && missingSolutionImage
          ? 'Upload both problem and solution images for each simulation question before saving.'
          : missingProblemImage
            ? 'Upload a problem image for each simulation question before saving.'
            : 'Upload a solution image for each simulation question before saving.'
      );
      return;
    }

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
                        <QuestionSettings
                          questionId={q.id}
                          questionType={q.questionType}
                          onQuestionTypeChange={(questionType) => {
                            const partial = { questionType };
                            if (!isSimulationDiagramQuestion(questionType)) {
                              partial.problemImageMaterialPublicId = null;
                              partial.problemImagePreviewUrl = null;
                              partial.problemImageName = null;
                              partial.solutionImageMaterialPublicId = null;
                              partial.solutionImagePreviewUrl = null;
                              partial.solutionImageName = null;
                            }
                            patchQuestion(q.id, partial);
                          }}
                          required={q.required}
                          onRequiredChange={(required) => patchQuestion(q.id, { required })}
                        />
                        <QuestionEditor
                          questionType={q.questionType}
                          questionText={q.questionText}
                          onQuestionTextChange={(html) => patchQuestion(q.id, { questionText: html })}
                          modulePublicId={quizModulePublicId}
                          problemImageMaterialPublicId={q.problemImageMaterialPublicId}
                          problemImagePreviewUrl={q.problemImagePreviewUrl}
                          problemImageName={q.problemImageName}
                          solutionImageMaterialPublicId={q.solutionImageMaterialPublicId}
                          solutionImagePreviewUrl={q.solutionImagePreviewUrl}
                          solutionImageName={q.solutionImageName}
                          imageUploadingSlot={imageUploadingByQuestionId[q.id] ?? null}
                          onImageUploadingSlotChange={(slot) =>
                            setImageUploadingByQuestionId((prev) => {
                              if (!slot) {
                                const next = { ...prev };
                                delete next[q.id];
                                return next;
                              }
                              return { ...prev, [q.id]: slot };
                            })
                          }
                          onProblemImageChange={({ materialPublicId, previewUrl, fileName }) =>
                            patchQuestion(q.id, {
                              problemImageMaterialPublicId: materialPublicId,
                              problemImagePreviewUrl: previewUrl,
                              problemImageName: fileName,
                            })
                          }
                          onSolutionImageChange={({ materialPublicId, previewUrl, fileName }) =>
                            patchQuestion(q.id, {
                              solutionImageMaterialPublicId: materialPublicId,
                              solutionImagePreviewUrl: previewUrl,
                              solutionImageName: fileName,
                            })
                          }
                          onAfterMaterialsChange={onLessonMaterialsChange}
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
