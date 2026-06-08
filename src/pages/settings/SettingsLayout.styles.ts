import styled, { css } from "styled-components";
import { NavLink } from "react-router-dom";

export const PageContainer = styled.div`
  width: 100%;
`;

export const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 2rem;
  align-items: start;

  @media (max-width: 1300px) {
    grid-template-columns: 220px 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Sidebar = styled.nav`
  background-color: var(--color-bg-surface);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

// Спільні стилі для посилання і кнопки
const ItemStyles = css`
  width: 100%;
  text-align: left;
  padding: 0.8rem 1.2rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.2s;
  font-size: 0.95rem;
  text-decoration: none;
  border: none;
  background: none;

  @media (max-width: 1300px) {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    gap: 0.6rem;
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-text-light);
    transition: color 0.2s;

    @media (max-width: 1300px) {
      width: 1.1rem;
      height: 1.1rem;
    }
  }
`;

export const SidebarItem = styled(NavLink)`
  ${ItemStyles}
  color: var(--color-text-main);
  border-left: 3px solid transparent;

  &:hover {
    background-color: var(--color-bg-page);
    color: var(--color-text-main);
    svg {
      color: var(--color-text-secondary);
    }
  }

  &.active {
    background-color: var(--color-brand-50);
    color: var(--color-brand-700);
    border-left-color: var(--color-brand-600);

    svg {
      color: var(--color-brand-600);
    }
  }
`;

export const LogoutButton = styled.button`
  ${ItemStyles}
  border-top: 1px solid var(--color-border);
  color: var(--color-text-secondary);

  &:hover {
    background-color: #fef2f2;
    color: var(--color-red-700);
    svg {
      color: var(--color-red-700);
    }
  }
`;

export const ContentCard = styled.div`
  background-color: var(--color-bg-surface);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  min-height: 400px;

  @media (max-width: 1300px) {
    padding: 1.5rem;
  }
`;
