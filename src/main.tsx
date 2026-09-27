// Top-level cache buster: clear any legacy 2026-09-21 entries from localStorage before React mounts
if (typeof localStorage !== 'undefined') {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key);
        if (val && (val.includes('2026-09-21') || val.includes('September 21'))) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch {}
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
