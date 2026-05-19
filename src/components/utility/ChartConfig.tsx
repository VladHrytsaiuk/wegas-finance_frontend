import styled, { keyframes } from "styled-components";
import { useTranslation } from "react-i18next";
import { formatMoney } from "../../utils/helpers";

// Кольори (Tailwind palette adaptation)
export const CHART_COLORS = {
  electricity: "#F59E0B", // Amber
  water: "#3B82F6", // Blue
  gas: "#EF4444", // Red
  heating: "#F97316", // Orange
  internet: "#10B981", // Emerald
  rent: "#6366F1", // Indigo
  other: "#8B5CF6", // Violet

  text: "#6B7280", // Grey 500
  grid: "#E5E7EB", // Grey 200
  hoverCursor: "rgba(59, 130, 246, 0.1)", // Світло-блакитний фон при наведенні
};

// Анімація появи
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const TooltipContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--color-grey-100);
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 180px;
  backdrop-filter: blur(8px);
  animation: ${fadeIn} 0.2s ease-out; /* 🔥 Анімація */
  pointer-events: none;

  .header {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--color-grey-800);
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--color-grey-100);
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.85rem;

    .label-group {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--color-grey-600);
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .value {
      font-weight: 600;
      color: var(--color-grey-900);
      font-feature-settings: "tnum"; /* Моноширинні цифри */
    }
  }
`;
export const CustomTooltip = ({
  active,
  payload,
  label,
  currency = "UAH",
}: any) => {
  const { t } = useTranslation();

  // 1. Максимально сувора перевірка
  if (!active || !payload || !Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  // 2. Перевірка, чи є в payload дані, які можна відобразити
  const validEntries = payload.filter(
    (entry) => entry && entry.value !== undefined && entry.value !== null,
  );
  if (validEntries.length === 0) return null;

  return (
    <TooltipContainer>
      <div className="header">
        {label || t("stats_utility:utility.chart_data_header")}
      </div>
      <div className="list">
        {validEntries.map((entry: any, index: number) => (
          <div className="item" key={`${entry.dataKey}-${index}`}>
            <div className="label-group">
              <span
                className="dot"
                style={{ backgroundColor: entry.color || entry.fill || "#ccc" }}
              />
              <span>
                {entry.name || t(`stats_utility:serviceTypes.${entry.dataKey}`)}
              </span>
            </div>
            <div className="value">
              {entry.dataKey === "total_consumption"
                ? `${entry.value}`
                : formatMoney(entry.value * 100, currency)}
            </div>
          </div>
        ))}
      </div>
    </TooltipContainer>
  );
};
