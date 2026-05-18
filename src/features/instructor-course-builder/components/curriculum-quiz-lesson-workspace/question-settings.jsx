import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';

import { styles } from './styles';
import { QUIZ_QUESTION_TYPES } from './quiz-question-types';

export function QuestionSettings({
  questionId,
  questionType,
  onQuestionTypeChange,
  required,
  onRequiredChange,
}) {
  return (
    <Box sx={styles.settingsRowTop}>
      <FormControl size="small" sx={styles.questionTypeSelect}>
        <InputLabel id={`quiz-qtype-${questionId}`}>Question type</InputLabel>
        <Select
          labelId={`quiz-qtype-${questionId}`}
          value={questionType}
          label="Question type"
          onChange={(e) => onQuestionTypeChange(e.target.value)}
        >
          {QUIZ_QUESTION_TYPES.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControlLabel
        sx={styles.settingsRequiredLabel}
        control={
          <Switch
            checked={required}
            onChange={(e) => onRequiredChange(e.target.checked)}
            color="primary"
          />
        }
        label="Required Question"
      />
    </Box>
  );
}
