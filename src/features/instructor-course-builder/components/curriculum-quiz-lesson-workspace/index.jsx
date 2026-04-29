import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { styles } from './styles';
import { QuizTabs } from './quiz-tabs';
import { AnswerList } from './answer-list';
import { QuizHeader } from './quiz-header';
import { FooterActions } from './footer-actions';
import { QuestionEditor } from './question-editor';
import { QuestionSettings } from './question-settings';
import { QuestionCardChrome } from './question-card-chrome';
import { QuestionCollapsedBar } from './question-collapsed-bar';
import { QuizQuestionSortableItem } from './quiz-question-sortable-item';
import { nid, createDemoQuestion, createBlankQuestion } from './quiz-question-factory';
import { useQuizQuestionListDropMonitor } from './use-quiz-question-list-drop-monitor';

export function CurriculumQuizLessonWorkspace({ lesson, onLessonTitleChange, onLessonSave }) {
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState(() => [createDemoQuestion()]);
  const mainColumnRef = useRef(null);

  useEffect(() => {
    setQuestions([createDemoQuestion()]);
    setActiveTab('questions');
  }, [lesson.id]);

  const reorderQuestions = useCallback((updateList) => {
    setQuestions((prev) => updateList(prev));
  }, []);

  useQuizQuestionListDropMonitor({ listRef: mainColumnRef, onReorder: reorderQuestions });

  const handleHeaderSave = useCallback(() => {
    onLessonSave?.(lesson.id);
    toast.success(`Quiz “${lesson.title}” saved (demo).`);
  }, [lesson.id, lesson.title, onLessonSave]);

  const handleFooterSave = useCallback(() => {
    onLessonSave?.(lesson.id);
    toast.success(`Quiz “${lesson.title}” saved (demo).`);
  }, [lesson.id, lesson.title, onLessonSave]);

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

  return (
    <Box sx={styles.root}>
      <QuizHeader
        title={lesson.title}
        onTitleChange={(title) => onLessonTitleChange?.(lesson.id, title)}
        onSave={handleHeaderSave}
      />

      <Box sx={styles.tabsRow}>
        <QuizTabs activeTab={activeTab} onTabChange={setActiveTab} questionCount={questions.length} />
        <Box sx={styles.tabActions}>
          <IconButton sx={styles.listIconBtn} aria-label="Layout" size="small">
            <Iconify icon="solar:list-linear" width={22} />
          </IconButton>
          <Button variant="outlined" sx={styles.libraryBtn} onClick={() => toast.info('Questions library (demo).')}>
            Questions library
          </Button>
        </Box>
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
                        questionType={q.questionType}
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
                          onQuestionTextChange={(text) => patchQuestion(q.id, { questionText: text })}
                          blockType={q.blockType}
                          onBlockTypeChange={(blockType) => patchQuestion(q.id, { blockType })}
                        />
                        <QuestionSettings
                          questionType={q.questionType}
                          onQuestionTypeChange={(questionType) => patchQuestion(q.id, { questionType })}
                          category={q.category}
                          onCategoryChange={(category) => patchQuestion(q.id, { category })}
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
          />
        </>
      ) : (
        <Box sx={styles.placeholderPanel}>
          <Typography color="text.secondary" textAlign="center">
            {activeTab === 'settings' ? 'Quiz settings — demo placeholder.' : 'Q&A — demo placeholder.'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
