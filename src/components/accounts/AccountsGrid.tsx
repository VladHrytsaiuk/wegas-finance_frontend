import { useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiPencil, HiTrash } from "react-icons/hi2";

// UI Components
import { useModal } from "../ui/Modal";
import { AccountCard } from "./AccountCard";

// Hooks & Styles
import { useAccountsGrid } from "../../hooks/Accounts/useAccountsGrid";
import * as S from "./AccountsGrid.styles";
import type { Account, User } from "../../types";

interface AccountsGridProps {
  groupedAccounts: Record<string, Account[]>;
  users: User[];
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
  const location = useLocation();
  const { open } = useModal();

  const { processedGroups, getSkin } = useAccountsGrid({
    groupedAccounts,
    users,
  });

  const handleCardClick = useCallback(
    (id: string) => onClick(id),
    [onClick],
  );

  const handleDeleteClick = useCallback(
    (id: string) => {
      onDelete(id);
      open("delete-confirm");
    },
    [onDelete, open],
  );

  return (
    <S.GridContainer>
      {processedGroups.map((group) => (
        <S.GroupSection key={group.name}>
          <S.GroupTitle>{group.name}</S.GroupTitle>

          <S.CardsGrid>
            {group.accounts.map((account) => {
              // 🔥 Знаходимо ім'я власника для кожної картки
              const owner = users.find((u) => u.id === account.user_id);
              const ownerName = owner?.name;

              return (
                <S.CardWrapper key={account.id}>
                  {/* Clickable Card Area */}
                  <div
                    onClick={() => handleCardClick(account.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <AccountCard
                      account={account}
                      skin={getSkin(account)}
                      ownerName={ownerName}
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
                        replace
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
                          handleDeleteClick(account.id);
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
