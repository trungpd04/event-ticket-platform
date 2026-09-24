import { useSearchParams } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthCodeVerification from 'sections/auth/auth-forms/AuthCodeVerification';

// ================================|| CODE VERIFICATION ||================================ //

export default function CodeVerification() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const masked = maskEmail(email);

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack sx={{ gap: 1 }}>
            <Typography variant="h3">Enter Verification Code</Typography>
            <Typography color="text.secondary">We sent a 6-digit code to your email.</Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <Typography>We&apos;ve sent the code to {email ? masked : '****@company.com'}</Typography>
        </Grid>
        <Grid size={12}>
          <AuthCodeVerification />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}

function maskEmail(email: string): string {
  if (!email) return '****@company.com';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [local, domain] = parts;
  const maskedLocal = local.length > 2 ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}` : local;
  return `${maskedLocal}@${domain}`;
}
