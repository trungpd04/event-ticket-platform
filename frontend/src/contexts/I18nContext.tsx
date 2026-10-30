import { createContext, ReactNode, useCallback, useMemo } from 'react';

// project-imports
import useLocalStorage from 'hooks/useLocalStorage';

// types
import { I18n } from 'types/config';

interface I18nContextValue {
  i18n: I18n;
  onChangeLocalization: (lang: I18n) => void;
}

const initialState: I18nContextValue = {
  i18n: 'en',
  onChangeLocalization: () => {}
};

const I18N_STORAGE_KEY = 'able-pro-material-react-ts-i18n';

function getInitialI18n(): I18n {
  if (typeof window === 'undefined') return 'en';

  // Prefer the dedicated i18n key
  const stored = localStorage.getItem(I18N_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as I18n;
    } catch {
      // ignore parse errors
    }
  }

  // Migrate from legacy config key
  const legacyConfig = localStorage.getItem('able-pro-material-react-ts-config');
  if (legacyConfig) {
    try {
      const parsed = JSON.parse(legacyConfig);
      if (parsed && typeof parsed.i18n === 'string') {
        return parsed.i18n as I18n;
      }
    } catch {
      // ignore parse errors
    }
  }

  return 'en';
}

// ==============================|| I18N CONTEXT & PROVIDER ||============================== //

const I18nContext = createContext<I18nContextValue>(initialState);

interface I18nProviderProps {
  children: ReactNode;
}

function I18nProvider({ children }: I18nProviderProps) {
  const [i18n, setI18n] = useLocalStorage<I18n>(I18N_STORAGE_KEY, getInitialI18n());

  const onChangeLocalization = useCallback(
    (lang: I18n) => {
      setI18n(lang);
    },
    [setI18n]
  );

  const value = useMemo(
    () => ({
      i18n,
      onChangeLocalization
    }),
    [i18n, onChangeLocalization]
  );

  return <I18nContext value={value}>{children}</I18nContext>;
}

export { I18nProvider, I18nContext };
