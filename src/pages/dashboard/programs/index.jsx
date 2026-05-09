import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { useLmsUser, useLmsActions, useLmsPrograms } from 'src/hooks/use-lms';

import { CONFIG } from 'src/global-config';
import {
  getLmsAxiosErrorMessage,
} from 'src/lib/lms-instructor-api';
import { StudentWorkspaceShell } from 'src/features/student-profile/components/student-workspace-shell';
import { InstructorWorkspaceShell } from 'src/features/instructor-profile/components/instructor-workspace-shell';

import { Editor } from 'src/components/editor';
import { toast } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

const DEFAULT_FORM = {
  code: '',
  slug: '',
  title: '',
  description: '',
  status: 'active',
  bannerPath: '',
  bannerImageFile: null,
  bannerPreviewUrl: '',
};

export default function ProgramsPage() {
  const { programs, isLoading, error, mutate: mutatePrograms } = useLmsPrograms();
  const { runCommand } = useLmsActions();
  const { user } = useLmsUser();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteRow, setPendingDeleteRow] = useState(null);

  const sortedPrograms = useMemo(
    () => [...(programs ?? [])].sort((a, b) => String(a.title).localeCompare(String(b.title))),
    [programs]
  );

  const canSubmit = form.code.trim() !== '' && form.title.trim() !== '';
  const role = typeof user?.role === 'string' ? user.role.trim().toLowerCase() : '';
  const isInstructorLike = role === 'instructor' || role === 'admin';
  const WorkspaceShell = isInstructorLike ? InstructorWorkspaceShell : StudentWorkspaceShell;

  const handleChange = (key) => (event) =>
    setForm((prev) => ({
      ...prev,
      [key]: event.target.value,
    }));

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
  };

  const resolveBannerSrc = (value) => {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith('/')) return `${CONFIG.serverUrl}${raw}`;
    return `${CONFIG.serverUrl}/storage/${raw}`;
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error('Code and title are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim(),
        slug: form.slug.trim(),
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
      };
      const formData = new FormData();
      formData.append('code', payload.code);
      formData.append('slug', payload.slug);
      formData.append('title', payload.title);
      formData.append('description', payload.description ?? '');
      formData.append('status', payload.status);
      if (form.bannerImageFile) {
        formData.append('bannerImage', form.bannerImageFile);
      } else if (form.bannerPath.trim()) {
        formData.append('bannerPath', form.bannerPath.trim());
      }

      if (editingId) {
        await runCommand('program.update', { publicId: editingId, body: formData });
        toast.success('Program updated.');
      } else {
        await runCommand('program.create', formData);
        toast.success('Program created.');
      }

      await mutatePrograms();
      resetForm();
    } catch (err) {
      toast.error(getLmsAxiosErrorMessage(err, 'Could not save program.'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setForm({
      code: row.code ?? '',
      slug: row.slug ?? '',
      title: row.title ?? '',
      description: row.description ?? '',
      status: row.status === 'inactive' ? 'inactive' : 'active',
      bannerPath: row.bannerPath ?? '',
      bannerImageFile: null,
      bannerPreviewUrl: resolveBannerSrc(row.bannerPath ?? ''),
    });
  };

  const handleDelete = async () => {
    const programId = pendingDeleteRow?.id;
    if (!programId) {
      return;
    }
    setBusyId(programId);
    try {
      await runCommand('program.delete', { publicId: programId });
      toast.success('Program deleted.');
      setConfirmOpen(false);
      setPendingDeleteRow(null);
      await mutatePrograms();
    } catch (err) {
      toast.error(getLmsAxiosErrorMessage(err, 'Could not delete program.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <title>{`Programs | Dashboard - ${CONFIG.appName}`}</title>
      <WorkspaceShell>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4">Programs</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage program catalog entries (CRUD), status, and banner path.
            </Typography>
          </Box>

          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">{editingId ? 'Edit program' : 'Create new program'}</Typography>
                <Grid container spacing={2} alignItems="stretch" columns={{ xs: 12, md: 15 }}>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField label="Code" value={form.code} onChange={handleChange('code')} fullWidth />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField label="Slug" value={form.slug} onChange={handleChange('slug')} fullWidth />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField label="Title" value={form.title} onChange={handleChange('title')} fullWidth />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Select value={form.status} onChange={handleChange('status')} fullWidth>
                      <MenuItem value="active">active</MenuItem>
                      <MenuItem value="inactive">inactive</MenuItem>
                    </Select>
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Stack spacing={1} sx={{ width: '100%', height: '100%' }}>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        sx={{ height: 56, borderRadius: 1 }}
                      >
                        Upload banner image
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onClick={(event) => {
                            // Allow re-selecting the same file name in consecutive edits.
                            event.currentTarget.value = '';
                          }}
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            if (!file) return;
                            const preview = URL.createObjectURL(file);
                            setForm((prev) => ({
                              ...prev,
                              bannerPath: '',
                              bannerImageFile: file,
                              bannerPreviewUrl: preview,
                            }));
                          }}
                        />
                      </Button>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, md: 15 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Description
                    </Typography>
                    <Editor
                      value={form.description}
                      onChange={(html) =>
                        setForm((prev) => ({
                          ...prev,
                          description: html,
                        }))
                      }
                      chrome="tinymce"
                      sx={{
                        minHeight: 260,
                        maxHeight: 520,
                      }}
                      tinymceResizeBounds={{
                        min: 140,
                        max: 420,
                      }}
                    />
                  </Grid>
                </Grid>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" onClick={handleSubmit} disabled={saving || !canSubmit}>
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                  {editingId ? (
                    <Button variant="outlined" onClick={resetForm} disabled={saving}>
                      Cancel edit
                    </Button>
                  ) : null}
                </Stack>
                {form.bannerPreviewUrl || form.bannerPath ? (
                  <Box
                    component="img"
                    src={form.bannerPreviewUrl || resolveBannerSrc(form.bannerPath)}
                    alt="Program banner preview"
                    sx={{
                      width: '100%',
                      maxWidth: 420,
                      height: 180,
                      objectFit: 'cover',
                      borderRadius: 1.5,
                      border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                    }}
                  />
                ) : null}
              </Stack>
            </CardContent>
          </Card>

          {error ? <Alert severity="error">{error?.message ?? 'Failed to load programs.'}</Alert> : null}

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Program list
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Banner image</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6}>Loading...</TableCell>
                    </TableRow>
                  ) : sortedPrograms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>No programs found.</TableCell>
                    </TableRow>
                  ) : (
                    sortedPrograms.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.code}</TableCell>
                        <TableCell>{row.slug ?? '—'}</TableCell>
                        <TableCell>{row.title}</TableCell>
                        <TableCell>{row.status ?? 'active'}</TableCell>
                        <TableCell>
                          {row.bannerPath ? (
                            <Box
                              component="img"
                              src={resolveBannerSrc(row.bannerPath)}
                              alt={`${row.title} banner`}
                              sx={{ width: 120, height: 56, objectFit: 'cover', borderRadius: 1 }}
                            />
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button size="small" variant="text" onClick={() => handleEdit(row)}>
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="text"
                              disabled={busyId === row.id}
                              onClick={() => {
                                setPendingDeleteRow(row);
                                setConfirmOpen(true);
                              }}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Stack>
      </WorkspaceShell>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setPendingDeleteRow(null);
        }}
        title="Delete program"
        content={
          <>
            Delete program <strong>{pendingDeleteRow?.title ?? ''}</strong>? This action performs a
            soft delete only.
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={handleDelete} disabled={!!busyId}>
            Delete
          </Button>
        }
      />
    </>
  );
}

