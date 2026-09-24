import { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';

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
import IconButton from 'components/@extended/IconButton';
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';

// assets
import { Eye, EyeSlash, Lock } from 'iconsax-reactjs';

// ============================|| AUTH - RESET PASSWORD ||============================ //

export default function AuthResetPassword() {
  const scriptedRef = useScriptRef();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const email = searchParams.get('email') || '';
  const code = searchParams.get('code') || '';

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
          Set a new password for your account
        </Typography>
      </Stack>

      <Formik
        initialValues={{ newPassword: '', confirmPassword: '', submit: null }}
        validationSchema={Yup.object().shape({
          newPassword: Yup.string().required('New password is required').min(8, 'Password must be at least 8 characters'),
          confirmPassword: Yup.string()
            .required('Please confirm your password')
            .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            await resetPassword(email, code, values.newPassword);
            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
              openSnackbar({
                open: true,
                message: 'Password reset successfully.',
                variant: 'alert',
                alert: { color: 'success' }
              } as any);
              setTimeout(() => navigate('/login', { replace: true }), 1200);
            }
          } catch (err: any) {
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err.message || 'Password reset failed' });
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
                  id="new-password"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  label="New password"
                  value={values.newPassword}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={Boolean(touched.newPassword && errors.newPassword)}
                  helperText={touched.newPassword && errors.newPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={24} color="#999" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" color="secondary">
                          {showPassword ? <Eye size={24} color="#999" /> : <EyeSlash size={24} color="#999" />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid size={12}>
                <AuthInput
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  label="Confirm password"
                  value={values.confirmPassword}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={24} color="#999" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" color="secondary">
                          {showConfirm ? <Eye size={24} color="#999" /> : <EyeSlash size={24} color="#999" />}
                        </IconButton>
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
                  Reset password
                </EventButton>
              </Grid>
              <Grid size={12} sx={{ textAlign: 'center' }}>
                <Typography
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 500 }}
                >
                  Back to Login
                </Typography>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}
