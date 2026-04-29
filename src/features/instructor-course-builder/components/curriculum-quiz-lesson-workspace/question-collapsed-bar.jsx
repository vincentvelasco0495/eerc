import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { styles } from './styles';
import { QuestionCardChrome } from './question-card-chrome';
import { QUESTION_TYPE_SUMMARY_LABELS } from './question-type-labels';

export function QuestionCollapsedBar({
  questionText,
  questionType,
  collapsed,
  onToggleCollapse,
  onDelete,
  dragHandleRef,
}) {
  const summary =
    QUESTION_TYPE_SUMMARY_LABELS[questionType] ?? QUESTION_TYPE_SUMMARY_LABELS.single_choice;
  const displayText = questionText?.trim() || 'Untitled question';

  return (
    <Box sx={styles.questionCollapsedBar}>
      <Box sx={styles.collapsedBarLeft}>
        <Typography sx={styles.collapsedQuestionText} noWrap title={displayText}>
          {displayText}
        </Typography>
        <Box component="span" sx={styles.questionTypePill}>
          {summary}
        </Box>
      </Box>
      <QuestionCardChrome
        variant="inline"
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        onDelete={onDelete}
        dragHandleRef={dragHandleRef}
      />
    </Box>
  );
}
