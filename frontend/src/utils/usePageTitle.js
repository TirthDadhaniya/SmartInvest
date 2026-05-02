import { useEffect } from 'react';

const BASE_TITLE = 'SmartInvest';

export default function usePageTitle(title) {
  useEffect(() => {
    if (title) document.title = `${title} — ${BASE_TITLE}`;
    else document.title = BASE_TITLE;
  }, [title]);
}
