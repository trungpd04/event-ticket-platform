import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export default function EventCardSkeleton() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'relative',
        width: '100%',
        height: 416,
        borderRadius: 2.5,
        overflow: 'hidden',
        bgcolor: '#1b1b1b',
        border: '1px solid #292929'
      }}
    >
      <Skeleton
        variant="rectangular"
        animation="wave"
        sx={{
          width: '100%',
          height: 336,
          bgcolor: 'rgba(255,255,255,.08)',
          '&:after': { background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent)' }
        }}
      />
      <Stack spacing={1.5} sx={{ position: 'absolute', left: 1, right: 1, bottom: 1, p: 2, height: 102, bgcolor: '#1b1b1b' }}>
        <Skeleton animation="wave" variant="text" width="78%" height={28} sx={{ bgcolor: 'rgba(255,255,255,.1)' }} />
        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Skeleton animation="wave" variant="text" width="42%" sx={{ bgcolor: 'rgba(255,255,255,.08)' }} />
          <Skeleton animation="wave" variant="text" width="28%" sx={{ bgcolor: 'rgba(255,255,255,.08)' }} />
        </Stack>
        <Skeleton animation="wave" variant="text" width="48%" height={24} sx={{ bgcolor: 'rgba(213,128,242,.18)' }} />
      </Stack>
    </Box>
  );
}
