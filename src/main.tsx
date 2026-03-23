import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initThemeColorObserver, syncDarkClassFromUrl, syncThemeColorMeta } from './utils/themeColor';

// 与 App 中 localStorage / URL darkMode 一致，首屏即正确 class + theme-color
syncDarkClassFromUrl();
syncThemeColorMeta();
initThemeColorObserver();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
