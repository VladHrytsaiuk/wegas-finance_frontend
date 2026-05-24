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
  HiLinkSlash,
  HiDocumentText,
  HiPlay,
  HiPause,
  HiClock,
} from "react-icons/hi2";

import * as S from "./GoalDetails.styles";

// UI Components
import { Button } from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import CreateGoalModal from "../../components/goals/CreateGoalModal";
import { GoalImagePanel } from "../../components/goals/GoalImagePanel";
import { SmartIcon } from "../../utils/IconMap";

// Hook & Utils
import { useGoalDetails } from "../../hooks/Goals/useGoalDetails";
import { formatMoney } from "../../utils/helpers";

export default function GoalDetails() {
  const { state, actions, t, i18n } = useGoalDetails();
  const { goal, stats, isLoading, isEditModalOpen, isToggling } = state;

  const currentLocale = i18n.language === "uk" ? uk : enUS;

  if (isLoading) {
    return (
      <S.LoadingContainer>
        <Spinner />
      </S.LoadingContainer>
    );
  }

  if (!goal || !stats) {
    return (
      <S.PageContainer>
        <S.HeaderSection>
          <S.BackButton onClick={actions.handleBack}>
            <HiArrowLeft size={18} />
            <span>{t("common:common.return")}</span>
          </S.BackButton>
        </S.HeaderSection>
        <S.NotFoundContainer>
          <S.NotFoundIcon>
            <HiOutlineFlag />
          </S.NotFoundIcon>
          <h3>{t("goals_debts:goals.not_found_title")}</h3>
          <p>{t("goals_debts:goals.not_found_message")}</p>
          <Button variation="secondary" onClick={actions.handleBack}>
            {t("common:common.return")}
          </Button>
        </S.NotFoundContainer>
      </S.PageContainer>
    );
  }

  const {
    percentage,
    remainingMoney,
    isCompleted,
    canPause,
    isPaused,
    daysLeftText,
    deadlineStatus,
  } = stats;

  return (
    <S.PageContainer>
      <CreateGoalModal
        isOpen={isEditModalOpen}
        onClose={() => actions.setIsEditModalOpen(false)}
        editingGoal={goal}
      />

      <Modal>
        {/* HEADER */}
        <S.HeaderSection>
          <S.HeaderLeft>
            <S.BackButton onClick={actions.handleBack}>
              <HiArrowLeft size={20} />
              <span>{t("common:common.return")}</span>
            </S.BackButton>

            <S.GoalTitleBlock>
              <div className="title-row">
                <S.IconBox $color={goal.color || "var(--color-brand-600)"}>
                  <SmartIcon
                    iconName={goal.icon}
                    logo={goal.photo_url}
                    color={goal.color}
                    size={28}
                  />
                </S.IconBox>

                <h1>{goal.name}</h1>

                <S.StatusBadge $status={goal.status}>
                  {t(`goals_debts:goalDetails.status_${goal.status}`)}
                </S.StatusBadge>
              </div>
            </S.GoalTitleBlock>
          </S.HeaderLeft>

          <S.HeaderActions>
            {canPause &&
              (isPaused ? (
                <S.ResumeButton
                  onClick={actions.handleToggleStatus}
                  disabled={isToggling}
                >
                  <HiPlay /> {t("goals_debts:goals.btn_resume")}
                </S.ResumeButton>
              ) : (
                <Button
                  variation="secondary"
                  onClick={actions.handleToggleStatus}
                  disabled={isToggling}
                >
                  <HiPause /> {t("goals_debts:goals.btn_pause")}
                </Button>
              ))}

            <Button
              variation="secondary"
              onClick={() => actions.setIsEditModalOpen(true)}
            >
              <HiPencil /> {t("common:common.edit")}
            </Button>
            <Modal.Open opens="delete-goal">
              <Button variation="danger">
                <HiTrash /> {t("common:common.delete")}
              </Button>
            </Modal.Open>
          </S.HeaderActions>
        </S.HeaderSection>

        {/* TOP GRID */}
        <S.TopGrid>
          <S.StyledCard>
            <S.CardHeader>
              <HiChartBar size={24} />
              <h3>{t("goals_debts:goalDetails.title_section_finance")}</h3>
            </S.CardHeader>

            <S.MainValueBlock>
              <span className="label">
                {isCompleted
                  ? t("goals_debts:goalDetails.status_reached")
                  : t("goals_debts:goalDetails.label_remaining")}
              </span>
              <span className="value">
                {isCompleted
                  ? formatMoney(goal.current_amount, goal.currency)
                  : formatMoney(remainingMoney, goal.currency)}
              </span>
            </S.MainValueBlock>

            <S.ProgressWrapper>
              <div className="meta">
                <span>{percentage.toFixed(1)}%</span>
                <span>
                  {t("goals_debts:goalDetails.label_collected")}:{" "}
                  {formatMoney(goal.current_amount, goal.currency)}
                </span>
              </div>
              <S.ProgressBar>
                <S.ProgressFill $percent={percentage} $color={goal.color} />
              </S.ProgressBar>
            </S.ProgressWrapper>

            <S.MetaDataGrid>
              <S.MetaItem>
                <div className="icon-label">
                  <HiCalendarDays /> {t("goals_debts:goalDetails.date_start")}
                </div>
                <div className="data">
                  {format(new Date(goal.date_start), "d MMM yyyy", {
                    locale: currentLocale,
                  })}
                </div>
              </S.MetaItem>

              <S.MetaItem>
                <div className="icon-label">
                  <HiClock /> {t("goals_debts:goalDetails.time_left", "Залишилось часу")}
                </div>
                <div className="data">
                  {goal.date_deadline ? (
                    <S.DeadlineValue $status={deadlineStatus}>
                      {daysLeftText}
                    </S.DeadlineValue>
                  ) : (
                    <S.EmptyValue>∞ {t("goals_debts:goals.no_deadline")}</S.EmptyValue>
                  )}
                </div>
                {goal.date_deadline && (
                  <S.DeadlineDate>
                    {t("goals_debts:goalDetails.date_deadline")}:{" "}
                    {format(new Date(goal.date_deadline), "d MMM yyyy", {
                      locale: currentLocale,
                    })}
                  </S.DeadlineDate>
                )}
              </S.MetaItem>
            </S.MetaDataGrid>
          </S.StyledCard>

          <S.StyledCard $noPadding>
            <S.PhotoContainer>
              {stats.fullPhotoUrl ? (
                // Використовуємо новий зум-компонент
                <GoalImagePanel src={stats.fullPhotoUrl} alt={goal.name} />
              ) : (
                <S.PhotoPlaceholder>
                  <HiPhoto size={64} />
                  <span>{t("goals_debts:goalDetails.photo_empty")}</span>
                </S.PhotoPlaceholder>
              )}
            </S.PhotoContainer>
          </S.StyledCard>
        </S.TopGrid>

        {/* BOTTOM GRID */}
        <S.MetricsGrid>
          <S.StyledCard>
            <S.CardHeader>
              <HiOutlineFlag size={24} />
              <h3>{t("goals_debts:goalDetails.title_section_info")}</h3>
            </S.CardHeader>

            <S.MetaItem>
              <div className="icon-label">
                {t("goals_debts:goalDetails.note_description")}
              </div>
              {goal.description ? (
                <div className="data">{goal.description}</div>
              ) : (
                <S.EmptyValue>
                  <HiDocumentText /> {t("goals_debts:goalDetails.note_empty")}
                </S.EmptyValue>
              )}
            </S.MetaItem>

            <S.MetaSpacer>
              <div className="icon-label">
                <HiLink /> {t("goals_debts:goalDetails.link_external")}
              </div>
              {goal.external_link ? (
                <a href={goal.external_link} target="_blank" rel="noreferrer">
                  {t("goals_debts:goalDetails.link_visit")} &rarr;
                </a>
              ) : (
                <S.EmptyValue>
                  <HiLinkSlash />{" "}
                  {t("goals_debts:goalDetails.link_empty", "Посилання відсутнє")}
                </S.EmptyValue>
              )}
            </S.MetaSpacer>
          </S.StyledCard>

          <S.StyledCard $noPadding>
            <S.AccountHeaderWrapper>
              <S.CardHeader>
                <HiArchiveBox size={24} />
                <h3>{t("goals_debts:goalDetails.title_section_accounts")}</h3>
              </S.CardHeader>
            </S.AccountHeaderWrapper>

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
                <S.EmptyStateSmall>
                  {t("goals_debts:goalDetails.accounts_empty")}
                </S.EmptyStateSmall>
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
        </S.MetricsGrid>

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
