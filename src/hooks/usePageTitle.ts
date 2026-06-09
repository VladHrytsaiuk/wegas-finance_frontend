import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function usePageTitle(title?: string) {
  const { t, i18n } = useTranslation();
  
  const appName = t('common:shared.app_name', 'Фінансовий дашборд');

  useEffect(() => {
    if (title) {
      document.title = t('common:shared.page_title_template', {
        page: title,
        app: appName,
        defaultValue: `${title} | ${appName}`
      });
    } else {
      document.title = appName;
    }
  }, [title, appName, i18n.language, t]);
}
