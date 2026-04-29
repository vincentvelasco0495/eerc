import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';

export function QuestionSettings({
  questionType,
  onQuestionTypeChange,
  category,
  onCategoryChange,
  required,
  onRequiredChange,
}) {
  return (
    <Box sx={styles.settingsRow}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Select
          size="small"
          value={questionType}
          onChange={(e) => onQuestionTypeChange(e.target.value)}
          sx={styles.settingsSelect}
        >
          <MenuItem value="single_choice">Single choice</MenuItem>
          <MenuItem value="multiple_choice">Multiple choice</MenuItem>
        </Select>
        <IconButton size="small" sx={styles.infoIconBtn} aria-label="Question type info">
          <Iconify icon="solar:info-circle-linear" width={22} />
        </IconButton>
      </Box>
      <Select
        size="small"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        displayEmpty
        sx={{ ...styles.settingsSelect, ...styles.categorySelect }}
      >
        <MenuItem value="">
          <em>Category</em>
        </MenuItem>
        <MenuItem value="general">General</MenuItem>
        <MenuItem value="hardware">Hardware</MenuItem>
        <MenuItem value="software">Software</MenuItem>
      </Select>
      <FormControlLabel
        sx={{ ml: 'auto', mr: 0 }}
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
