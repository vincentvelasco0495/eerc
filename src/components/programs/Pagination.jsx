import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { PROGRAMS_PER_PAGE_OPTIONS } from 'src/services/programService';

function buildPageList(current, last) {
  if (last <= 1) return [1];
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }
  const set = new Set([1, last, current, current - 1, current + 1]);
  return [...set].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);
}

/** Label + dropdown for server-side page size (e.g. header row, top-right). */
export function ProgramsPerPageControl({ perPage = 10, onPerPageChange, disabled = false }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
        Items per page
      </Typography>
      <Select
        size="small"
        value={perPage}
        disabled={disabled}
        onChange={(e) => onPerPageChange(Number(e.target.value))}
        sx={{ minWidth: 72 }}
      >
        {PROGRAMS_PER_PAGE_OPTIONS.map((n) => (
          <MenuItem key={n} value={n}>
            {n}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
}

/**
 * Footer: range summary (left) and Previous / page numbers / Next (right).
 */
export function ProgramsPagination({
  page = 1,
  lastPage = 1,
  total = 0,
  from = 0,
  to = 0,
  onPageChange,
  disabled = false,
}) {
  const pages = buildPageList(page, lastPage);
  const items = [];

  for (let i = 0; i < pages.length; i += 1) {
    const p = pages[i];
    const prev = pages[i - 1];
    if (i > 0 && p - prev > 1) {
      items.push(
        <Typography key={`ellipsis-${prev}-${p}`} variant="body2" color="text.secondary" sx={{ px: 0.5 }}>
          …
        </Typography>
      );
    }
    items.push(
      <Button
        key={p}
        size="small"
        variant={p === page ? 'contained' : 'text'}
        color={p === page ? 'primary' : 'inherit'}
        onClick={() => onPageChange(p)}
        disabled={disabled || p === page}
        sx={{ minWidth: 40 }}
      >
        {p}
      </Button>
    );
  }

  const rangeLabel =
    total === 0
      ? 'Showing 0 of 0 items'
      : `Showing ${from}–${to} of ${total} ${total === 1 ? 'item' : 'items'}`;

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      sx={{ pt: 2, borderTop: (t) => `1px solid ${t.vars.palette.divider}` }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0 }}>
        {rangeLabel}
      </Typography>

      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        flexWrap="wrap"
        justifyContent="flex-end"
        sx={{ ml: { xs: 0, sm: 'auto' }, width: { xs: '100%', sm: 'auto' } }}
      >
        <Button size="small" variant="outlined" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 0.5,
            justifyContent: 'flex-end',
          }}
        >
          {items}
        </Box>

        <Button
          size="small"
          variant="outlined"
          disabled={disabled || page >= lastPage}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </Stack>
    </Stack>
  );
}
