import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';

export function EditorToolbar({ blockType, onBlockTypeChange }) {
  return (
    <Box sx={styles.toolbar} role="toolbar" aria-label="Formatting">
      <Select
        size="small"
        value={blockType}
        onChange={(e) => onBlockTypeChange(e.target.value)}
        sx={styles.paragraphSelect}
      >
        <MenuItem value="paragraph">Paragraph</MenuItem>
        <MenuItem value="heading2">Heading 2</MenuItem>
      </Select>
      <IconButton size="small" sx={styles.toolbarIconBtn} aria-label="Bold">
        <Iconify icon="solar:text-bold" width={20} />
      </IconButton>
      <IconButton size="small" sx={styles.toolbarIconBtn} aria-label="Italic">
        <Iconify icon="solar:text-italic-linear" width={20} />
      </IconButton>
      <IconButton size="small" sx={styles.toolbarIconBtn} aria-label="Underline">
        <Iconify icon="solar:text-underline-linear" width={20} />
      </IconButton>
      <IconButton size="small" sx={styles.toolbarIconBtn} aria-label="Strikethrough">
        <Iconify icon="solar:text-cross-linear" width={20} />
      </IconButton>
      <IconButton size="small" sx={styles.toolbarIconBtn} aria-label="Align left">
        <Iconify icon="solar:text-align-left-linear" width={20} />
      </IconButton>
      <IconButton size="small" sx={styles.toolbarIconBtn} aria-label="Align center">
        <Iconify icon="solar:text-align-center-linear" width={20} />
      </IconButton>
      <IconButton size="small" sx={styles.toolbarIconBtn} aria-label="Align right">
        <Iconify icon="solar:text-align-right-linear" width={20} />
      </IconButton>
      <IconButton size="small" sx={styles.toolbarIconBtn} aria-label="Link">
        <Iconify icon="solar:link-linear" width={20} />
      </IconButton>
      <IconButton size="small" sx={styles.toolbarIconBtn} aria-label="Bullet list">
        <Iconify icon="solar:list-linear" width={20} />
      </IconButton>
      <IconButton size="small" sx={styles.toolbarIconBtn} aria-label="Numbered list">
        <Iconify icon="solar:list-numbers-linear" width={20} />
      </IconButton>
      <IconButton size="small" sx={styles.toolbarIconBtn} aria-label="Clear formatting">
        <Iconify icon="solar:eraser-linear" width={20} />
      </IconButton>
      <IconButton size="small" sx={styles.toolbarIconBtn} aria-label="Fullscreen">
        <Iconify icon="solar:maximize-square-linear" width={20} />
      </IconButton>
    </Box>
  );
}
