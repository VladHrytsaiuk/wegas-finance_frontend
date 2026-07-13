import styled from "styled-components";
import {
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiArrowPath,
} from "react-icons/hi2";
import Modal from "../ui/Modal";
import { formatMoney } from "../../utils/helpers";
import { useTranslation } from "react-i18next";

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  width: 100%;

  @media (max-width: 991px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.65rem;
  }
`;

const ModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const DesktopOnly = styled.div`
  min-width: 0;

  @media (max-width: 991px) {
    display: none;
  }
`;

const StatItem = styled.div<{ $clickable?: boolean }>`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 1.25rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  cursor: ${(p) => (p.$clickable ? "pointer" : "default")};
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  height: 100%;
  width: 100%;

  &:hover {
    ${(p) =>
      p.$clickable &&
      `
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    `}
  }

  strong {
    font-size: clamp(1.2rem, 2vw, 1.5rem);
    color: var(--color-text-main);
    display: block;
    line-height: 1.2;
    word-wrap: break-word; /* Великі суми будуть переноситись, а не вилазити */
    white-space: normal;
  }

  @media (max-width: 991px) {
    padding: 0.85rem 0.8rem;
    border-radius: 14px;
    gap: 0.4rem;

    strong {
      font-size: 0.9rem;
      line-height: 1.15;
      word-break: break-word;
    }
  }
`;

const StatLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  white-space: nowrap;

  svg {
    flex-shrink: 0;
  }

  @media (max-width: 991px) {
    font-size: 0.68rem;
    gap: 4px;
    white-space: nowrap;
    line-height: 1.15;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
`;

interface Props {
  stats: { income: number; expense: number; totalTurnover: number };
  currency: string;
}

export const AccountStats = ({ stats, currency }: Props) => {
  const { t } = useTranslation();

  return (
    <StatsRow>
      <ModalWrapper>
        <Modal.Open opens="history-income">
          <StatItem $clickable>
            <StatLabel>
              <HiArrowTrendingUp
                style={{ color: "var(--color-brand-500)" }}
                size={16}
              />
              {t("accounts:accountStats.income_label_short", "Дохід")}
            </StatLabel>
            <strong style={{ color: "var(--color-brand-600)" }}>
              +{formatMoney(stats.income, currency)}
            </strong>
          </StatItem>
        </Modal.Open>
      </ModalWrapper>

      <ModalWrapper>
        <Modal.Open opens="history-expense">
          <StatItem $clickable>
            <StatLabel>
              <HiArrowTrendingDown
                style={{ color: "var(--color-red-700)" }}
                size={16}
              />
              {t("accounts:accountStats.expense_label_short", "Витрати")}
            </StatLabel>
            <strong style={{ color: "var(--color-red-700)" }}>
              -{formatMoney(stats.expense, currency)}
            </strong>
          </StatItem>
        </Modal.Open>
      </ModalWrapper>

      <DesktopOnly>
        <StatItem>
          <StatLabel>
            <HiArrowPath style={{ color: "var(--color-blue-700)" }} size={16} />
            {t("accounts:accountStats.turnover_label")}
          </StatLabel>
          <strong>{formatMoney(stats.totalTurnover, currency)}</strong>
        </StatItem>
      </DesktopOnly>
    </StatsRow>
  );
};
