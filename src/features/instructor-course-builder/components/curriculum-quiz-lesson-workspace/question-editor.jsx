import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';

import { styles } from './styles';

export function QuestionEditor({ questionText, onQuestionTextChange }) {
  return (
    <Box sx={styles.editorTop}>
      <Box sx={styles.imageTile} component="button" type="button" aria-label="Add image">
        <Iconify icon="solar:gallery-linear" width={24} />
      </Box>
      <Box sx={styles.editorMain}>
        <Typography component="div" sx={styles.stemLabel}>
          Enter your question
        </Typography>
        <Editor
          value={questionText}
          onChange={onQuestionTextChange}
          placeholder="What does CPU stand for?"
          chrome="tinymce"
          sx={{
            minHeight: { xs: 200, sm: 260 },
            maxHeight: { xs: 360, sm: 440 },
          }}
          tinymceResizeBounds={{
            min: 100,
            max: 320,
          }}
        />
      </Box>
    </Box>
  );
}
