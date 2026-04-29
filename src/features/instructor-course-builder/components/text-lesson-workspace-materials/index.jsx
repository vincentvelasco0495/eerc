import { useDropzone } from 'react-dropzone';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { styles } from './styles';

export function TextLessonWorkspaceMaterials() {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <Box>
      <Typography sx={styles.label}>Lesson materials</Typography>

      <Box
        {...getRootProps()}
        sx={[
          (theme) => styles.dropzone(theme),
          isDragActive ? (theme) => styles.dropzoneActive(theme) : null,
        ]}
      >
        <input {...getInputProps()} />
        <Iconify icon="solar:upload-minimalistic-bold" width={40} sx={{ color: 'primary.main' }} />
        <Typography sx={styles.hint}>
          Drag & drop files here or browse files from your computer
        </Typography>
        <Button variant="contained" color="primary" sx={styles.browseButton}>
          Browse files
        </Button>
      </Box>

      {files.length > 0 ? (
        <Stack spacing={0.5} sx={styles.fileList}>
          {files.map((f) => (
            <Typography key={`${f.name}-${f.lastModified}`} sx={styles.fileName}>
              {f.name}
            </Typography>
          ))}
        </Stack>
      ) : null}
    </Box>
  );
}
