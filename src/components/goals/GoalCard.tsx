import { memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiPencil,
  HiTrash,
  HiArchiveBox,
  HiCalendar,
  HiPlay,
  HiPause,
  HiClock,
} from "react-icons/hi2";
import { format } from "date-fns";
import { uk, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

import Modal from "../ui/Modal";
import ConfirmDelete from "../ui/ConfirmDelete";
import { SmartIcon } from "../../utils/IconMap";
import { formatMoney } from "../../utils/helpers";
import * as S from "../../pages/Goals/Goals.styles";
import type { Account, Goal } from "../../types";

type GoalCardGoal = Goal & {
  isOverdue?: boolean;
  percentage: number;
  status: Goal["status"] | "done";
  accounts?: Account[];
};

type GoalCardHandlers = {
  handleToggleStatus: (goal: GoalCardGoal) => void;
  handleEdit: (goal: GoalCardGoal) => void;
  handleDelete: (id: string) => void;
  handleExtend: (goal: GoalCardGoal) => void;
};

interface GoalCardProps {
  goal: GoalCardGoal;
  t: TFunction;
  handlers: GoalCardHandlers;
}

export default memo(function GoalCard({ goal, t, handlers }: GoalCardProps) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const target = Number(goal.target_amount) || 0;
  const current = Number(goal.current_amount) || 0;
  const remaining = Math.max(0, target - current);

  const isPaused = goal.status === "paused";
  const isCompleted =
    goal.status === "reached" || (remaining === 0 && target > 0);
  const isFailed = goal.status === "failed";
  const isOverdueVisual = goal.isOverdue || isFailed;

  const currentLocale = i18n.language === "uk" ? uk : enUS;

  return (
    <S.GoalCard $isPaused={isPaused} $status={goal.status}>
      {/* ACTIONS */}
      <S.ActionsWrapper>
        {!isCompleted && !isFailed && (
          <S.ActionBtn
            $variant={isPaused ? "play" : undefined}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlers.handleToggleStatus(goal);
            }}
            title={isPaused ? t("goals_debts:goals.btn_resume") : t("goals_debts:goals.btn_pause")}
          >
            {isPaused ? <HiPlay size={18} /> : <HiPause size={18} />}
          </S.ActionBtn>
        )}
        <S.ActionBtn
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handlers.handleEdit(goal);
          }}
          title={t("common:common.edit")}
        >
          <HiPencil size={18} />
        </S.ActionBtn>

        <Modal>
          <Modal.Open opens={`delete-goal-${goal.id}`}>
            <S.ActionBtn
              $variant="delete"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              title={t("common:common.delete")}
            >
              <HiTrash size={18} />
            </S.ActionBtn>
          </Modal.Open>
          <Modal.Window name={`delete-goal-${goal.id}`}>
            <ConfirmDelete
              resourceName={goal.name}
              onConfirm={() => handlers.handleDelete(goal.id)}
            />
          </Modal.Window>
        </Modal>
      </S.ActionsWrapper>

      {/* CONTENT */}
      <S.CardLink
        onClick={() => navigate(`/goals/${goal.id}`)}
        $isPaused={isPaused}
      >
        <S.CardHeader>
          <S.TitleRow>
            <S.IconWrapper className="goal-icon" $color={goal.color}>
              <SmartIcon
                iconName={goal.icon}
                logo={goal.photo_url}
                color={goal.color}
                size={22}
              />
            </S.IconWrapper>
            <S.Info>
              <S.Title>{goal.name}</S.Title>
              <S.Subtitle>
                {goal.date_deadline ? (
                  <>
                    <HiCalendar size={14} />
                    {format(new Date(goal.date_deadline), "d MMM yyyy", {
                      locale: currentLocale,
                    })}
                  </>
                ) : (
                  t("goals_debts:goals.no_deadline")
                )}
              </S.Subtitle>
            </S.Info>
          </S.TitleRow>
        </S.CardHeader>

        <S.ProgressSection>
          <S.AmountsRow>
            {isPaused ? (
              <S.BigStatusText $mode="paused">
                {t("goals_debts:goals.status_paused", "НА ПАУЗІ")}
              </S.BigStatusText>
            ) : isFailed ? (
              <S.BigStatusText $mode="overdue">
                {t("goals_debts:goals.deadline_passed", "ПРОСТРОЧЕНО")}
              </S.BigStatusText>
            ) : isOverdueVisual && !isCompleted ? (
              <S.BigStatusText $mode="overdue">
                {t("goals_debts:goals.deadline_passed", "Дедлайн минув")}
              </S.BigStatusText>
            ) : isCompleted ? (
              <S.BigStatusText $mode="done">
                {t("goals_debts:goals.completed_text", "ЦІЛЬ ДОСЯГНУТА!")}
              </S.BigStatusText>
            ) : (
              <S.BigStatusText $mode="normal">
                {formatMoney(remaining, goal.currency)}
              </S.BigStatusText>
            )}

            <S.AmountLabel>
              <span>
                {isPaused
                  ? t("goals_debts:goals.label_paused_desc", "Прогрес зупинено")
                  : isFailed || (isOverdueVisual && !isCompleted)
                    ? t("goals_debts:goals.label_overdue_desc", "Час сплив")
                    : isCompleted
                      ? t("goals_debts:goals.label_success", "Вітаємо!")
                      : t("goals_debts:goals.label_left", "Залишилось зібрати")}
              </span>

              {/* КНОПКА ПРОДОВЖИТИ */}
              {(isFailed || (isOverdueVisual && !isCompleted)) && !isPaused && (
                <S.ExtendButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlers.handleExtend(goal);
                  }}
                >
                  <HiClock /> {t("goals_debts:goals.btn_extend", "Продовжити")}
                </S.ExtendButton>
              )}
            </S.AmountLabel>
          </S.AmountsRow>

          <S.ProgressBarBg>
            <S.ProgressBarFill
              $width={goal.percentage}
              $color={
                isPaused
                  ? "var(--color-text-tertiary)"
                  : isFailed
                    ? "var(--color-red-500)"
                    : goal.color
              }
            />
          </S.ProgressBarBg>

          <S.ProgressMetaRow>
            <span
              style={{
                color: isPaused
                  ? "var(--color-text-secondary)"
                  : isFailed
                    ? "var(--color-red-600)"
                    : goal.color,
                fontWeight: 700,
              }}
            >
              {goal.percentage.toFixed(0)}%
            </span>
            <S.CollectedAmount>
              {t("goals_debts:goals.label_collected")}:&nbsp;
              <strong>{formatMoney(current, goal.currency)}</strong>
              <span className="divider">/</span>
              <span>{formatMoney(target, goal.currency)}</span>
            </S.CollectedAmount>
          </S.ProgressMetaRow>
        </S.ProgressSection>

        {/* SOURCES */}
        {goal.accounts && goal.accounts.length > 0 && (
          <S.SourcesSection>
            <S.SourcesLabel>{t("goals_debts:goals.linked_accounts_label")}</S.SourcesLabel>
            <S.SourcesList>
              {goal.accounts.map((acc: Account) => (
                <S.SourceChip
                  key={acc.id}
                  to={`/accounts/${acc.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <HiArchiveBox size={14} />
                  {acc.name}
                </S.SourceChip>
              ))}
            </S.SourcesList>
          </S.SourcesSection>
        )}
      </S.CardLink>
    </S.GoalCard>
  );
});
