import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import CardMedia from '@mui/material/CardMedia';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { Formik } from 'formik';
import * as Yup from 'yup';

// project-imports
import AuthCheckbox from 'components/auth/AuthCheckbox';
import AuthDivider from 'components/auth/AuthDivider';
import AuthInput from 'components/auth/AuthInput';
import AuthSocialButton from 'components/auth/AuthSocialButton';
import AuthToggle from 'components/auth/AuthToggle';
import EventButton from 'components/event/EventButton';
import IconButton from 'components/@extended/IconButton';
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';

// assets
import { Eye, EyeSlash, Lock, Sms } from 'iconsax-reactjs';
import imgApple from 'assets/images/auth/apple.svg';
import imgFacebook from 'assets/images/auth/facebook.svg';
import imgGoogle from 'assets/images/auth/google.svg';

// ============================|| AUTH - LOGIN ||============================ //

export default function AuthLogin() {
  const { login } = useAuth();
  const scriptedRef = useScriptRef();

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

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
          Please enter your email to login
        </Typography>
      </Stack>

      <AuthToggle />

      <Formik
        initialValues={{ email: '', password: '', submit: null }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          password: Yup.string().required('Password is required').min(8, 'Password must be at least 8 characters')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            await login(values.email.trim(), values.password);
            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
            }
          } catch (err: any) {
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err.message || 'Login failed' });
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
                  id="email-login"
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
              <Grid size={12}>
                <AuthInput
                  id="password-login"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  value={values.password}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={Boolean(touched.password && errors.password)}
                  helperText={touched.password && errors.password}
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
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <FormControlLabel
                    control={<AuthCheckbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />}
                    label={<Typography sx={{ color: '#FFFFFF', fontSize: '0.875rem' }}>Remember me</Typography>}
                  />
                  <Typography
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    sx={{ color: '#999', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                  >
                    Forgot Password?
                  </Typography>
                </Stack>
              </Grid>
              {errors.submit && (
                <Grid size={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid size={12}>
                <EventButton disabled={isSubmitting} fullWidth type="submit" variant="contained" color="primary" sx={{ height: 56, borderRadius: 1 }}>
                  Log in
                </EventButton>
              </Grid>
              <Grid size={12} sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  New to Event?{' '}
                  <Typography
                    component={RouterLink}
                    to="/register"
                    variant="body2"
                    sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 500 }}
                  >
                    Create account
                  </Typography>
                </Typography>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>

      <Box sx={{ width: '100%' }}>
        <AuthDivider />
        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <AuthSocialButton icon={<CardMedia component="img" src={imgApple} alt="Apple" sx={{ width: 24, height: 24 }} />} />
          <AuthSocialButton icon={<CardMedia component="img" src={imgGoogle} alt="Google" sx={{ width: 24, height: 24 }} />} />
          <AuthSocialButton icon={<CardMedia component="img" src={imgFacebook} alt="Facebook" sx={{ width: 24, height: 24 }} />} />
        </Stack>
      </Box>
    </>
  );
}
