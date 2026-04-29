import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Editor } from 'src/components/editor';

import { styles } from './styles';

export function TextLessonWorkspaceEditorSection({
  label,
  value,
  onChange,
  placeholder,
  minHeight = 280,
  maxHeight = 520,
  fullItem = false,
}) {
  return (
    <Box>
      <Typography sx={styles.label}>{label}</Typography>
      <Editor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        fullItem={fullItem}
        chrome="tinymce"
        sx={{ minHeight, maxHeight }}
        tinymceResizeBounds={{
          min: 150,
          max: Math.max(200, maxHeight - 170),
        }}
      />
    </Box>
  );
}
