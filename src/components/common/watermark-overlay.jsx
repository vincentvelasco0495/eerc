import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function WatermarkOverlay({ username, dateLabel }) {
  return (
    <Box
      sx={{
        inset: 0,
        zIndex: 1,
        display: 'flex',
        position: 'absolute',
        pointerEvents: 'none',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        background:
          'repeating-linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02) 18px, rgba(255,255,255,0.04) 18px, rgba(255,255,255,0.04) 36px)',
      }}
    >
      <Stack
        spacing={0.5}
        sx={{
          m: 2,
          px: 1.5,
          py: 1,
          borderRadius: 1.5,
          bgcolor: 'rgba(15, 23, 42, 0.72)',
        }}
      >
        <Typography variant="caption" sx={{ color: 'common.white' }}>
          Streaming Only
        </Typography>
        <Typography variant="caption" sx={{ color: 'common.white' }}>
          {username}
        </Typography>
        <Typography variant="caption" sx={{ color: 'grey.400' }}>
          {dateLabel}
        </Typography>
      </Stack>
    </Box>
  );
}
