import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { addDays, addMonths, addYears, isValid } from "date-fns";
import { HiCalendar, HiXMark } from "react-icons/hi2";

import { Button } from "../ui/Button";
import { DateRangePicker } from "../ui/DateRangePicker";
import * as S from "./ExtendGoalModal.styles";

interface ExtendGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dateIsoString: string) => void;
  currentDeadline: string | Date | number | null;
}

export default function ExtendGoalModal({
  isOpen,
  onClose,
  onConfirm,
  currentDeadline,
}: ExtendGoalModalProps) {
  const { t } = useTranslation();

  // Використовуємо timestamp для сумісності з DateRangePicker
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (isOpen) {
      // 1. Нормалізація вхідної дати
      const baseDate = currentDeadline ? new Date(currentDeadline) : new Date();
      const validDate = isValid(baseDate) ? baseDate : new Date();

      // 2. Логіка: якщо дедлайн прострочено або його немає, пропонуємо +1 місяць від сьогодні
      // Якщо дедлайн активний — пропонуємо його як стартову точку
      const isPast = validDate.getTime() < Date.now();
      const initialDate = isPast ? addMonths(new Date(), 1) : validDate;

      setSelectedTimestamp(initialDate.getTime());
    }
  }, [isOpen, currentDeadline]);

  // Закриття на ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTimestamp) {
      onConfirm(new Date(selectedTimestamp).toISOString());
      onClose();
    }
  };

  const handleQuickAdd = (
    type: "days" | "months" | "years",
    amount: number,
  ) => {
    const base = selectedTimestamp ? new Date(selectedTimestamp) : new Date();
    let newDate = base;

    switch (type) {
      case "days":
        newDate = addDays(base, amount);
        break;
      case "months":
        newDate = addMonths(base, amount);
        break;
      case "years":
        newDate = addYears(base, amount);
        break;
    }

    setSelectedTimestamp(newDate.getTime());
  };

  return createPortal(
    <S.Overlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.CloseBtn onClick={onClose}>
          <HiXMark size={24} />
        </S.CloseBtn>

        <S.Title>{t("goals_debts:goals.extend_title", "Продовжити термін")}</S.Title>
        <S.Description>
          {t("goals_debts:goals.extend_desc", "Вкажіть нову дату завершення.")}
        </S.Description>

        <S.Form onSubmit={handleSubmit}>
          <div>
            <S.Label>{t("goals_debts:goals.label_new_date", "Нова дата")}</S.Label>

            <DateRangePicker
              mode="single"
              date={selectedTimestamp}
              onDateChange={(ts) => setSelectedTimestamp(ts)}
            />

            <S.QuickButtons>
              <S.QuickBtn
                type="button"
                onClick={() => handleQuickAdd("days", 7)}
              >
                +7 днів
              </S.QuickBtn>
              <S.QuickBtn
                type="button"
                onClick={() => handleQuickAdd("months", 1)}
              >
                +1 міс
              </S.QuickBtn>
              <S.QuickBtn
                type="button"
                onClick={() => handleQuickAdd("months", 3)}
              >
                +3 міс
              </S.QuickBtn>
              <S.QuickBtn
                type="button"
                onClick={() => handleQuickAdd("years", 1)}
              >
                +1 рік
              </S.QuickBtn>
            </S.QuickButtons>
          </div>

          <S.Footer>
            <Button type="button" variation="secondary" onClick={onClose}>
              {t("common:common.cancel")}
            </Button>
            <Button type="submit" variation="primary" icon={<HiCalendar />}>
              {t("common:common.save")}
            </Button>
          </S.Footer>
        </S.Form>
      </S.ModalContent>
    </S.Overlay>,
    document.body,
  );
}
