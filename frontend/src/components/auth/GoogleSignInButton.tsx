import { useEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box';
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
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            }
          ) => void;
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
  const [submitting, setSubmitting] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      showError('Google Sign-In chưa được cấu hình');
      return;
    }
    let active = true;

    loadGoogleScript()
      .then(() => {
        if (!active || !window.google || !buttonContainerRef.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
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
        buttonContainerRef.current.replaceChildren();
        window.google.accounts.id.renderButton(buttonContainerRef.current, {
          type: 'icon',
          theme: 'outline',
          size: 'medium',
          shape: 'square'
        });
      })
      .catch((error: Error) => active && showError(error.message));

    return () => {
      active = false;
    };
  }, [clientId, googleLogin]);

  return (
    <Box sx={{ flex: 1, height: 60, position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
      <AuthSocialButton
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        disabled={submitting}
        sx={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        icon={<CardMedia component="img" src={imgGoogle} alt="" sx={{ width: 24, height: 24 }} />}
      />
      <Box
        ref={buttonContainerRef}
        aria-label="Đăng nhập bằng Google"
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          zIndex: 1,
          opacity: 0.01,
          transform: 'translate(-50%, -50%) scale(4, 1.875)',
          transformOrigin: 'center',
          pointerEvents: submitting ? 'none' : 'auto'
        }}
      />
    </Box>
  );
}
