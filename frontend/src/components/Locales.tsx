import { ReactNode } from 'react';

// third-party
import { IntlProvider, MessageFormatElement } from 'react-intl';

// project-imports
import useI18n from 'hooks/useI18n';

// types
import { I18n } from 'types/config';

// locales
import enMessages from 'utils/locales/en.json';
import viMessages from 'utils/locales/vi.json';
import frMessages from 'utils/locales/fr.json';
import roMessages from 'utils/locales/ro.json';
import zhMessages from 'utils/locales/zh.json';

type Messages = Record<string, string> | Record<string, MessageFormatElement[]>;

const localeMessages: Record<I18n, Messages> = {
  en: enMessages,
  vi: viMessages,
  fr: frMessages,
  ro: roMessages,
  zh: zhMessages
};

interface Props {
  children: ReactNode;
}

// ==============================|| LOCALIZATION ||============================== //

export default function Locales({ children }: Props) {
  const { i18n } = useI18n();
  const messages = localeMessages[i18n] ?? localeMessages.en;

  return (
    <IntlProvider locale={i18n} defaultLocale="en" messages={messages}>
      {children}
    </IntlProvider>
  );
}
