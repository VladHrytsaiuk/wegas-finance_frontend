import {
  HiBolt,
  HiCube,
  HiBuildingOffice,
  HiPencil,
  HiBeaker,
  HiFire,
  HiSun,
  HiHome,
  HiPlus,
} from "react-icons/hi2";
import { Button } from "../ui/Button";
import { formatMoney } from "../../utils/helpers";
import * as S from "../../pages/utility/Utility.styles"; // Переконайся, що шлях правильний

// Перенесли сюди конфіг іконок, бо він потрібен тільки картці
const getTypeConfig = (type: string) => {
  switch (type) {
    case "electricity":
      return { icon: <HiBolt />, color: "#f59e0b" };
    case "water":
      return { icon: <HiBeaker />, color: "#3b82f6" };
    case "gas":
      return { icon: <HiFire />, color: "#ef4444" };
    case "internet":
      return { icon: <HiCube />, color: "#10b981" };
    case "heating":
      return { icon: <HiSun />, color: "#f97316" };
    case "rent":
      return { icon: <HiHome />, color: "#6366f1" };
    default:
      return { icon: <HiBolt />, color: "#6b7280" };
  }
};

interface UtilityMeterCardProps {
  meter: any;
  onClick: () => void;
  onEdit: () => void;
  onPay: () => void;
  onAddReading: () => void;
}

export default function UtilityMeterCard({
  meter,
  onClick,
  onEdit,
  onPay,
  onAddReading,
}: UtilityMeterCardProps) {
  const { icon, color } = getTypeConfig(meter.type);

  const balances = meter.counterparty?.balances || [];
  const mainBalance =
    balances.find((b: any) => b.currency === meter.currency)?.balance || 0;

  const hasDebt = mainBalance < 0;
  const debtAmount = Math.abs(mainBalance);

  return (
    <S.MeterCard onClick={onClick}>
      <S.CardTop>
        <S.IconBadge $color={color}>{icon}</S.IconBadge>
        <S.Actions>
          <S.ActionButton
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <HiPencil size={18} />
          </S.ActionButton>
        </S.Actions>
      </S.CardTop>

      <S.CardContent>
        <S.MeterTitle>{meter.name}</S.MeterTitle>
        <S.MeterSubtitle>
          {meter.counterparty ? (
            <>
              <HiBuildingOffice size={14} /> {meter.counterparty.name}
            </>
          ) : (
            `Рах: ${meter.personal_account || "—"}`
          )}
        </S.MeterSubtitle>

        <S.MainStat>
          <S.StatValue>{meter.last_reading_value ?? "—"}</S.StatValue>
          <S.StatUnit>{meter.unit}</S.StatUnit>
        </S.MainStat>

        {hasDebt && (
          <S.DebtBadge>
            Борг: {formatMoney(debtAmount, meter.currency)}
          </S.DebtBadge>
        )}
      </S.CardContent>

      <S.Divider />

      <S.Footer>
        <div style={{ flex: 1 }}>
          <div className="label">Тариф</div>
          <div className="val">
            {formatMoney(meter.tariff * 100, meter.currency)}
          </div>
        </div>
        <S.FooterActions onClick={(e) => e.stopPropagation()}>
          {hasDebt && (
            <Button variation="secondary" size="small" onClick={onPay}>
              Оплатити
            </Button>
          )}
          <Button
            variation="primary"
            size="small"
            icon={<HiPlus />}
            onClick={onAddReading}
          >
            Внести
          </Button>
        </S.FooterActions>
      </S.Footer>
    </S.MeterCard>
  );
}
