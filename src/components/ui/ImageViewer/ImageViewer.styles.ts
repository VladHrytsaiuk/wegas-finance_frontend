import styled, { css } from "styled-components";

export const ViewerContainer = styled.div`
  width: 90vw;
  max-width: 1200px;
  height: 85vh;
  display: flex;
  flex-direction: column;
  background-color: #111827; /* Темний фон для перегляду фото */
  border-radius: 12px;
  overflow: hidden;
  position: relative;
`;

export const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: rgba(17, 24, 39, 0.8);
  color: #fff;
  z-index: 10;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

export const Counter = styled.div`
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 1px;
  color: #9ca3af;
`;

export const MainImageContainer = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 1rem;
`;

export const MainImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* Фото не обрізається і не розтягується */
  user-select: none;
`;

export const NavButton = styled.button<{ $direction: "left" | "right" }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${(p) => (p.$direction === "left" ? "left: 1rem;" : "right: 1rem;")}

  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-50%) scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: translateY(-50%);
  }
`;

export const ThumbnailStrip = styled.div`
  height: 80px;
  background-color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0 1rem;
  overflow-x: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #4b5563;
    border-radius: 4px;
  }
`;

export const Thumbnail = styled.img<{ $isActive: boolean }>`
  height: 60px;
  width: 60px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.2s;
  border: 2px solid transparent;

  &:hover {
    opacity: 0.8;
  }

  ${(p) =>
    p.$isActive &&
    css`
      opacity: 1;
      border-color: var(--color-brand-500);
      transform: scale(1.05);
    `}
`;
