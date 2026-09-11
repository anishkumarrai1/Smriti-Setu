import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { runForceDOMTranslation } from '../../i18n/forceTranslateEngine';

export const ForceTranslationListener: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  useEffect(() => {
    if (currentLang === 'en') return;

    // Run immediate DOM force translation scan
    runForceDOMTranslation();

    // Setup MutationObserver to forcefully translate any newly dynamically mounted DOM nodes
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldScan = true;
          break;
        } else if (mutation.type === 'characterData') {
          shouldScan = true;
          break;
        }
      }
      if (shouldScan) {
        runForceDOMTranslation();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [currentLang]);

  return null;
};

export default ForceTranslationListener;
