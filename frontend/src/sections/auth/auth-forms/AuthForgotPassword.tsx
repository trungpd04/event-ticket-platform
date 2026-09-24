import { useNavigate } from 'react-router-dom';

// material-ui
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { Formik } from 'formik';
import * as Yup from 'yup';

// project-imports
import { openSnackbar } from 'api/snackbar';
import EventButton from 'components/event/EventButton';
import EventInput from 'components/event/EventInput';
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';

// types
import { SnackbarProps } from 'types/snackbar';

// ============================|| JWT - FORGOT PASSWORD ||============================ //

export default function AuthForgotPassword() {
  const scriptedRef = useScriptRef();
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  return (
    <>
      <Formik
        initialValues={{
          email: '',
          submit: null
        }}
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
              } as SnackbarProps);
              setTimeout(() => {
                navigate(`/code-verification?email=${encodeURIComponent(values.email)}`, { replace: true });
              }, 1000);
            }
          } catch (err: any) {
            console.error(err);
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
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="email-forgot">Email Address</InputLabel>
                  <EventInput
                    id="email-forgot"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    error={Boolean(touched.email && errors.email)}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="helper-text-email-forgot">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>
              {errors.submit && (
                <Grid size={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid sx={{ mb: -2 }} size={12}>
                <Typography variant="caption">Do not forget to check the SPAM box.</Typography>
              </Grid>
              <Grid size={12}>
                <EventButton disabled={isSubmitting} fullWidth type="submit" variant="contained" color="primary">
                  Send OTP
                </EventButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}
