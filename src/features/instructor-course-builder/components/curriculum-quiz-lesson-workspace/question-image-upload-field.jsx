import { useRef, useMemo, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { CONFIG } from 'src/global-config';
import {
  deleteLessonMaterial,
  getLmsAxiosErrorMessage,
  postLessonMaterialForModule,
} from 'src/lib/lms-instructor-api';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { styles } from './styles';
import { normalizeUploadedLessonMaterial } from '../../utils/lesson-materials-cache';

function normalizeAssetUrl(path) {
  const raw = typeof path === 'string' ? path.trim() : '';
  if (!raw) return '';
  if (/^(blob:|data:)/i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = String(CONFIG.serverUrl ?? '').trim().replace(/\/$/, '');
  const rel = raw.startsWith('/') ? raw : `/${raw}`;
  return base ? `${base}${rel}` : rel;
}

export function QuestionImageUploadField({
  label,
  modulePublicId,
  materialPublicId,
  previewUrl,
  fileName,
  uploading = false,
  onUploadingChange,
  onImageChange,
  onAfterMaterialsChange,
  borderedRight = false,
}) {
  const inputRef = useRef(null);

  const previewSrc = useMemo(() => {
    const direct = normalizeAssetUrl(previewUrl);
    if (direct) return direct;
    const id = typeof materialPublicId === 'string' ? materialPublicId.trim() : '';
    if (!id || !CONFIG.serverUrl?.trim()) return '';
    const base = String(CONFIG.serverUrl).trim().replace(/\/$/, '');
    return `${base}/api/lesson-materials/${encodeURIComponent(id)}/file?inline=1`;
  }, [materialPublicId, previewUrl]);

  const hasImage = Boolean(materialPublicId?.trim() || previewSrc);
  const displayName = fileName?.trim() || (hasImage ? 'Image selected' : 'No file chosen');

  const uploadFile = useCallback(
    async (file) => {
      if (!file) return;
      if (!CONFIG.serverUrl?.trim()) {
        toast.error(
          'Set VITE_SERVER_URL to your Laravel app origin (e.g. http://127.0.0.1:8000) and restart the dev server.'
        );
        return;
      }
      if (!modulePublicId) {
        toast.error('Select a quiz lesson in your course curriculum before uploading images.');
        return;
      }

      onUploadingChange?.(true);
      const previousId = typeof materialPublicId === 'string' ? materialPublicId.trim() : '';

      try {
        const payload = await postLessonMaterialForModule(modulePublicId, file);
        const material = normalizeUploadedLessonMaterial(payload);
        if (!material?.id) {
          toast.error('Upload succeeded but the server did not return a file id.');
          return;
        }

        onImageChange?.({
          materialPublicId: material.id,
          previewUrl: material.fileUrl ?? material.inlineFileUrl ?? null,
          fileName: material.name ?? file.name,
        });

        onAfterMaterialsChange?.({
          modulePublicId,
          add: [material],
        });

        if (previousId && previousId !== material.id) {
          try {
            await deleteLessonMaterial(previousId);
            onAfterMaterialsChange?.({
              modulePublicId,
              removeIds: [previousId],
            });
          } catch {
            /* best-effort cleanup */
          }
        }

        toast.success(`${label.replace(/:$/, '')} uploaded.`);
      } catch (err) {
        toast.error(getLmsAxiosErrorMessage(err, `Could not upload ${label.toLowerCase()}`));
      } finally {
        onUploadingChange?.(false);
      }
    },
    [label, materialPublicId, modulePublicId, onAfterMaterialsChange, onImageChange, onUploadingChange]
  );

  const handleRemove = useCallback(async () => {
    const id = typeof materialPublicId === 'string' ? materialPublicId.trim() : '';
    if (id && modulePublicId) {
      try {
        await deleteLessonMaterial(id);
        onAfterMaterialsChange?.({
          modulePublicId,
          removeIds: [id],
        });
      } catch (err) {
        toast.error(getLmsAxiosErrorMessage(err, `Could not remove ${label.toLowerCase()}`));
        return;
      }
    }
    onImageChange?.({
      materialPublicId: null,
      previewUrl: null,
      fileName: null,
    });
  }, [label, materialPublicId, modulePublicId, onAfterMaterialsChange, onImageChange]);

  const handleFileInput = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (file) void uploadFile(file);
    },
    [uploadFile]
  );

  return (
    <Box sx={[styles.questionImageField, borderedRight && styles.questionImageFieldBorderRight]}>
      <Typography sx={styles.questionImageLabel}>{label}</Typography>

      {hasImage && previewSrc ? (
        <Box
          component="img"
          src={previewSrc}
          alt={fileName || label}
          sx={styles.questionImagePreview}
        />
      ) : null}

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={1}
        flexWrap="wrap"
        sx={styles.questionImageFileRow}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
          hidden
          onChange={handleFileInput}
        />
        <Button
          size="small"
          variant="outlined"
          disabled={uploading || !modulePublicId}
          onClick={() => inputRef.current?.click()}
          sx={styles.questionImageChooseBtn}
        >
          Choose File
        </Button>
        <Typography variant="body2" color="text.secondary" noWrap sx={styles.questionImageFileName}>
          {uploading ? 'Uploading…' : displayName}
        </Typography>
        {uploading ? <CircularProgress size={18} aria-label="Uploading" /> : null}
        {hasImage && !uploading ? (
          <IconButton
            size="small"
            aria-label={`Remove ${label}`}
            onClick={() => void handleRemove()}
            sx={styles.diagramRemoveBtn}
          >
            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
          </IconButton>
        ) : null}
      </Stack>
    </Box>
  );
}
