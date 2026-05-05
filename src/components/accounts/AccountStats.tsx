import styled from "styled-components";
import { HiArrowTrendingUp, HiArrowTrendingDown } from "react-icons/hi2";
import Modal from "../ui/Modal";
import { formatMoney } from "../../utils/helpers";
import { useTranslation } from "react-i18next";

const StatsRow = styled.div`
  display: flex;
  flex-wrap: wrap; /* 🔥 Дозволяємо переноситись на новий рядок */
  gap: 1.5rem;
  width: 100%;
`;

const ModalWrapper = styled.div`
  /* 🔥 flex-grow: 1 дозволяє картці, яка впала на новий рядок, розтягнутись на 100% ширини */
  flex: 1 1 260px;
  min-width: 220px; /* Захист для дуже вузьких мобільних екранів */
  display: flex;
  flex-direction: column;
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
              {t("accounts:accountStats.income_label")}
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
              {t("accounts:accountStats.expense_label")}
            </StatLabel>
            <strong style={{ color: "var(--color-red-700)" }}>
              -{formatMoney(stats.expense, currency)}
            </strong>
          </StatItem>
        </Modal.Open>
      </ModalWrapper>

      <ModalWrapper>
        <StatItem>
          <StatLabel>{t("accounts:accountStats.turnover_label")}</StatLabel>
          <strong>{formatMoney(stats.totalTurnover, currency)}</strong>
        </StatItem>
      </ModalWrapper>
    </StatsRow>
  );
};
