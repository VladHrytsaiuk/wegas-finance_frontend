import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
:root {
--radius-md: 8px;
/* --- LIGHT THEME --- */
--color-bg-page: #f3f4f6;
--color-bg-surface: #ffffff;
--color-text-main: #1f2937;
--color-text-secondary: #6b7280;
--color-text-tertiary: #9ca3af;
--color-text-light: #d1d5db;

--color-green-600: #059669;
--color-success: #059669;
--color-success-50: #ecfdf5;
--color-success-100: #d1fae5;
--color-success-200: #a7f3d0;
/* 🔥 ЧЕРВОНІ КОЛЬОРИ (Оновлено) */
--color-red-50: #fef2f2; /* Додано */
--color-red-100: #fee2e2; /* Додано */
--color-red-200: #fecaca; /* Додано */
--color-red-600: #dc2626;
--color-red-700: #b91c1c;
--color-red-800: #991b1b;

/* Жовті кольори */
--color-yellow-50: #fefce8;
--color-yellow-100: #fef9c3;
--color-yellow-600: #ca8a04;
--color-yellow-700: #a16207;
--color-yellow-800: #7e4a00ff;
/* Brand Colors */
--color-brand-50: #ecfdf5;
--color-brand-100: #d1fae5;
--color-brand-500: #10b981;
--color-brand-600: #059669;
--color-brand-700: #047857;

--color-transfer-out: #1d4ed8; /* Темно-синій (Royal Blue) */
--color-transfer-in:  #0ea5e9; /* Світло-блакитний (Sky Blue) */

--color-border: #e5e7eb;
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

--color-error: #ef4444;       /* Основний червоний */
  --color-error-50: #fef2f2;    /* Дуже світлий фон */
  --color-error-200: #fecaca;   /* Бордер */

  /* Warning (Жовтий/Оранжевий) */
  --color-warning: #f59e0b;      /* Основний оранжевий */
  --color-warning-light: #fffbeb; /* Дуже світлий фон */
  --color-warning-dark: #92400e;  /* Темний текст для контрасту */
}

/* --- DARK THEME OVERRIDES --- */
[data-theme="dark"] {
--color-bg-page: #111827;
--color-bg-surface: #1f2937;
--color-text-main: #f9fafb;
--color-text-secondary: #d1d5db;
--color-text-tertiary: #9ca3af;
--color-text-light: #4b5563;
--color-brand-50: rgba(16, 185, 129, 0.12);
--color-brand-700: #34d399;
--color-brand-600: #10b981;

--color-green-600: #34d399;
--color-success: #34d399;
--color-success-50: rgba(52, 211, 153, 0.1);
--color-success-100: rgba(52, 211, 153, 0.2);
--color-success-200: rgba(52, 211, 153, 0.3);

--color-transfer-out: #3b82f6; /* Стандартний синій */
--color-transfer-in:  #38bdf8; /* Яскраво-блакитний */



/* 🔥 ЧЕРВОНІ КОЛЬОРИ DARK (Оновлено) */
--color-red-50: rgba(239, 68, 68, 0.1); /* Додано */
--color-red-100: rgba(239, 68, 68, 0.2); /* Додано */
--color-red-200: rgba(239, 68, 68, 0.3); /* Додано */
--color-red-600: #f87171;
--color-red-700: #ef4444;
--color-red-800: #dc2626;

/* Жовті кольори */
--color-yellow-50: rgba(234, 179, 8, 0.1);
--color-yellow-100: rgba(234, 179, 8, 0.2);
--color-yellow-600: #facc15;
--color-yellow-700: #fef08a;
--color-border: #374151;
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3);

--color-error: #f87171;                /* Світліший червоний для темного фону */
  --color-error-50: rgba(239, 68, 68, 0.15); /* Напівпрозорий червоний фон */
  --color-error-200: rgba(239, 68, 68, 0.4); /* Напівпрозорий бордер */

  /* Warning (Жовтий/Оранжевий) */
  --color-warning: #fbbf24;               /* Яскравий жовтий */
  --color-warning-light: rgba(245, 158, 11, 0.15); /* Напівпрозорий жовтий фон */
  
  /* Увага: в темній темі "dark" колір тексту має бути світлим, щоб читатися! */
  --color-warning-dark: #fcd34d;          /* Світло-жовтий текст */
}

/* GLOBAL RESET & BASICS */
* {
box-sizing: border-box;
padding: 0;
margin: 0;
}

body {
font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
background-color: var(--color-bg-page);
color: var(--color-text-main);
min-height: 100vh;
font-size: 16px;
line-height: 1.5;
transition: background-color 0.3s ease, color 0.3s ease;
overflow-x: hidden;
}

button { font-family: inherit; }
ul { list-style: none; }
a { text-decoration: none; color: inherit; }

/* SCROLLBAR STYLING */
::-webkit-scrollbar {
width: 12px;
height: 12px;
}

::-webkit-scrollbar-track {
background: var(--color-bg-page);
}

::-webkit-scrollbar-thumb {
background-color: var(--color-text-secondary);
border-radius: 10px;
border: 3px solid var(--color-bg-page);
}

::-webkit-scrollbar-thumb:hover {
background-color: var(--color-text-main);
}

::-webkit-scrollbar-corner {
background-color: var(--color-bg-page);
}

/* Авто-фокус для селектів при пошуку (курсор на першому елементі) */
[data-autofocus="true"] {
  background-color: var(--color-brand-50) !important;
  box-shadow: inset 0 0 0 1px var(--color-brand-500) !important;
  outline: none !important;
  transition: all 0.1s ease;
}

/* Глобальний фокус для інтерактивних елементів (кнопки, лінки, пункти списків, стрілки) */
button:focus-visible, 
a:focus-visible, 
[role="button"]:focus-visible,
input:focus-visible,
[tabindex="0"]:focus-visible {
  outline: none !important;
  box-shadow: 0 0 0 1.5px var(--color-brand-200) !important;
}

/* Спеціальний стан для пунктів селекту та стрілок розгортання при фокусі */
[role="button"][tabindex="0"]:focus-visible,
button[type="button"]:focus-visible {
  background-color: var(--color-brand-50) !important;
  box-shadow: inset 0 0 0 1px var(--color-brand-400) !important;
}

[data-theme="dark"] [data-autofocus="true"] {
  background-color: rgba(16, 185, 129, 0.15) !important;
  box-shadow: inset 0 0 0 1px var(--color-brand-500) !important;
}

[data-theme="dark"] button:focus-visible,
[data-theme="dark"] a:focus-visible,
[data-theme="dark"] [role="button"]:focus-visible,
[data-theme="dark"] input:focus-visible {
  box-shadow: 0 0 0 1.5px rgba(16, 185, 129, 0.4) !important;
}
`;
