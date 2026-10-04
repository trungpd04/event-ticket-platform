import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';

// material-ui
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { Formik } from 'formik';
import * as Yup from 'yup';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { openSnackbar } from 'api/snackbar';
import AuthInput from 'components/auth/AuthInput';
import EventButton from 'components/event/EventButton';
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';

// ============================|| AUTH - CODE VERIFICATION ||============================ //

export default function AuthCodeVerification() {
  const intl = useIntl();
  const scriptedRef = useScriptRef();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const { verifyOtp } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const t = setTimeout(() => setTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1****$3');

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
          {intl.formatMessage({ id: 'auth.brand' })}
        </Typography>
        <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
          {intl.formatMessage({ id: 'auth.codeVerification.subtitle' })}{' '}
          <strong style={{ color: '#FFFFFF' }}>{maskedEmail || intl.formatMessage({ id: 'auth.codeVerification.maskedEmail' })}</strong>
        </Typography>
      </Stack>

      <Formik
        initialValues={{ code: '', submit: null }}
        validationSchema={Yup.object().shape({
          code: Yup.string()
            .length(6, intl.formatMessage({ id: 'validation.otpLength' }, { length: 6 }))
            .required(intl.formatMessage({ id: 'validation.required' }, { field: intl.formatMessage({ id: 'auth.codeVerification.code' }) }))
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            await verifyOtp(email, values.code, 'FORGOT_PASSWORD');
            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
              openSnackbar({
                open: true,
                message: intl.formatMessage({ id: 'auth.codeVerification.success' }),
                variant: 'alert',
                alert: { color: 'success' }
              } as any);
              setTimeout(() => {
                navigate(`/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(values.code)}`, { replace: true });
              }, 800);
            }
          } catch (err: any) {
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err.message || intl.formatMessage({ id: 'auth.codeVerification.failed' }) });
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
                  inputRef={inputRef}
                  id="otp-code"
                  name="code"
                  type="text"
                  inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                  label={intl.formatMessage({ id: 'auth.codeVerification.code' })}
                  value={values.code}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={Boolean(touched.code && errors.code)}
                  helperText={touched.code && errors.code}
                />
              </Grid>
              {errors.submit && (
                <Grid size={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid size={12}>
                <EventButton disabled={isSubmitting} fullWidth type="submit" variant="contained" color="primary" sx={{ height: 56, borderRadius: 1 }}>
                  {intl.formatMessage({ id: 'auth.codeVerification.button' })}
                </EventButton>
              </Grid>
              <Grid size={12} sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  {intl.formatMessage({ id: 'auth.codeVerification.didntReceive' })}{' '}
                  {canResend ? (
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 500 }}
                      onClick={() => {
                        setTimer(60);
                        setCanResend(false);
                      }}
                    >
                      {intl.formatMessage({ id: 'auth.codeVerification.resend' })}
                    </Typography>
                  ) : (
                    <Typography component="span" variant="body2" sx={{ color: '#666' }}>
                      {intl.formatMessage({ id: 'auth.codeVerification.resendIn' }, { seconds: timer })}
                    </Typography>
                  )}
                </Typography>
              </Grid>
              <Grid size={12} sx={{ textAlign: 'center' }}>
                <Typography
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 500 }}
                >
                  {intl.formatMessage({ id: 'auth.codeVerification.backToLogin' })}
                </Typography>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}
