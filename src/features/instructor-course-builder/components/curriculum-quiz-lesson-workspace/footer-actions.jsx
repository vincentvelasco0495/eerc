import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';

import { styles, quizColors } from './styles';

export function FooterActions({ onAddQuestion, onQuestionBank, onSave }) {
  return (
    <Box sx={styles.footer}>
      <span />
      <Box sx={styles.footerCenter}>
        <Button
          variant="contained"
          color="primary"
          sx={styles.footerBtn}
          onClick={onAddQuestion}
          endIcon={<Iconify icon="solar:alt-arrow-down-linear" width={18} />}
        >
          + Question
        </Button>
        <Button
          variant="contained"
          sx={{
            ...styles.footerBtn,
            bgcolor: quizColors.success,
            '&:hover': { bgcolor: quizColors.successHover },
          }}
          onClick={onQuestionBank}
        >
          + Question Bank
        </Button>
      </Box>
      <Box sx={styles.footerEnd}>
        <Button
          variant="contained"
          color="primary"
          sx={{ ...styles.footerBtn, width: { xs: 1, sm: 'auto' } }}
          onClick={onSave}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
}
