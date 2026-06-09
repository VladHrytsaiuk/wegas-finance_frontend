import { format } from "date-fns";
import { uk, enUS } from "date-fns/locale";
import {
  HiArrowLeft,
  HiPencil,
  HiTrash,
  HiFlag,
  HiChartBar,
  HiCalendarDays,
  HiLink,
  HiArchiveBox,
  HiOutlineFlag,
  HiPhoto,
  HiOutlineChatBubbleLeftEllipsis,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";

// UI Components
import { Button } from "../../components/ui/Button";
import { CenteredSpinner } from "../../components/ui/CenteredSpinner";
import Modal from "../../components/ui/Modal";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import CreateGoalModal from "../../components/goals/CreateGoalModal";
import { GoalImagePanel } from "../../components/goals/GoalImagePanel";
import { SmartIcon } from "../../utils/IconMap";
import { EmptyState } from "../../components/ui/EmptyState";

import { useGoalDetails } from "../../hooks/Goals/useGoalDetails";
import { usePageTitle } from "../../hooks/usePageTitle";
import { formatMoney } from "../../utils/helpers";
import * as S from "./GoalDetails.styles";

function GoalDetails() {
  const { state, actions, t, i18n } = useGoalDetails();
  const { goal, stats, isLoading, isEditModalOpen, isToggling } = state;

  usePageTitle(goal?.name);

  const currentLocale = i18n.language === "uk" ? uk : enUS;

  if (isLoading) return <CenteredSpinner />;

  if (!goal || !stats) {
    return (
      <S.PageContainer>
        <S.HeaderSection>
          <S.BackButton onClick={actions.handleBack}>
            <HiArrowLeft size={18} /> {t("common:common.return")}
          </S.BackButton>
        </S.HeaderSection>
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <h2>{t("goals_debts:goalDetails.not_found")}</h2>
        </div>
      </S.PageContainer>
    );
  }

  const {
    percent,
    daysRemaining,
    avgDailyIncomeNeeded,
    forecastDate,
    forecastStatus,
  } = stats;

  return (
    <S.PageContainer>
      <Modal>
        {/* ХЕДЕР */}
        <S.HeaderSection>
          <S.HeaderLeft>
            <S.BackButton onClick={actions.handleBack}>
              <HiArrowLeft size={18} /> {t("common:common.return")}
            </S.BackButton>
            <S.GoalTitleBlock>
              <S.IconBox $color={goal.color || "var(--color-brand-600)"}>
                <SmartIcon iconName={goal.icon || "HiFlag"} />
              </S.IconBox>
              <div className="title-group">
                <S.StatusBadge $status={goal.status}>
                  {t(`goals_debts:goals.status_${goal.status}`)}
                </S.StatusBadge>
                <h1>{goal.name}</h1>
              </div>
            </S.GoalTitleBlock>
          </S.HeaderLeft>

          <S.HeaderActions>
            <Button
              variation="secondary"
              onClick={actions.handleToggleStatus}
              disabled={isToggling}
            >
              {goal.status === "paused" ? (
                <>
                  <HiChartBar /> {t("goals_debts:goalDetails.btn_resume")}
                </>
              ) : (
                <>
                  <HiChartBar /> {t("goals_debts:goalDetails.btn_pause")}
                </>
              )}
            </Button>

            <Modal.Open opens="edit-goal">
              <Button variation="secondary">
                <HiPencil /> {t("common:common.edit")}
              </Button>
            </Modal.Open>

            <Modal.Open opens="delete-goal">
              <Button variation="danger">
                <HiTrash /> {t("common:common.delete")}
              </Button>
            </Modal.Open>
          </S.HeaderActions>
        </S.HeaderSection>

        {/* ОСНОВНА СІТКА */}
        <S.TopGrid>
          {/* ЛІВА КАРТКА: ФІНАНСОВИЙ СТАН */}
          <S.StyledCard>
            <S.CardHeader>
              <HiChartBar />
              <h3>{t("goals_debts:goalDetails.financial_status")}</h3>
            </S.CardHeader>

            <S.MainValueBlock>
              <span className="label">
                {t("goals_debts:goalDetails.remaining_label")}
              </span>
              <span className="value">
                {formatMoney(
                  goal.target_amount - goal.current_amount,
                  goal.currency,
                )}
              </span>
            </S.MainValueBlock>

            <S.ProgressWrapper>
              <div className="meta">
                <span>{percent}%</span>
                <span>
                  {formatMoney(goal.current_amount, goal.currency)} /{" "}
                  {formatMoney(goal.target_amount, goal.currency)}
                </span>
              </div>
              <S.ProgressBar>
                <S.ProgressFill $width={percent} $color={goal.color} />
              </S.ProgressBar>
            </S.ProgressWrapper>

            <S.MetaDataGrid>
              <S.MetaItem>
                <div className="icon-label">
                  <HiCalendarDays /> {t("goals_debts:goalDetails.meta_deadline")}
                </div>
                <div className="data">
                  {goal.date_deadline
                    ? format(new Date(goal.date_deadline), "d MMMM yyyy", {
                        locale: currentLocale,
                      })
                    : "—"}
                </div>
              </S.MetaItem>
              <S.MetaItem>
                <div className="icon-label">
                  <HiFlag /> {t("goals_debts:goalDetails.meta_days_left")}
                </div>
                <div className="data">
                  {daysRemaining > 0
                    ? t("goals_debts:goalDetails.days_count", {
                        count: daysRemaining,
                      })
                    : t("goals_debts:goalDetails.overdue")}
                </div>
              </S.MetaItem>
            </S.MetaDataGrid>
          </S.StyledCard>

          {/* ПРАВА КАРТКА: ІНФОРМАЦІЯ ТА ДЖЕРЕЛА */}
          <S.StyledCard $noPadding>
            <S.CardHeaderPadded>
              <HiLink />
              <h3>{t("goals_debts:goalDetails.info_and_sources")}</h3>
            </S.CardHeaderPadded>

            <S.ScrollableList>
              {goal.accounts && goal.accounts.length > 0 ? (
                goal.accounts.map((acc: any) => (
                  <S.AccountRowItem
                    key={acc.id}
                    onClick={() => actions.handleAccountClick(acc.id)}
                  >
                    <div className="acc-info">
                      <S.ColorDot $color={acc.color} />
                      <span>{acc.name}</span>
                    </div>
                    <span className="balance">
                      {formatMoney(acc.balance, acc.currency)}
                    </span>
                  </S.AccountRowItem>
                ))
              ) : (
                <EmptyState
                  isFullPage={false}
                  icon={<HiArchiveBox />}
                  title={t("goals_debts:goalDetails.accounts_empty")}
                />
              )}
            </S.ScrollableList>

            {goal.accounts && goal.accounts.length > 0 && (
              <S.CardFooter>
                <span className="label">
                  {t("goals_debts:goalDetails.total_balance", "Всього:")}
                </span>
                <span className="total">
                  {formatMoney(goal.current_amount, goal.currency)}
                </span>
              </S.CardFooter>
            )}
          </S.StyledCard>
        </S.TopGrid>

        {/* НИЖНЯ СІТКА: ПРОГНОЗ ТА ФОТО */}
        <S.BottomGrid>
          {/* ПРОГНОЗ */}
          <S.StyledCard>
            <S.CardHeader>
              <HiOutlineFlag />
              <h3>{t("goals_debts:goalDetails.forecast_title")}</h3>
            </S.CardHeader>

            <S.ForecastContent>
              <div className="main-info">
                <S.ForecastStatus $status={forecastStatus}>
                  {t(`goals_debts:goalDetails.forecast_status_${forecastStatus}`)}
                </S.ForecastStatus>
                <div className="date">
                  {t("goals_debts:goalDetails.forecast_date_label")}{" "}
                  {format(new Date(forecastDate), "d MMMM yyyy", {
                    locale: currentLocale,
                  })}
                </div>
              </div>

              <S.ForecastDetails>
                <div className="item">
                  <span className="label">
                    {t("goals_debts:goalDetails.daily_needed")}
                  </span>
                  <span className="value">
                    {formatMoney(avgDailyIncomeNeeded, goal.currency)}
                  </span>
                </div>
              </S.ForecastDetails>
            </S.ForecastContent>

            {goal.note && (
              <S.MetaSpacer>
                <div className="icon-label">
                  <HiOutlineChatBubbleLeftEllipsis />{" "}
                  {t("goals_debts:goalDetails.meta_note")}
                </div>
                <S.NoteText>{goal.note}</S.NoteText>
              </S.MetaSpacer>
            )}
          </S.StyledCard>

          {/* ФОТО */}
          <S.StyledCard $noPadding>
            <GoalImagePanel
              imageUrl={goal.image_url}
              onUpload={actions.handlePhotoUpload}
              onDelete={actions.handlePhotoDelete}
            />
          </S.StyledCard>
        </S.BottomGrid>

        {/* MODALS */}
        {isEditModalOpen && (
          <CreateGoalModal
            isOpen={true}
            onClose={actions.handleCloseEdit}
            editingGoal={goal}
          />
        )}

        <Modal.Window name="delete-goal">
          <ConfirmDelete
            resourceName={goal.name}
            onConfirm={actions.handleDelete}
          />
        </Modal.Window>
      </Modal>
    </S.PageContainer>
  );
}

export default GoalDetails;
