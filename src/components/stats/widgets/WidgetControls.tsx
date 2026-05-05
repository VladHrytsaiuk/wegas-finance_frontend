import { createPortal } from "react-dom";
import {
  HiChevronDown,
  HiCalendarDays,
  HiCreditCard,
  HiCheck,
  HiExclamationCircle,
  HiXMark,
  HiChevronLeft,
  HiChevronRight,
  HiArrowPath,
  HiTrash,
  HiAdjustmentsHorizontal,
  HiMagnifyingGlass,
} from "react-icons/hi2";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

// Components
import { AccountTree } from "../../accounts/AccountTree";

// Styles & Logic
import * as S from "./WidgetControls.styles";
import { useWidgetControls } from "../../../hooks/Stats/useWidgetControls";
import { type StatsFilter } from "../../../services/apiStats";

interface Props {
  onFilterChange: (filter: Partial<StatsFilter>) => void;
  currentLabel?: string;
  currentAccountIds?: string[];
  variant?: "global" | "local";
  hasChanges?: boolean;
  currentFrom?: number;
  currentTo?: number;
  hidePeriod?: boolean;
  mini?: boolean;
}

export const WidgetControls = (props: Props) => {
  const {
    state: {
      isOpen,
      isCalendarOpen,
      tempRange,
      searchTerm,
      accounts,
      users,
      dropdownWidth,
      dateLocale,
      style,
    },
    refs: { triggerRef, menuRef },
    handlers: {
      setIsOpen,
      setIsCalendarOpen,
      setTempRange,
      setSearchTerm,
      handlePeriod,
      handleApplyCalendar,
      handleReset,
      getButtonText,
      isActivePeriod,
    },
    t,
  } = useWidgetControls(props);

  return (
    <S.Container ref={triggerRef}>
      {props.mini ? (
        <S.MiniTrigger
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          $active={isOpen}
          $hasChanges={!!props.hasChanges}
        >
          {props.hasChanges ? (
            <HiExclamationCircle />
          ) : (
            <HiAdjustmentsHorizontal />
          )}
        </S.MiniTrigger>
      ) : (
        <S.TriggerButton
          variation={props.variant === "global" ? "primary" : "secondary"}
          size="medium"
          onClick={() => setIsOpen(!isOpen)}
          $active={isOpen}
          $hasChanges={!!props.hasChanges}
        >
          <span className="label">{getButtonText()}</span>
          {props.hasChanges ? (
            <HiExclamationCircle className="warning-icon" />
          ) : (
            <HiChevronDown className="chevron-icon" />
          )}
        </S.TriggerButton>
      )}

      {isOpen &&
        createPortal(
          <S.MegaDropdown
            ref={menuRef}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              top: style.top,
              bottom: style.bottom,
              left: style.left,
              right: style.right,
              width: dropdownWidth,
              transformOrigin: style.transformOrigin,
            }}
          >
            <S.ColumnsWrapper $hidePeriod={props.hidePeriod}>
              {!props.hidePeriod && (
                <>
                  <S.LeftColumn>
                    <S.ScrollArea>
                      <S.SectionTitle>
                        {t("filters.period_label")}
                      </S.SectionTitle>
                      <S.ChipsGrid>
                        <S.MiniChip
                          $active={isActivePeriod(
                            t("filters.periods.this_month")
                          )}
                          onClick={() =>
                            handlePeriod(
                              "this_month",
                              t("filters.periods.this_month")
                            )
                          }
                        >
                          {t("filters.chips.this_month")}
                        </S.MiniChip>
                        <S.MiniChip
                          $active={isActivePeriod(
                            t("filters.periods.last_month")
                          )}
                          onClick={() =>
                            handlePeriod(
                              "last_month",
                              t("filters.periods.last_month")
                            )
                          }
                        >
                          {t("filters.chips.last_month")}
                        </S.MiniChip>
                        <S.MiniChip
                          $active={isActivePeriod(
                            t("filters.periods.this_week")
                          )}
                          onClick={() =>
                            handlePeriod(
                              "this_week",
                              t("filters.periods.this_week")
                            )
                          }
                        >
                          {t("filters.periods.this_week")}
                        </S.MiniChip>
                        <S.MiniChip
                          $active={isActivePeriod(
                            t("filters.periods.last_7_days")
                          )}
                          onClick={() =>
                            handlePeriod(
                              "7_days",
                              t("filters.periods.last_7_days")
                            )
                          }
                        >
                          {t("filters.chips.7_days")}
                        </S.MiniChip>
                      </S.ChipsGrid>
                      <S.Divider />
                      <S.CompactList>
                        <S.MenuItem
                          $active={isActivePeriod(t("filters.periods.today"))}
                          onClick={() =>
                            handlePeriod("today", t("filters.periods.today"))
                          }
                        >
                          <S.IconWrapper>
                            {isActivePeriod(t("filters.periods.today")) ? (
                              <HiCheck className="check" />
                            ) : (
                              <HiCalendarDays />
                            )}
                          </S.IconWrapper>{" "}
                          {t("filters.periods.today")}
                        </S.MenuItem>
                        <S.MenuItem
                          $active={isActivePeriod(
                            t("filters.periods.yesterday")
                          )}
                          onClick={() =>
                            handlePeriod(
                              "yesterday",
                              t("filters.periods.yesterday")
                            )
                          }
                        >
                          <S.IconWrapper>
                            {isActivePeriod(t("filters.periods.yesterday")) ? (
                              <HiCheck className="check" />
                            ) : (
                              <HiCalendarDays />
                            )}
                          </S.IconWrapper>{" "}
                          {t("filters.periods.yesterday")}
                        </S.MenuItem>
                        <S.MenuItem
                          $active={isActivePeriod(
                            t("filters.periods.this_year")
                          )}
                          onClick={() =>
                            handlePeriod(
                              "this_year",
                              t("filters.periods.this_year")
                            )
                          }
                        >
                          <S.IconWrapper>
                            {isActivePeriod(t("filters.periods.this_year")) ? (
                              <HiCheck className="check" />
                            ) : (
                              <HiCalendarDays />
                            )}
                          </S.IconWrapper>{" "}
                          {t("filters.periods.this_year")}
                        </S.MenuItem>
                        <S.MenuItem
                          $active={isActivePeriod(
                            t("filters.periods.all_time")
                          )}
                          onClick={() =>
                            handlePeriod(
                              "all_time",
                              t("filters.periods.all_time")
                            )
                          }
                        >
                          <S.IconWrapper>
                            {isActivePeriod(t("filters.periods.all_time")) ? (
                              <HiCheck className="check" />
                            ) : (
                              <HiArrowPath />
                            )}
                          </S.IconWrapper>{" "}
                          {t("filters.periods.all_time")}
                        </S.MenuItem>
                        <S.MenuItem
                          $highlight
                          onClick={() => handlePeriod("custom", "")}
                        >
                          <S.IconWrapper>
                            <HiCalendarDays />
                          </S.IconWrapper>{" "}
                          {t("filters.custom_range")}
                        </S.MenuItem>
                      </S.CompactList>
                    </S.ScrollArea>
                  </S.LeftColumn>
                  <S.VerticalDivider />
                </>
              )}

              <S.RightColumn>
                <S.RightColumnHeader>
                  <S.SectionTitle>{t("filters.accounts_label")}</S.SectionTitle>
                  <S.SearchContainer>
                    <HiMagnifyingGlass />
                    <S.SearchInput
                      placeholder={t("filters.search_placeholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                    />
                  </S.SearchContainer>

                  <S.MenuItem
                    onClick={() => props.onFilterChange({ accountIds: [] })}
                    $active={props.currentAccountIds?.length === 0}
                    style={{ marginBottom: "8px" }}
                  >
                    <S.IconWrapper>
                      {props.currentAccountIds?.length === 0 ? (
                        <HiCheck className="check" />
                      ) : (
                        <HiCreditCard />
                      )}
                    </S.IconWrapper>{" "}
                    {t("filters.all_accounts")}
                  </S.MenuItem>
                  <S.Divider style={{ margin: "0 0 8px 0" }} />
                </S.RightColumnHeader>

                <S.TreeScrollArea>
                  <AccountTree
                    accounts={accounts}
                    users={users}
                    selectedIds={props.currentAccountIds || []}
                    onSelect={(ids) =>
                      props.onFilterChange({ accountIds: ids })
                    }
                    searchQuery={searchTerm}
                  />
                </S.TreeScrollArea>
              </S.RightColumn>
            </S.ColumnsWrapper>

            <S.DropdownFooter>
              <S.ApplyButton onClick={() => setIsOpen(false)}>
                <HiCheck /> {t("filters.done")}
              </S.ApplyButton>
              <S.ResetButton onClick={handleReset}>
                <HiTrash /> {t("filters.reset")}
              </S.ResetButton>
            </S.DropdownFooter>
          </S.MegaDropdown>,
          document.body
        )}

      {!props.hidePeriod &&
        isCalendarOpen &&
        createPortal(
          <S.Overlay onClick={() => setIsCalendarOpen(false)}>
            <S.CalendarContainer onClick={(e) => e.stopPropagation()}>
              <S.CalendarHeader>
                <h3>{t("filters.select_period_title")}</h3>
                <S.CloseBtn onClick={() => setIsCalendarOpen(false)}>
                  <HiXMark />
                </S.CloseBtn>
              </S.CalendarHeader>
              <S.StyledDayPickerWrapper>
                <DayPicker
                  mode="range"
                  selected={tempRange}
                  onSelect={(range) => setTempRange(range)}
                  locale={dateLocale}
                  weekStartsOn={1}
                  showOutsideDays
                  components={{
                    IconLeft: () => <HiChevronLeft />,
                    IconRight: () => <HiChevronRight />,
                  }}
                />
              </S.StyledDayPickerWrapper>
              <S.CalendarFooter>
                <S.ApplyBtn onClick={handleApplyCalendar}>
                  {t("filters.apply")}
                </S.ApplyBtn>
              </S.CalendarFooter>
            </S.CalendarContainer>
          </S.Overlay>,
          document.body
        )}
    </S.Container>
  );
};
