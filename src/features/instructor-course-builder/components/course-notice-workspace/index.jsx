import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { Editor } from 'src/components/editor';
import { toast } from 'src/components/snackbar';

import { styles } from './styles';
import { courseNoticeSeedHtml } from '../../instructor-course-curriculum-data';

/** Navbar → Notice: single rich-text notice with shared TipTap + TinyMCE chrome (same as lessons / settings). */
export function CourseNoticeWorkspace() {
  const [noticeHtml, setNoticeHtml] = useState(courseNoticeSeedHtml);

  const handleSave = useCallback(() => {
    /** Persist `noticeHtml` via course PATCH when API is available */
    toast.success('Notice saved (demo).');
  }, []);

  return (
    <Box sx={styles.workspaceRoot}>
      <Box sx={styles.pageCard}>
        <Typography sx={styles.cardTitle} component="h2">
          Notice
        </Typography>
        <Divider sx={styles.dividerUnderTitle} />

        <Editor
          value={noticeHtml}
          onChange={setNoticeHtml}
          placeholder="Write a notice for enrolled students…"
          chrome="tinymce"
          sx={{
            mt: 0,
            minHeight: 360,
            maxHeight: 640,
          }}
          tinymceResizeBounds={{
            min: 180,
            max: 520,
          }}
        />

        <Box sx={styles.footerRow}>
          <Button variant="contained" color="primary" sx={styles.saveBtn} onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
