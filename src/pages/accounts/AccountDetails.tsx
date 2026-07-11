import { lazy, Suspense, useEffect } from "react";
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
  HiPlus,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import Modal from "../../components/ui/Modal";
import {
  AccountDetailsSkeleton,
  ExportPageSkeleton,
} from "../../components/ui/Skeleton/LoadingSkeletons";
import { AccountCard } from "../../components/accounts/AccountCard";
import { AccountActions } from "../../components/accounts/AccountActions";
import TransactionsModal from "../../components/transactions/TransactionsModal";
import { RecentTransactions } from "../../components/accounts/RecentTransactions";
import { AccountStats } from "../../components/accounts/AccountStats";
import ConfirmDelete from "../../components/ui/ConfirmDelete";

import { useAccountDetails } from "../../hooks/Accounts/useAccountDetails";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useHeader } from "../../context/HeaderContext";
import { formatMoney } from "../../utils/helpers";
import * as S from "./AccountDetails.styles";
import { Button } from "../../components/ui/Button";
import { useIsMobile } from "../../hooks/useIsMobile";
import MobilePageHeader from "../../components/mobile/MobilePageHeader";
import { FAB } from "../../components/ui/FAB";
import { HiMinus, HiArrowsRightLeft } from "react-icons/hi2";

const ExportModal = lazy(() => import("../settings/ExportPage"));

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

  const isMobile = useIsMobile();
  usePageTitle(account?.name);

  useEffect(() => {
    if (account)
      setPageTitle(account.name, t("accounts:accountDetailsPage.subtitle"));
    return () => resetPageTitle();
  }, [account, setPageTitle, resetPageTitle, t]);

  if (isLoading)
    return <AccountDetailsSkeleton />;

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
            {t("accounts:accountDetailsPage.error_title", "Рахунок не знайдено")}
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
              {t(
                "accounts:accountDetailsPage.back_to_list",
                "До списку рахунків",
              )}
            </Button>
            <Button onClick={() => window.location.reload()}>
              {t("common:common.retry", "Оновити")}
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
      <S.PageContainer style={{ paddingBottom: isMobile ? "80px" : undefined }}>
        {isMobile && account ? (
          <MobilePageHeader title={account.name} />
        ) : (
          <S.TopNav>
            <S.BackButton onClick={() => navigate(-1)}>
              <HiArrowLeft size={20} />
            </S.BackButton>
            <div style={{ flex: 1 }} />

            <Modal.Open opens="export-account">
              <S.ActionButton title={t("export_import:exportPage.title")}>
                <HiArrowDownTray size={18} />{" "}
                <span>{t("export_import:exportPage.title")}</span>
              </S.ActionButton>
            </Modal.Open>

            <Link
              to={`/accounts/${accountId}/edit`}
              state={{ background: location }}
              style={{ textDecoration: "none" }}
            >
              <S.ActionButton title={t("accounts:accountDetailsPage.edit_button")}>
                <HiOutlinePencil />{" "}
                <span>{t("accounts:accountDetailsPage.edit_button")}</span>
              </S.ActionButton>
            </Link>

            <Modal.Open opens="delete-account">
              <S.ActionButton $variant="danger" title={t("common:common.delete")}>
                <HiTrash size={18} /> <span>{t("common:common.delete")}</span>
              </S.ActionButton>
            </Modal.Open>
          </S.TopNav>
        )}

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
                      {t(
                        "goals_debts:goals.linked_goal_label",
                        "Прив'язана ціль",
                      )}
                    </span>
                  </S.GoalFooter>
                </S.GoalWidget>
              </S.GoalWidgetLink>
            ) : (
              (account.type === "piggy_bank" || account.type === "savings") &&
              account.storage_type && (
                <S.InfoCard>
                  <S.InfoLabel>
                    {t(
                      "accounts:accountDetailsPage.storage_type_label",
                      "Тип сховища",
                    )}
                  </S.InfoLabel>
                  <S.InfoValue>
                    {getStorageIcon(account.storage_type.slug)}
                    {account.storage_type.name}
                  </S.InfoValue>
                </S.InfoCard>
              )
            )}

            {!isMobile && (
              <AccountActions
                onAction={handleOpenTransaction}
                account={account}
              />
            )}
          </S.LeftColumn>

          <S.RightColumn>
            <S.SectionBox>
              <S.SectionHeader>
                <h2>
                  {t("accounts:accountDetailsPage.history_section_title")}
                </h2>
                <Modal.Open opens="history-all">
                  <S.TextButton>
                    {t("accounts:accountDetailsPage.history_all_button")}{" "}
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
            title={t("accounts:accountStats.income_history_title")}
          />
        </Modal.Window>
        <Modal.Window name="history-expense">
          <TransactionsModal
            accountId={accountId}
            initialFilters={{ type: ["expense"] }}
            title={t("accounts:accountStats.expense_history_title")}
          />
        </Modal.Window>
        <Modal.Window name="history-all">
          <TransactionsModal accountId={accountId} />
        </Modal.Window>
        <Modal.Window name="export-account">
          <Suspense fallback={<ExportPageSkeleton />}>
            <ExportModal initialAccountIds={[accountId!]} />
          </Suspense>
        </Modal.Window>
        <Modal.Window name="delete-account">
          <ConfirmDelete
            resourceName={account.name}
            onConfirm={() => deleteAccount(account.id)}
            disabled={isDeleting}
          />
        </Modal.Window>
      </S.PageContainer>

      {isMobile && (
        <FAB 
          actions={[
            {
              icon: <HiPlus />,
              label: t("transactions:transactions.income"),
              onClick: () => handleOpenTransaction("income")
            },
            {
              icon: <HiMinus />,
              label: t("transactions:transactions.expense"),
              onClick: () => handleOpenTransaction("expense")
            },
            {
              icon: <HiArrowsRightLeft />,
              label: t("transactions:transactions.transfer"),
              onClick: () => handleOpenTransaction("transfer")
            }
          ]}
        />
      )}
    </Modal>
  );
}

export default AccountDetails;
