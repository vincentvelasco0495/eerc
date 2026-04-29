import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';
import { EditorToolbar } from './editor-toolbar';

function wordCount(text) {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

export function QuestionEditor({ questionText, onQuestionTextChange, blockType, onBlockTypeChange }) {
  const wc = wordCount(questionText);

  return (
    <Box sx={styles.editorTop}>
      <Box sx={styles.imageTile} component="button" type="button" aria-label="Add image">
        <Iconify icon="solar:gallery-linear" width={24} />
      </Box>
      <Box sx={styles.editorMain}>
        <Typography component="div" sx={styles.stemLabel}>
          Enter your question
        </Typography>
        <EditorToolbar blockType={blockType} onBlockTypeChange={onBlockTypeChange} />
        <Box sx={styles.textareaWrap}>
          <Box
            component="textarea"
            sx={styles.textarea}
            value={questionText}
            onChange={(e) => onQuestionTextChange(e.target.value)}
            placeholder="What does CPU stand for?"
            aria-label="Question text"
          />
          <Box sx={styles.statusBar}>
            <Box component="span" sx={styles.statusLeft}>
              p
            </Box>
            <Box sx={styles.statusRight}>
              <span>{wc} words</span>
              <Iconify icon="solar:maximize-linear" width={14} style={{ opacity: 0.45 }} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
