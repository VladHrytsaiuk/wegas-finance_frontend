import styled from "styled-components";
import { Link } from "react-router-dom";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  flex: 1;
  overflow-x: hidden;
`;

export const SummaryRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

export const SummaryCard = styled.div<{
  $type?: "positive" | "negative" | "neutral";
}>`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6px;
    background-color: ${(props) =>
      props.$type === "positive"
        ? "var(--color-green-500)"
        : props.$type === "negative"
          ? "var(--color-red-500)"
          : "var(--color-brand-500)"};
  }
`;

export const SummaryLabel = styled.div`
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 1300px) {
    font-size: 0.65rem;
  }
`;

export const CurrencyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

export const SummaryValue = styled.div<{ $color?: string }>`
  font-size: 1.15rem;
  font-weight: 700;
  font-family: "JetBrains Mono", monospace;
  color: ${(props) => props.$color || "var(--color-text-main)"};
  line-height: 1.1;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 1300px) {
    font-size: 1.05rem;
  }
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 4px;
`;

export const SectionTitle = styled.h2`
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text-main);
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Badge = styled.span<{ $type: "green" | "red" | "neutral" }>`
  font-size: 0.65rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$type === "green"
      ? "var(--color-green-100)"
      : props.$type === "red"
        ? "var(--color-red-100)"
        : "var(--color-grey-100)"};
  color: ${(props) =>
    props.$type === "green"
      ? "var(--color-green-700)"
      : props.$type === "red"
        ? "var(--color-red-700)"
        : "var(--color-grey-700)"};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
`;

export const DebtCard = styled.div`
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-brand-300);
  }
`;

export const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.8rem;
  border-bottom: 1px dashed var(--color-border);
  background: var(--color-bg-surface);
  transition: background 0.2s;
  &:hover {
    background: var(--color-bg-surface-secondary);
    .arrow-icon {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

export const Avatar = styled.div<{ $color: string }>`
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) =>
    `color-mix(in srgb, ${props.$color}, transparent 90%)`};
  color: ${(props) => props.$color};
  flex-shrink: 0;
  font-size: 1rem;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }
`;

export const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

export const Name = styled.h3`
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
`;

export const RoleLabel = styled.span`
  font-size: 0.65rem;
  color: var(--color-text-secondary);
  font-weight: 500;
`;

export const ArrowIconWrapper = styled.div`
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.2s ease;
  color: var(--color-text-tertiary);
`;

export const CardBody = styled.div`
  padding: 0.75rem 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background: var(--color-bg-surface);
`;

export const AmountBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const AmountRow = styled.div<{ $color: string }>`
  font-size: 0.9rem;
  font-family: "JetBrains Mono", monospace;
  font-weight: 700;
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1px 0;
  border-bottom: 1px solid transparent;
  &:not(:last-child) {
    border-bottom-color: var(--color-border);
  }
`;

export const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-top: auto;
`;

export const SectionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;
