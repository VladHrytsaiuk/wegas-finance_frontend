import { createPortal } from "react-dom";
import { HiClock } from "react-icons/hi2";

import { useTimePicker } from "../../hooks/ui/useTimePicker";
import * as S from "./TimePicker.styles";

interface Props {
  value: string; // формат "HH:mm"
  onChange: (time: string) => void;
}

export const TimePicker = (props: Props) => {
  const { state, refs, actions, t } = useTimePicker(props);
  const { isOpen, hh, mm, hoursList, minutesList, positionStyle } = state;

  return (
    <S.Wrapper ref={refs.triggerRef}>
      <S.SegmentedWrapper onClick={actions.handleWrapperClick}>
        <S.IconButton
          type="button"
          onClick={actions.toggleOpen}
          title={t("transactionForm.label_time")}
        >
          <HiClock size={20} />
        </S.IconButton>

        <div style={{ display: "flex", alignItems: "center" }}>
          <S.SegmentInput
            ref={refs.hourRef}
            value={hh}
            onChange={actions.handleHourChange}
            onKeyDown={(e) => actions.handleKeyDown(e, "hh")}
            onFocus={(e) => e.target.select()}
            placeholder="--"
          />
          <S.Separator>:</S.Separator>
          <S.SegmentInput
            ref={refs.minRef}
            value={mm}
            onChange={actions.handleMinChange}
            onKeyDown={(e) => actions.handleKeyDown(e, "mm")}
            onFocus={(e) => e.target.select()}
            placeholder="--"
          />
        </div>
      </S.SegmentedWrapper>

      {isOpen &&
        createPortal(
          <S.PickerContainer
            ref={refs.menuRef}
            style={{
              top: positionStyle.top,
              bottom: positionStyle.bottom,
              right: positionStyle.right,
              left: positionStyle.left,
              maxHeight: positionStyle.maxHeight,
              transformOrigin: positionStyle.transformOrigin,
            }}
          >
            <S.ColumnsContainer>
              <S.Column>
                <S.ColumnLabel>{t("timePicker.hours_short")}</S.ColumnLabel>
                <S.ScrollArea>
                  {hoursList.map((h) => (
                    <S.TimeItem
                      key={h}
                      $active={parseInt(hh || "-1") === h}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        actions.handleSelect(h, parseInt(mm || "0"));
                      }}
                    >
                      {h.toString().padStart(2, "0")}
                    </S.TimeItem>
                  ))}
                </S.ScrollArea>
              </S.Column>
              <S.Divider>:</S.Divider>
              <S.Column>
                <S.ColumnLabel>{t("timePicker.minutes_short")}</S.ColumnLabel>
                <S.ScrollArea>
                  {minutesList.map((m) => (
                    <S.TimeItem
                      key={m}
                      $active={Math.abs(parseInt(mm || "-1") - m) < 5}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        actions.handleSelect(parseInt(hh || "0"), m);
                      }}
                    >
                      {m.toString().padStart(2, "0")}
                    </S.TimeItem>
                  ))}
                </S.ScrollArea>
              </S.Column>
            </S.ColumnsContainer>
            <S.Footer>
              <S.ApplyBtn
                type="button"
                onClick={() => actions.setIsOpen(false)}
              >
                {t("dashboardPage.save_mode")}
              </S.ApplyBtn>
            </S.Footer>
          </S.PickerContainer>,
          document.body
        )}
    </S.Wrapper>
  );
};
