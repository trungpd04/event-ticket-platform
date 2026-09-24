import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// material-ui
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';

// third-party
import { Formik } from 'formik';
import * as Yup from 'yup';

// project-imports
import { openSnackbar } from 'api/snackbar';
import EventButton from 'components/event/EventButton';
import EventInput from 'components/event/EventInput';
import IconButton from 'components/@extended/IconButton';
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';

// types
import { SnackbarProps } from 'types/snackbar';

// assets
import { Eye, EyeSlash } from 'iconsax-reactjs';

// ============================|| JWT - RESET PASSWORD ||============================ //

export default function AuthResetPassword() {
  const scriptedRef = useScriptRef();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  const email = searchParams.get('email') || '';
  const code = searchParams.get('code') || '';

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event: React.SyntheticEvent) => event.preventDefault();

  return (
    <>
      <Formik
        initialValues={{
          password: '',
          confirmPassword: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
          confirmPassword: Yup.string()
            .required('Confirm Password is required')
            .test('confirmPassword', 'Both passwords must match', (confirmPassword, yup) => yup.parent.password === confirmPassword)
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            await resetPassword(email, code, values.password);
            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
              openSnackbar({
                open: true,
                message: 'Password reset successfully.',
                variant: 'alert',
                alert: { color: 'success' }
              } as SnackbarProps);
              setTimeout(() => {
                navigate('/login', { replace: true });
              }, 1500);
            }
          } catch (err: any) {
            console.error(err);
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err.message || 'Failed to reset password' });
              setSubmitting(false);
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="password-reset">New Password</InputLabel>
                  <EventInput
                    error={Boolean(touched.password && errors.password)}
                    id="password-reset"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <Eye /> : <EyeSlash />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Enter new password"
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error id="helper-text-password-reset">
                    {errors.password}
                  </FormHelperText>
                )}
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="confirm-password-reset">Confirm Password</InputLabel>
                  <EventInput
                    error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                    id="confirm-password-reset"
                    type="password"
                    value={values.confirmPassword}
                    name="confirmPassword"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                  />
                </Stack>
                {touched.confirmPassword && errors.confirmPassword && (
                  <FormHelperText error id="helper-text-confirm-password-reset">
                    {errors.confirmPassword}
                  </FormHelperText>
                )}
              </Grid>
              {errors.submit && (
                <Grid size={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid size={12}>
                <EventButton disabled={isSubmitting} fullWidth type="submit" variant="contained" color="primary">
                  Reset Password
                </EventButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}
