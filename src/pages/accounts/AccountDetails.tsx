import { useEffect } from "react";
import {
  HiArrowLeft,
  HiOutlinePencil,
  HiChevronRight,
  HiArrowDownTray,
  HiTrash,
  HiArchiveBox,
  HiLockClosed,
  HiEnvelope,
  HiBeaker,
  HiCheckBadge,
  HiExclamationCircle,
  HiChevronLeft,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import { AccountCard } from "../../components/accounts/AccountCard";
import { AccountActions } from "../../components/accounts/AccountActions";
import TransactionsModal from "../../components/transactions/TransactionsModal";
import { RecentTransactions } from "../../components/accounts/RecentTransactions";
import { AccountStats } from "../../components/accounts/AccountStats";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import ExportModal from "../settings/ExportPage";

import { useAccountDetails } from "../../hooks/Accounts/useAccountDetails";
import { useHeader } from "../../context/HeaderContext";
import { formatMoney } from "../../utils/helpers";
import * as S from "./AccountDetails.styles";
import { Button } from "../../components/ui/Button";

function AccountDetails() {
  const { t } = useTranslation();
  const { setPageTitle, resetPageTitle } = useHeader();
  const location = useLocation();

  const {
    account,
    linkedGoal,
    accountId,
    categories,
    recentTransactions,
    monthlyStats,
    skin,
    isLoading,
    isError,
    txLoading,
    deleteAccount,
    isDeleting,
    navigate,
  } = useAccountDetails();

  useEffect(() => {
    if (account) setPageTitle(account.name, t("accountDetailsPage.subtitle"));
    return () => resetPageTitle();
  }, [account, setPageTitle, resetPageTitle, t]);

  if (isLoading) {
    return (
      <S.PageContainer>
        <S.LoadingContainer>
          <Spinner />
          <p
            style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}
          >
            {t(
              "accountDetailsPage.loading_details",
              "Завантаження деталей рахунку...",
            )}
          </p>
        </S.LoadingContainer>
      </S.PageContainer>
    );
  }

  if (isError || !account) {
    return (
      <S.PageContainer>
        <S.TopNav>
          <S.BackButton onClick={() => navigate("/accounts")}>
            <HiArrowLeft size={20} />
          </S.BackButton>
        </S.TopNav>
        <S.ErrorContainer>
          <S.ErrorIconBox>
            <HiExclamationCircle />
          </S.ErrorIconBox>
          <S.ErrorTitle>
            {t("accountDetailsPage.error_title", "Рахунок не знайдено")}
          </S.ErrorTitle>
          <S.ErrorDescription>
            {t(
              "accountDetailsPage.error_description",
              "Схоже, цей рахунок було видалено...",
            )}
          </S.ErrorDescription>
          <S.ErrorActions>
            <Button
              variation="secondary"
              onClick={() => navigate("/accounts")}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <HiChevronLeft />{" "}
              {t("accountDetailsPage.back_to_list", "До списку рахунків")}
            </Button>
            <Button onClick={() => window.location.reload()}>
              {t("common.retry", "Оновити")}
            </Button>
          </S.ErrorActions>
        </S.ErrorContainer>
      </S.PageContainer>
    );
  }

  const handleOpenTransaction = (type: "income" | "expense" | "transfer") => {
    navigate(`/transactions/new?type=${type}&accountId=${accountId}`, {
      state: { background: location },
    });
  };

  const getStorageIcon = (slug: string) => {
    switch (slug) {
      case "envelope":
        return <HiEnvelope />;
      case "safe":
        return <HiLockClosed />;
      case "jar":
        return <HiBeaker />;
      default:
        return <HiArchiveBox />;
    }
  };

  return (
    <Modal>
      <S.PageContainer>
        <S.TopNav>
          <S.BackButton onClick={() => navigate(-1)}>
            <HiArrowLeft size={20} />
          </S.BackButton>
          <div style={{ flex: 1 }} />

          <Modal.Open opens="export-account">
            <S.ActionButton title={t("exportPage.title")}>
              <HiArrowDownTray size={18} /> <span>{t("exportPage.title")}</span>
            </S.ActionButton>
          </Modal.Open>

          <Link
            to={`/accounts/${accountId}/edit`}
            state={{ background: location }}
            style={{ textDecoration: "none" }}
          >
            <S.ActionButton title={t("accountDetailsPage.edit_button")}>
              <HiOutlinePencil />{" "}
              <span>{t("accountDetailsPage.edit_button")}</span>
            </S.ActionButton>
          </Link>

          <Modal.Open opens="delete-account">
            <S.ActionButton $variant="danger" title={t("common.delete")}>
              <HiTrash size={18} /> <span>{t("common.delete")}</span>
            </S.ActionButton>
          </Modal.Open>
        </S.TopNav>

        <S.ContentGrid>
          {/* 🔥 НОВЕ: Статистика тепер має власну Grid Area */}
          <S.StatsArea>
            <AccountStats stats={monthlyStats} currency={account.currency} />
          </S.StatsArea>

          <S.LeftColumn>
            <AccountCard account={account} skin={skin} />

            {linkedGoal ? (
              <S.GoalWidgetLink to="/goals">
                <S.GoalWidget $color={linkedGoal.color || "#10b981"}>
                  <S.GoalHeader>
                    <S.GoalTitle>
                      <HiCheckBadge style={{ color: linkedGoal.color }} />
                      {linkedGoal.name}
                    </S.GoalTitle>
                    <S.GoalAmount>
                      <span>
                        {formatMoney(
                          linkedGoal.current_amount,
                          linkedGoal.currency,
                        )}
                      </span>
                      {" / "}{" "}
                      {formatMoney(
                        linkedGoal.target_amount,
                        linkedGoal.currency,
                      )}
                    </S.GoalAmount>
                  </S.GoalHeader>
                  <S.ProgressBarBg>
                    <S.ProgressBarFill
                      $color={linkedGoal.color || "#10b981"}
                      $width={Math.min(
                        100,
                        (linkedGoal.current_amount / linkedGoal.target_amount) *
                          100,
                      )}
                    />
                  </S.ProgressBarBg>
                  <S.GoalFooter>
                    <span>
                      {t("goals.linked_goal_label", "Прив'язана ціль")}
                    </span>
                  </S.GoalFooter>
                </S.GoalWidget>
              </S.GoalWidgetLink>
            ) : (
              (account.type === "piggy_bank" || account.type === "savings") &&
              account.storage_type && (
                <S.InfoCard>
                  <S.InfoLabel>
                    {t("accountDetailsPage.storage_type_label", "Тип сховища")}
                  </S.InfoLabel>
                  <S.InfoValue>
                    {getStorageIcon(account.storage_type.slug)}
                    {account.storage_type.name}
                  </S.InfoValue>
                </S.InfoCard>
              )
            )}

            <AccountActions
              onAction={handleOpenTransaction}
              account={account}
            />
          </S.LeftColumn>

          <S.RightColumn>
            <S.SectionBox>
              <S.SectionHeader>
                <h2>{t("accountDetailsPage.history_section_title")}</h2>
                <Modal.Open opens="history-all">
                  <S.TextButton>
                    {t("accountDetailsPage.history_all_button")}{" "}
                    <HiChevronRight />
                  </S.TextButton>
                </Modal.Open>
              </S.SectionHeader>
              <RecentTransactions
                transactions={recentTransactions}
                categories={categories}
                currency={account.currency}
                loading={txLoading}
              />
            </S.SectionBox>
          </S.RightColumn>
        </S.ContentGrid>

        <Modal.Window name="history-income">
          <TransactionsModal
            accountId={accountId}
            initialFilters={{ type: ["income"] }}
            title={t("accountStats.income_history_title")}
          />
        </Modal.Window>
        <Modal.Window name="history-expense">
          <TransactionsModal
            accountId={accountId}
            initialFilters={{ type: ["expense"] }}
            title={t("accountStats.expense_history_title")}
          />
        </Modal.Window>
        <Modal.Window name="history-all">
          <TransactionsModal accountId={accountId} />
        </Modal.Window>
        <Modal.Window name="export-account">
          <ExportModal initialAccountIds={[accountId!]} />
        </Modal.Window>
        <Modal.Window name="delete-account">
          <ConfirmDelete
            resourceName={account.name}
            onConfirm={() => deleteAccount(account.id)}
            disabled={isDeleting}
          />
        </Modal.Window>
      </S.PageContainer>
    </Modal>
  );
}

export default AccountDetails;
