import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material-ui
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { Formik } from 'formik';
import * as Yup from 'yup';

// project-imports
import { openSnackbar } from 'api/snackbar';
import AuthInput from 'components/auth/AuthInput';
import EventButton from 'components/event/EventButton';
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';

// assets
import { Sms } from 'iconsax-reactjs';

// ============================|| AUTH - FORGOT PASSWORD ||============================ //

export default function AuthForgotPassword() {
  const scriptedRef = useScriptRef();
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  return (
    <>
      <Stack spacing={1.5} alignItems="center" textAlign="center">
        <Typography
          variant="h3"
          sx={{
            fontFamily: "'Lobster', cursive, sans-serif",
            fontSize: '2.25rem',
            color: '#FFFFFF'
          }}
        >
          Event
        </Typography>
        <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
          Enter your email and we&apos;ll send you an OTP to reset your password
        </Typography>
      </Stack>

      <Formik
        initialValues={{ email: '', submit: null }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            await forgotPassword(values.email);
            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
              openSnackbar({
                open: true,
                message: 'OTP has been sent to your email.',
                variant: 'alert',
                alert: { color: 'success' }
              } as any);
              setTimeout(() => {
                navigate(`/code-verification?email=${encodeURIComponent(values.email)}`, { replace: true });
              }, 1000);
            }
          } catch (err: any) {
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err.message || 'Failed to send OTP' });
              setSubmitting(false);
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <AuthInput
                  id="email-forgot"
                  name="email"
                  type="email"
                  label="Email"
                  value={values.email}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={Boolean(touched.email && errors.email)}
                  helperText={touched.email && errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Sms size={24} color="#999" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              {errors.submit && (
                <Grid size={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid size={12}>
                <EventButton disabled={isSubmitting} fullWidth type="submit" variant="contained" color="primary" sx={{ height: 56, borderRadius: 1 }}>
                  Send OTP
                </EventButton>
              </Grid>
              <Grid size={12} sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  <Typography
                    component={RouterLink}
                    to="/login"
                    variant="body2"
                    sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 500 }}
                  >
                    Back to Login
                  </Typography>
                </Typography>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}
