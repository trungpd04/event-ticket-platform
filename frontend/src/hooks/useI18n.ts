import { use } from 'react';

// project-imports
import { I18nContext } from 'contexts/I18nContext';

// ==============================|| HOOKS - I18N  ||============================== //

export default function useI18n() {
  return use(I18nContext);
}
