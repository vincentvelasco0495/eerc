import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import LinearProgress from '@mui/material/LinearProgress';

import { fetchEnrollmentPaymentProofBlob } from 'src/redux/api/lmsApi';

import { toast } from 'src/components/snackbar';

const SKELETON_ROWS = 5;

const STATUS_COLOR = {
  approved: 'success',
  pending: 'warning',
  rejected: 'error',
};

export function EnrollmentTable({
  rows = [],
  loading = false,
  canManage = false,
  showActionsColumn = false,
  onStatusChange,
  busyId = null,
  emptyMessage = 'No enrollments found',
}) {
  const [proofBusyId, setProofBusyId] = useState(null);

  const handleViewPaymentProof = useCallback(async (row) => {
    if (!row?.id || !row?.hasPaymentProof) {
      return;
    }

    setProofBusyId(row.id);
    try {
      const blob = await fetchEnrollmentPaymentProofBlob(row.id);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (error) {
      const message =
        typeof error === 'string' ? error : error?.message ?? 'Could not open payment proof.';
      toast.error(message);
    } finally {
      setProofBusyId(null);
    }
  }, []);

  const showSkeleton = loading && (!Array.isArray(rows) || rows.length === 0);
  const showActions = showActionsColumn || canManage;
  const colSpan = showActions ? 9 : 8;

  return (
    <Box sx={{ position: 'relative' }}>
      {loading && rows.length > 0 ? (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            borderRadius: 1,
          }}
        />
      ) : null}
      <TableContainer sx={{ overflowX: 'auto' }}>
      <Table
        size="small"
        sx={{
          minWidth: showActions ? 960 : 720,
          opacity: loading && rows.length > 0 ? 0.72 : 1,
          transition: (theme) => theme.transitions.create('opacity', { duration: 160 }),
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Learner</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>School held</TableCell>
            <TableCell>Program</TableCell>
            <TableCell>Submitted</TableCell>
            <TableCell>Payment proof</TableCell>
            <TableCell>Status</TableCell>
            {showActions ? <TableCell align="right">Actions</TableCell> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {showSkeleton
            ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  <TableCell colSpan={colSpan} sx={{ py: 1.5 }}>
                    <Skeleton variant="rounded" height={40} animation="wave" />
                  </TableCell>
                </TableRow>
              ))
            : null}

          {!showSkeleton && !loading && rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : null}

          {!showSkeleton && rows.length > 0
            ? rows.map((row) => {
                const isBusy = busyId === row.id;
                const isApproved = row.status === 'approved';
                const isRejected = row.status === 'rejected';

                return (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.userName || '—'}</TableCell>
                    <TableCell>{row.userEmail || '—'}</TableCell>
                    <TableCell>{row.phoneNumber || '—'}</TableCell>
                    <TableCell>{row.schoolHeld || '—'}</TableCell>
                    <TableCell>{row.programTitle || row.programId || '—'}</TableCell>
                    <TableCell>{row.submittedAt || '—'}</TableCell>
                    <TableCell>
                      {row.hasPaymentProof ? (
                        <Button
                          size="small"
                          variant="text"
                          disabled={proofBusyId === row.id}
                          onClick={() => handleViewPaymentProof(row)}
                        >
                          {proofBusyId === row.id ? 'Opening…' : 'View proof'}
                        </Button>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={STATUS_COLOR[row.status] ?? 'default'}
                      />
                    </TableCell>
                    {showActions ? (
                      <TableCell align="right">
                        {canManage ? (
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              disabled={isBusy || isApproved}
                              onClick={() => onStatusChange?.(row, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              disabled={isBusy || isRejected}
                              onClick={() => onStatusChange?.(row, 'rejected')}
                            >
                              Reject
                            </Button>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })
            : null}
        </TableBody>
      </Table>
      </TableContainer>
    </Box>
  );
}
