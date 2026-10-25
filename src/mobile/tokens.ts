import { createGlobalStyle } from "styled-components";

// Токени мобільного інтерфейсу в стилі iOS. Префікс --m- не перетинається
// зі старими --color-*, тож старі сторінки нічого не помічають.
export const MobileTokens = createGlobalStyle`
  :root {
    --m-font: -apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, system-ui, sans-serif;

    --m-bg: #f2f2f7;
    --m-surface: #ffffff;
    --m-surface-2: #efeff4;
    --m-label: #1c1c1e;
    --m-label-2: #6c6c70;
    --m-label-3: #aeaeb2;
    --m-separator: #e5e5ea;
    --m-fill: rgba(118, 118, 128, 0.12);
    --m-segment-active: #ffffff;
    --m-overlay: rgba(0, 0, 0, 0.32);

    --m-accent: #047857;
    --m-accent-soft: #e7f4ee;
    --m-on-accent: #ffffff;

    --m-tabbar-bg: rgba(249, 249, 249, 0.94);
    --m-tabbar-border: rgba(60, 60, 67, 0.2);
    --m-tabbar-h: 50px;

    --m-radius-group: 14px;
    --m-radius-card: 18px;
    --m-radius-tile: 10px;

    --m-tint-green-bg: #e7f4ee;
    --m-tint-green-fg: #047857;
    --m-tint-orange-bg: #fdf0e6;
    --m-tint-orange-fg: #b45309;
    --m-tint-blue-bg: #e8eefb;
    --m-tint-blue-fg: #1d4ed8;
    --m-tint-yellow-bg: #fef6dc;
    --m-tint-yellow-fg: #a16207;
    --m-tint-gray-bg: #efeff4;
    --m-tint-gray-fg: #3a3a3c;
  }

  [data-theme="dark"] {
    --m-bg: #000000;
    --m-surface: #1c1c1e;
    --m-surface-2: #2c2c2e;
    --m-label: #ffffff;
    --m-label-2: #aeaeb2;
    --m-label-3: #636366;
    --m-separator: #38383a;
    --m-fill: rgba(118, 118, 128, 0.24);
    --m-segment-active: #636366;
    --m-overlay: rgba(0, 0, 0, 0.5);

    --m-accent: #3dd68c;
    --m-accent-soft: rgba(61, 214, 140, 0.16);
    --m-on-accent: #00140a;

    --m-tabbar-bg: rgba(22, 22, 24, 0.94);
    --m-tabbar-border: rgba(84, 84, 88, 0.6);

    --m-tint-green-bg: rgba(61, 214, 140, 0.16);
    --m-tint-green-fg: #3dd68c;
    --m-tint-orange-bg: rgba(255, 159, 10, 0.16);
    --m-tint-orange-fg: #ffb340;
    --m-tint-blue-bg: rgba(64, 156, 255, 0.16);
    --m-tint-blue-fg: #64a8ff;
    --m-tint-yellow-bg: rgba(255, 214, 10, 0.16);
    --m-tint-yellow-fg: #ffd60a;
    --m-tint-gray-bg: #2c2c2e;
    --m-tint-gray-fg: #e5e5ea;
  }
`;

export type Tint = "green" | "orange" | "blue" | "yellow" | "gray";
