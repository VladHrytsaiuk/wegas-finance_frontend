import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { addDays, addMonths, addYears, isValid } from "date-fns";
import { HiCalendar, HiXMark } from "react-icons/hi2";

import { Button } from "../ui/Button";
import { DateRangePicker } from "../ui/DateRangePicker";
import { Overlay } from "../ui/Modal";
import * as S from "./ExtendGoalModal.styles";

interface ExtendGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dateIsoString: string) => void;
  currentDeadline: string | Date | number | null;
}

const getInitialSelectedTimestamp = (
  currentDeadline: string | Date | number | null,
) => {
  const baseDate = currentDeadline ? new Date(currentDeadline) : new Date();
  const validDate = isValid(baseDate) ? baseDate : new Date();
  const isPast = validDate.getTime() < Date.now();
  const initialDate = isPast ? addMonths(new Date(), 1) : validDate;

  return initialDate.getTime();
};

export default function ExtendGoalModal({
  isOpen,
  onClose,
  onConfirm,
  currentDeadline,
}: ExtendGoalModalProps) {
  const { t } = useTranslation();
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);
  const effectiveTimestamp =
    selectedTimestamp ?? getInitialSelectedTimestamp(currentDeadline);

  const handleClose = useCallback(() => {
    setSelectedTimestamp(null);
    onClose();
  }, [onClose]);

  // Закриття на ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleClose, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (effectiveTimestamp) {
      onConfirm(new Date(effectiveTimestamp).toISOString());
      handleClose();
    }
  };

  const handleQuickAdd = (
    type: "days" | "months" | "years",
    amount: number,
  ) => {
    const base = new Date(effectiveTimestamp);
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
    <Overlay onClick={handleClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.CloseBtn onClick={handleClose}>
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
              date={effectiveTimestamp}
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
            <Button type="button" variation="secondary" onClick={handleClose}>
              {t("common:common.cancel")}
            </Button>
            <Button type="submit" variation="primary" icon={<HiCalendar />}>
              {t("common:common.save")}
            </Button>
          </S.Footer>
        </S.Form>
      </S.ModalContent>
    </Overlay>,
    document.body,
  );
}
