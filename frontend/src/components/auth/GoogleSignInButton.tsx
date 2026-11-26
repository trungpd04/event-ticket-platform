import { useEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';

import useAuth from 'hooks/useAuth';

type GoogleCredentialResponse = { credential?: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
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
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    const script = existing ?? document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Không thể tải Google Identity Services'));
    if (!existing) document.head.appendChild(script);
  });
  return googleScriptPromise;
}

export default function GoogleSignInButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { googleLogin } = useAuth();
  const [error, setError] = useState('');
  const clientId = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      setError('Google Sign-In chưa được cấu hình');
      return;
    }
    let active = true;
    loadGoogleScript()
      .then(() => {
        if (!active || !window.google || !containerRef.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            if (!credential) return;
            setError('');
            try {
              await googleLogin(credential);
            } catch (reason) {
              setError(reason instanceof Error ? reason.message : 'Đăng nhập Google thất bại');
            }
          }
        });
        containerRef.current.replaceChildren();
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'icon',
          theme: 'outline',
          size: 'large',
          shape: 'rectangular'
        });
      })
      .catch((reason: Error) => active && setError(reason.message));
    return () => {
      active = false;
    };
  }, [clientId, googleLogin]);

  return (
    <Box sx={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
      <Box ref={containerRef} sx={{ display: 'flex', justifyContent: 'center' }} />
      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  );
}
