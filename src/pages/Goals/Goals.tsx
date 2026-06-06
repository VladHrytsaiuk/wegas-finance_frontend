import { useCallback, useEffect, useMemo } from "react";
import { HiPlus } from "react-icons/hi2";

// Components
import Spinner from "../../components/ui/Spinner";
import { Button } from "../../components/ui/Button";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";
import CreateGoalModal from "../../components/goals/CreateGoalModal";
import ExtendGoalModal from "../../components/goals/ExtendGoalModal";
import GoalCard from "../../components/goals/GoalCard";
import { SmartIcon } from "../../utils/IconMap";

// Logic & Styles
import { useGoalsPage } from "../../hooks/Goals/useGoalsPage";
import { useGoalsFilter } from "../../hooks/Goals/useGoalsFilter";
import { useHeader } from "../../context/HeaderContext"; // Імпорт хедера
import * as S from "./Goals.styles";
import type { Goal } from "../../types";

function Goals() {
  const {
    state: { goals, isLoading, isCreateModalOpen, editingGoal, extendingGoal },
    handlers: {
      handleCreate,
      handleEdit,
      handleDelete,
      handleToggleStatus,
      handleCloseModal,
      handleExtend,
      updateGoalDate,
    },
    t,
  } = useGoalsPage();

  const {
    searchQuery,
    setSearchQuery,
    filters,
    sortBy,
    setSortBy,
    filteredGoals,
    filtersConfig,
    sortOptions,
    handleFilterChange,
    handleClearAll,
  } = useGoalsFilter(goals);

  const { setPageTitle, resetPageTitle } = useHeader();

  // Стабілізуємо хендлери для GoalCard
  const handleToggleStatusStable = useCallback(
    (goal: Goal) => handleToggleStatus(goal),
    [handleToggleStatus],
  );
  const handleEditStable = useCallback(
    (goal: Goal) => handleEdit(goal),
    [handleEdit],
  );
  const handleDeleteStable = useCallback(
    (id: string) => handleDelete(id),
    [handleDelete],
  );
  const handleExtendStable = useCallback(
    (goal: Goal) => handleExtend(goal),
    [handleExtend],
  );

  // Групуємо хендлери, щоб зручно передати їх у GoalCard
  const cardHandlers = useMemo(
    () => ({
      handleToggleStatus: handleToggleStatusStable,
      handleEdit: handleEditStable,
      handleDelete: handleDeleteStable,
      handleExtend: handleExtendStable,
    }),
    [
      handleToggleStatusStable,
      handleEditStable,
      handleDeleteStable,
      handleExtendStable,
    ],
  );

  // Встановлення глобального заголовка та субтайтлу
  useEffect(() => {
    setPageTitle(
      t("goals_debts:goals.title", "Фінансові цілі"),
      t("goals_debts:goals.subtitle_create", "Створіть власну ціль"),
    );

    return () => resetPageTitle();
  }, [setPageTitle, resetPageTitle, t, goals.length]);

  if (isLoading) return <Spinner />;

  return (
    <S.PageContainer>
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t(
          "goals_debts:goals.search_placeholder",
          "Пошук цілей...",
        )}
        filtersConfig={filtersConfig}
        filterValues={filters}
        onFilterChange={handleFilterChange}
        sortOptions={sortOptions}
        sortValue={sortBy}
        onSortChange={setSortBy}
        onClearAll={handleClearAll}
      >
        <Button
          variation="primary"
          size="medium"
          onClick={handleCreate}
          icon={<HiPlus />}
        >
          {t("goals_debts:goals.button_add")}
        </Button>
      </TableToolbar>

      {filteredGoals.length > 0 ? (
        <S.Grid>
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} t={t} handlers={cardHandlers} />
          ))}
        </S.Grid>
      ) : (
        !isLoading && (
          <S.EmptyState>
            <S.EmptyIconWrapper>
              <SmartIcon iconName="HiFlag" size={32} />
            </S.EmptyIconWrapper>
            <div>
              <h3>
                {searchQuery
                  ? t("common:common.no_results", "Нічого не знайдено")
                  : t("goals_debts:goals.empty_title", "Список цілей порожній")}
              </h3>
              <p>
                {searchQuery
                  ? t(
                      "common:common.try_adjusting_search",
                      "Спробуйте змінити запит",
                    )
                  : t(
                      "goals.empty_desc",
                      "Створіть свою першу фінансову ціль, щоб почати відслідковувати прогрес.",
                    )}
              </p>
            </div>

            {!searchQuery && (
              <Button
                variation="primary"
                onClick={handleCreate}
                icon={<HiPlus />}
              >
                {t("goals_debts:goals.button_create_first")}
              </Button>
            )}
          </S.EmptyState>
        )
      )}

      {/* MODALS */}
      {isCreateModalOpen && (
        <CreateGoalModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          editingGoal={editingGoal}
        />
      )}

      <ExtendGoalModal
        isOpen={!!extendingGoal}
        onClose={() => handleExtend(null as unknown as Goal)}
        currentDeadline={extendingGoal?.date_deadline || null}
        onConfirm={(date) => {
          if (extendingGoal) {
            updateGoalDate(extendingGoal.id, date);
          }
        }}
      />
    </S.PageContainer>
  );
}

export default Goals;
