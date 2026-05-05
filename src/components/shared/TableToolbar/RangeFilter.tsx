import { createPortal } from "react-dom";
import { HiChevronDown } from "react-icons/hi2";

// Shared Styles (з головного файлу styles.ts)
import { FilterButton, PortalMenu } from "./styles";

// Specific Styles
import * as S from "./RangeFilter.styles";

// Logic
import { useRangeFilter } from "../../../hooks/Toolbar/useRangeFilter"; // Або шлях де ти створив хук
import type { FilterConfig } from "./types";

export const RangeFilter = ({
  config,
  value = { min: "", max: "" },
  onChange,
}: {
  config: FilterConfig;
  value: { min: string; max: string };
  onChange: (val: { min: string; max: string }) => void;
}) => {
  const {
    state: { isOpen, localMin, localMax, isActive, label, style },
    refs: { triggerRef, menuRef },
    handlers: { toggleOpen, setLocalMin, setLocalMax, apply, reset },
    t,
  } = useRangeFilter({ config, value, onChange });

  return (
    <S.Container ref={triggerRef}>
      <FilterButton
        $isActive={isActive}
        $isOpen={isOpen}
        onClick={toggleOpen}
        type="button"
      >
        {label} <HiChevronDown className="chevron" />
      </FilterButton>

      {isOpen &&
        createPortal(
          <PortalMenu
            ref={menuRef}
            style={{
              top: style.top,
              bottom: style.bottom,
              left: style.left,
              right: style.right,
              maxHeight: style.maxHeight,
              transformOrigin: style.transformOrigin,
              width: "260px",
            }}
          >
            <S.RangeContainer>
              <S.RangeTitle>{t("filterComponent.range_title")}</S.RangeTitle>

              <S.RangeInputs>
                <S.SmallInput
                  placeholder={t("filterComponent.range_placeholder_min")}
                  type="number"
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  autoFocus
                />
                <S.Separator />
                <S.SmallInput
                  placeholder={t("filterComponent.range_placeholder_max")}
                  type="number"
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                />
              </S.RangeInputs>

              <S.Footer>
                <S.ResetButton onClick={reset}>
                  {t("filterComponent.range_button_reset")}
                </S.ResetButton>
                <S.ApplyButton onClick={apply}>
                  {t("filterComponent.range_button_ok")}
                </S.ApplyButton>
              </S.Footer>
            </S.RangeContainer>
          </PortalMenu>,
          document.body
        )}
    </S.Container>
  );
};
