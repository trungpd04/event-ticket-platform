import { useEffect, useState } from 'react';

import CardMedia from '@mui/material/CardMedia';

import { openSnackbar } from 'api/snackbar';
import AuthSocialButton from 'components/auth/AuthSocialButton';
import useAuth from 'hooks/useAuth';
import imgGoogle from 'assets/images/auth/google.svg';
import { SnackbarProps } from 'types/snackbar';

type GoogleCredentialResponse = { credential?: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (window.google) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const source = 'https://accounts.google.com/gsi/client';
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${source}"]`);
    const script = existing ?? document.createElement('script');
    script.src = source;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Không thể tải dịch vụ đăng nhập Google'));
    if (!existing) document.head.appendChild(script);
  });

  return googleScriptPromise;
}

function showError(message: string) {
  openSnackbar({
    open: true,
    message,
    variant: 'alert',
    alert: { color: 'error' }
  } as SnackbarProps);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
  return 'Đăng nhập Google thất bại';
}

export default function GoogleSignInButton() {
  const { googleLogin } = useAuth();
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const clientId = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    let active = true;

    loadGoogleScript()
      .then(() => {
        if (!active || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
          callback: async ({ credential }) => {
            if (!credential) return;
            setSubmitting(true);
            try {
              await googleLogin(credential);
            } catch (error) {
              showError(getErrorMessage(error));
              setSubmitting(false);
            }
          }
        });
        setReady(true);
      })
      .catch((error: Error) => active && showError(error.message));

    return () => {
      active = false;
    };
  }, [clientId, googleLogin]);

  const handleClick = () => {
    if (!clientId) {
      showError('Google Sign-In chưa được cấu hình');
      return;
    }
    if (!ready || !window.google) {
      showError('Dịch vụ đăng nhập Google đang được tải, vui lòng thử lại');
      return;
    }
    window.google.accounts.id.prompt();
  };

  return (
    <AuthSocialButton
      type="button"
      disabled={submitting}
      onClick={handleClick}
      aria-label="Đăng nhập bằng Google"
      icon={<CardMedia component="img" src={imgGoogle} alt="Google" sx={{ width: 24, height: 24 }} />}
    />
  );
}
