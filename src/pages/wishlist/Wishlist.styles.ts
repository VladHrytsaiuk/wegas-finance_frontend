import styled, { css } from "styled-components";

// --- LAYOUT ---
export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Reduced from 2rem for a tighter vertical rhythm */
  width: 100%;
  padding-bottom: 4rem;
  max-width: 1600px;
  margin: 0 auto;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

// --- HEADER ---
export const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0; /* Relying on PageContainer gap */
`;

export const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;

  &:hover {
    color: var(--color-text-main);
  }
`;

export const GroupTitleBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--color-text-main);
    margin: 0;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }
`;

export const StyledIconBox = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background-color: ${(p) =>
    `color-mix(in srgb, ${p.$color}, transparent 85%)`};
  color: ${(p) => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  flex-shrink: 0;
`;

// --- FOLDER CARD ---
export const FolderCard = styled.div<{ $color?: string }>`
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-out;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
    border-color: ${(p) => p.$color || "var(--color-brand-300)"};

    .folder-actions {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const FolderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

export const FolderIconWrapper = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background-color: ${(p) =>
    `color-mix(in srgb, ${p.$color || "var(--color-brand-500)"}, transparent 90%)`};
  color: ${(p) => p.$color || "var(--color-brand-500)"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

export const FolderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const FolderTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
  line-height: 1.3;
`;

export const FolderDescription = styled.span`
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
  font-weight: 500;
`;

export const FolderActions = styled.div`
  display: flex;
  gap: 6px;
  opacity: 0;
  transform: translateY(5px);
  transition: all 0.2s ease-out;
  margin-left: auto;
`;

export const FolderActionBtn = styled.button<{ $variant?: "edit" | "delete" }>`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background-color: transparent;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(p) =>
      p.$variant === "delete"
        ? "var(--color-red-50)"
        : "var(--color-bg-hover)"};
    color: ${(p) =>
      p.$variant === "delete"
        ? "var(--color-red-600)"
        : "var(--color-text-main)"};
  }
`;

// --- WISH CARD ---
export const WishCard = styled.div<{ $isBought?: boolean }>`
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: visible;
  position: relative;
  transition: all 0.2s ease-out;
  height: 100%;

  ${(p) =>
    p.$isBought &&
    css`
      opacity: 0.75;
      background-color: var(--color-bg-page);
      border-style: dashed;

      img {
        filter: grayscale(100%);
        opacity: 0.8;
      }
    `}

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-brand-300);
  }
`;

export const CardImage = styled.div<{ $src?: string }>`
  width: 100%;
  height: 200px;
  flex-shrink: 0;
  background-color: var(--color-bg-page);
  border-bottom: 1px solid var(--color-border);
  position: relative;
  border-radius: 16px 16px 0 0;
  overflow: hidden;

  ${(p) =>
    p.$src &&
    css`
      background-image: url(${p.$src});
      background-size: cover;
      background-position: center;
    `}

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CardBody = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.8rem;
`;

export const Title = styled.h3<{ $isBought?: boolean }>`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
  line-height: 1.4;
  text-decoration: ${(p) => (p.$isBought ? "line-through" : "none")};

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
`;

export const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-secondary);

  svg {
    color: var(--color-text-tertiary);
  }
`;

export const PriceRow = styled.div`
  margin-top: auto;
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const PriceText = styled.div`
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text-main);
  letter-spacing: -0.02em;
`;

// --- MENU (Dropdown) ---

export const MenuTriggerContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
`;

export const MenuButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #1f2937;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);

  &:hover {
    background: white;
    transform: scale(1.1);
  }
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 6px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  padding: 6px;
  z-index: 20;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: fadeIn 0.1s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const MenuItem = styled.button<{ $variant?: "delete" | "check" }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-secondary);

  &:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-main);
  }

  ${(p) =>
    p.$variant === "check" &&
    css`
      color: var(--color-brand-600);
      &:hover {
        background: var(--color-brand-50);
        color: var(--color-brand-700);
      }
    `}

  ${(p) =>
    p.$variant === "delete" &&
    css`
      color: var(--color-red-600);
      &:hover {
        background: var(--color-red-50);
        color: var(--color-red-700);
      }
    `}
  
  svg {
    width: 18px;
    height: 18px;
    opacity: 0.8;
  }
`;

// --- MAIN BUTTONS ---

// 🔥 НОВА КНОПКА ДЛЯ ПОСИЛАННЯ (Поруч з ціною)
export const LinkBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background-color: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--color-bg-page);
    color: var(--color-brand-600);
    border-color: var(--color-brand-300);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const ReserveBtn = styled.button<{
  $isActive?: boolean;
  $isLocked?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 1rem;

  ${(p) =>
    p.$isLocked &&
    css`
      background-color: var(--color-bg-page);
      color: var(--color-text-tertiary);
      border-color: var(--color-border);
      cursor: not-allowed;
      opacity: 0.8;
    `}

  ${(p) =>
    p.$isActive &&
    !p.$isLocked &&
    css`
      background-color: var(--color-brand-500);
      color: white;
      border-color: var(--color-brand-600);

      &:hover {
        background-color: var(--color-brand-600);
      }
    `}

  ${(p) =>
    !p.$isActive &&
    !p.$isLocked &&
    css`
      background-color: var(--color-bg-surface);
      color: var(--color-text-main);
      border-color: var(--color-border);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

      &:hover {
        background-color: var(--color-bg-page);
        border-color: var(--color-text-tertiary);
      }

      &:active {
        transform: scale(0.98);
      }
    `}
`;

// --- BADGES ---

export const StatusBadge = styled.div<{ $isMine: boolean }>`
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 6px;

  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  ${(p) =>
    p.$isMine
      ? css`
          background-color: rgba(16, 185, 129, 0.9);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        `
      : css`
          background-color: rgba(31, 41, 55, 0.85);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
        `}
`;

export const PriorityBadge = styled.div<{ $priority: number }>`
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  width: fit-content;

  ${(p) => {
    switch (p.$priority) {
      case 3:
        return css`
          background: var(--color-red-50);
          color: var(--color-red-600);
          border: 1px solid var(--color-red-200);
        `;
      case 2:
        return css`
          background: var(--color-yellow-50);
          color: var(--color-yellow-600);
          border: 1px solid var(--color-yellow-200);
        `;
      default:
        return css`
          background: var(--color-bg-page);
          color: var(--color-text-tertiary);
          border: 1px solid var(--color-border);
        `;
    }
  }}
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
  color: var(--color-text-secondary);
  border: 1px dashed var(--color-border);
  border-radius: 20px;
  background: var(--color-bg-surface);
  gap: 1.5rem;
  grid-column: 1 / -1;

  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-main);
  }

  p {
    color: var(--color-text-secondary);
    max-width: 400px;
    margin: 0;
    line-height: 1.6;
  }
`;

export const EmptyIconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--color-bg-page);
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;

  svg {
    width: 40px;
    height: 40px;
    opacity: 0.5;
  }
`;
