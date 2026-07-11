import styled from "styled-components";

export const Container = styled.div`
  width: 70vw;
  max-width: 1200px;
  min-width: 900px;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-surface);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
`;

export const ContentWrapper = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
`;

export const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: color-mix(in srgb, var(--color-bg-surface) 82%, transparent);
  backdrop-filter: blur(2px);
  z-index: 20;
`;

export const LoadingContent = styled.div`
  width: 100%;
  max-width: 1000px;
`;

export const TableContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 2rem 2rem 2rem;
`;

export const StickyThead = styled.thead`
  position: sticky;
  top: 0;
  background: var(--color-bg-surface);
  z-index: 5;
  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    border-bottom: 1px solid var(--color-border);
  }
`;

export const Header = styled.div`
  padding: 1.2rem 2rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;

  h2 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.25rem;
    color: var(--color-text-main);
  }
`;

export const Footer = styled.div`
  padding: 1rem 2rem 1.5rem 2rem;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-surface);
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
`;

export const FooterActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const FooterLeftGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

export const DisclaimerBanner = styled.div`
  font-size: 0.8rem;
  color: var(--color-yellow-700);
  background-color: var(--color-yellow-50);
  border: 1px solid var(--color-yellow-100);
  padding: 6px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;

  svg {
    flex-shrink: 0;
    color: var(--color-yellow-600);
  }
`;

export const DisclaimerWrapper = styled.div`
  padding: 0 2rem;
`;

export const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-red-600);
  font-size: 0.9rem;
  font-weight: 600;
  background-color: var(--color-red-50);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-red-100);
`;

export const MagicButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid var(--color-brand-200);
  color: var(--color-brand-600);
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--color-brand-50);
    border-color: var(--color-brand-500);
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70vw;
  max-width: 1200px;
  min-width: 900px;
  height: 80vh;
  background-color: var(--color-bg-surface);
  border-radius: 16px;
`;

export const EmptyState = styled.div`
  padding: 2rem;
  textalign: center;
  color: var(--color-text-secondary);
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

export const ThCheckbox = styled.th`
  width: 40px;
  padding: 1rem;
  text-align: center;
`;

export const ThDate = styled.th`
  width: 110px;
  padding: 1rem;
  text-align: left;
`;

export const ThNote = styled.th`
  padding: 1rem;
  text-align: left;
`;

export const ThCategory = styled.th`
  width: 180px;
  padding: 1rem;
  text-align: left;
`;

export const ThAmount = styled.th`
  width: 120px;
  padding: 1rem;
  text-align: right;
`;

export const ThAction = styled.th`
  width: 50px;
`;
