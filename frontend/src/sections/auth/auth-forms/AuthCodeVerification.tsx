import { useNavigate, useSearchParams } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { Formik } from 'formik';
import OtpInput from 'react-otp-input';
import * as Yup from 'yup';

// project-imports
import { openSnackbar } from 'api/snackbar';
import EventButton from 'components/event/EventButton';
import useAuth from 'hooks/useAuth';

// types
import { SnackbarProps } from 'types/snackbar';

// ============================|| JWT - CODE VERIFICATION ||============================ //

export default function AuthCodeVerification() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyOtp } = useAuth();

  const email = searchParams.get('email') || '';

  return (
    <Formik
      initialValues={{ otp: '' }}
      validationSchema={Yup.object({
        otp: Yup.string().length(6, 'OTP must be exactly 6 digits').required('OTP is required')
      })}
      onSubmit={async (values, { setSubmitting, setErrors }) => {
        try {
          await verifyOtp(email, values.otp, 'FORGOT_PASSWORD');
          openSnackbar({
            open: true,
            message: 'OTP verified successfully.',
            variant: 'alert',
            alert: { color: 'success' }
          } as SnackbarProps);
          navigate(`/reset-password?email=${encodeURIComponent(email)}&code=${values.otp}`, { replace: true });
        } catch (err: any) {
          setErrors({ otp: err.message || 'Invalid OTP' });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ errors, handleSubmit, touched, values, setFieldValue, isSubmitting }) => (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Box
                sx={{
                  '& input:focus-visible': {
                    outline: 'none !important',
                    borderColor: `${theme.palette.primary.main} !important`,
                    boxShadow: `0 0 0 2px ${theme.palette.primary.light} !important`
                  }
                }}
              >
                <OtpInput
                  value={values.otp}
                  onChange={(otp) => setFieldValue('otp', otp)}
                  inputType="tel"
                  shouldAutoFocus
                  renderInput={(props) => <input {...props} />}
                  numInputs={6}
                  containerStyle={{ justifyContent: 'space-between', margin: -8 }}
                  inputStyle={{
                    width: '100%',
                    margin: '8px',
                    padding: '10px',
                    border: '1px solid',
                    outline: 'none',
                    borderRadius: 8,
                    borderColor: touched.otp && errors.otp ? theme.palette.error.main : theme.palette.divider
                  }}
                />
                {touched.otp && errors.otp && (
                  <FormHelperText error id="standard-weight-helper-text-otp">
                    {errors.otp}
                  </FormHelperText>
                )}
              </Box>
            </Grid>
            <Grid size={12}>
              <EventButton disabled={isSubmitting} fullWidth type="submit" variant="contained" color="primary">
                Continue
              </EventButton>
            </Grid>
            <Grid size={12}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography variant="body2">Did not receive the email? Check your spam filter.</Typography>
              </Stack>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
}

