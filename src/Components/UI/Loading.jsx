import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

export default function Loading({ center = true, size = 48, thickness = 4 }){
  const style = center
    ? { minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    : {};
  return (
    <div style={style}>
      <Stack direction="row" spacing={2}>
        <CircularProgress color="primary" size={size} thickness={thickness} />
      </Stack>
    </div>
  );
}

