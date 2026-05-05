import { Link, useLocation } from "react-router-dom";
import { HiPencil, HiTrash } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

// UI Components
import { useModal } from "../ui/Modal";
import { AccountCard } from "./AccountCard";

// Hooks & Styles
import { useAccountsGrid } from "../../hooks/Accounts/useAccountsGrid";
import * as S from "./AccountsGrid.styles";

interface AccountsGridProps {
  groupedAccounts: Record<string, any[]>;
  users: any[];
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
  canManage: boolean;
}

export function AccountsGrid({
  groupedAccounts,
  users,
  onDelete,
  onClick,
  canManage,
}: AccountsGridProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { open } = useModal();

  const { processedGroups, getSkin } = useAccountsGrid({
    groupedAccounts,
    users,
  });

  // Helper для отримання імені
  const currentUserId = localStorage.getItem("user_id");

  return (
    <S.GridContainer>
      {processedGroups.map((group) => (
        <S.GroupSection key={group.name}>
          <S.GroupTitle>{group.name}</S.GroupTitle>

          <S.CardsGrid>
            {group.accounts.map((account) => {
              // 🔥 1. Знаходимо ім'я власника для кожної картки
              // В account зазвичай лежить user_id. Шукаємо його в масиві users.
              // Якщо це поточний юзер - пишемо "Me" (або ім'я), інакше ім'я іншого юзера.
              const owner = users.find((u) => u.id === account.user_id);

              // Якщо user_id картки збігається з поточним - можна не писати ім'я (якщо хочеш),
              // або писати завжди. Тут логіка: беремо ім'я знайденого юзера.
              const ownerName = owner?.name;

              return (
                <S.CardWrapper key={account.id}>
                  {/* Clickable Card Area */}
                  <div
                    onClick={() => onClick(account.id)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* 🔥 2. Передаємо owner_name всередину об'єкта account */}
                    <AccountCard
                      account={{
                        ...account,
                        owner_name: ownerName, // Додаємо ім'я, якого не вистачало
                      }}
                      skin={getSkin(account)}
                    />
                  </div>

                  {/* Hover Actions */}
                  {canManage && (
                    <S.OverlayActions
                      className="card-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <S.ActionButton
                        as={Link}
                        to={`${account.id}/edit`}
                        state={{ background: location }}
                        className="edit"
                      >
                        <HiPencil size={18} />
                      </S.ActionButton>

                      <S.ActionButton
                        className="delete"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDelete(account.id);
                          open("delete-confirm");
                        }}
                      >
                        <HiTrash size={18} />
                      </S.ActionButton>
                    </S.OverlayActions>
                  )}
                </S.CardWrapper>
              );
            })}
          </S.CardsGrid>
        </S.GroupSection>
      ))}
    </S.GridContainer>
  );
}
