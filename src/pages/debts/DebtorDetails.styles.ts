import styled from "styled-components";
import { Link } from "react-router-dom";

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  padding: 0 1rem;
  padding-bottom: 3rem;
`;

export const TopNav = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: var(--color-brand-600);
  }
`;

export const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 1rem 1.25rem;
  flex-wrap: wrap;
  gap: 1.5rem;
  box-shadow: var(--shadow-sm);
`;

export const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
`;

export const LargeAvatar = styled.div<{ $color?: string }>`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background-color: ${(props) =>
    `color-mix(in srgb, ${
      props.$color || "var(--color-brand-600)"
    }, transparent 90%)`};
  color: ${(props) => props.$color || "var(--color-brand-600)"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  border: 1px solid var(--color-border);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 16px;
  }
`;

export const NameBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  h1 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-main);
    margin: 0;
  }
  span {
    color: var(--color-text-secondary);
    font-size: 0.85rem;
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 0.6rem;
`;

export const BalancesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
`;

export const BalanceCard = styled.div<{
  $type: "positive" | "negative" | "neutral";
}>`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: ${(props) =>
      props.$type === "positive"
        ? "var(--color-green-500)"
        : props.$type === "negative"
        ? "var(--color-red-500)"
        : "var(--color-text-tertiary)"};
  }
`;

export const BalanceLabel = styled.span`
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const BalanceAmount = styled.div<{ $color: string }>`
  font-size: 1.25rem;
  font-weight: 700;
  font-family: "JetBrains Mono", monospace;
  color: ${(p) => p.$color};
`;

export const BalanceActions = styled.div`
  margin-top: auto;
  display: flex;
  gap: 8px;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin-top: 1rem;
`;

export const HistoryContainer = styled.div`
  margin-top: 1rem;
`;

export const DeleteWarningContainer = styled.div`
  padding: 2rem;
  text-align: center;
  max-width: 400px;

  h3 {
    margin-bottom: 1rem;
  }
`;

export const WarningIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;
