import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { HiPlus, HiOutlineBolt, HiChartBar } from "react-icons/hi2";
import { EmptyState } from "../../components/ui/EmptyState";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Button } from "../../components/ui/Button";
import { ListPageSkeleton } from "../../components/ui/Skeleton/LoadingSkeletons";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";
import Modal, { useModal } from "../../components/ui/Modal";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import CreateTransactionModal from "../../components/transactions/CreateTransactionModal";

import { useUtilityMeters } from "../../hooks/Utility/useUtility";
import { useUtilityFilters } from "../../hooks/Utility/useUtilityFilters";
import { useHeader } from "../../context/HeaderContext";
import { useIsMobile } from "../../hooks/useIsMobile";
import MobilePageHeader from "../../components/mobile/MobilePageHeader";
import * as S from "./Utility.styles";
import { FAB } from "../../components/ui/FAB";

import CreateMeterForm from "../../components/utility/CreateMeterModal";
import AddReadingForm from "../../components/utility/AddReadingModal";
import UtilityMeterCard from "../../components/utility/UtilityMeterCard";
import type { UtilityMeter } from "../../types";

export default function Utility() {
  return (
    <Modal>
      <UtilityContent />
    </Modal>
  );
}

function UtilityContent() {
  const { meters, isLoading, remove } = useUtilityMeters();
  const { open, close, openName } = useModal();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  usePageTitle(t("navigation:general.utility", "Комунальні"));
  const { setPageTitle, resetPageTitle } = useHeader();

  const {
    searchQuery,
    handleSearchChange,
    filterValues,
    handleFilterChange,
    sortValue,
    handleSortChange,
    handleClearAll,
    filtersConfig,
    sortOptions,
    groupedMeters,
  } = useUtilityFilters(meters);

  const [activeMeter, setActiveMeter] = useState<UtilityMeter | null>(null);

  // Стабілізуємо хендлери для UtilityMeterCard
  // const handleMeterClick = useCallback(
  //   (id: string) => navigate(`/utility/${id}`),
  //   [navigate],
  // );

  const handleMeterEdit = useCallback(
    (meter: UtilityMeter) => {
      setActiveMeter(meter);
      open("create-meter");
    },
    [open],
  );

  const handleMeterPay = useCallback(
    (meter: UtilityMeter) => {
      setActiveMeter(meter);
      open("pay-utility-debt");
    },
    [open],
  );

  const handleMeterAddReading = useCallback(
    (meter: UtilityMeter) => {
      setActiveMeter(meter);
      open("add-reading");
    },
    [open],
  );

  const handleMeterDelete = useCallback(
    (meter: UtilityMeter) => {
      setActiveMeter(meter);
      open("delete-confirm");
    },
    [open],
  );

  // Встановлення глобального заголовка
  useEffect(() => {
    setPageTitle(
      t("stats_utility:utilityPage.title"),
      t("stats_utility:utilityPage.subtitle"),
    );
    return () => resetPageTitle();
  }, [setPageTitle, resetPageTitle, t, meters.length]);

  if (isLoading) return <ListPageSkeleton viewMode="grid" />;

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["utilityMeters"] });
    queryClient.invalidateQueries({ queryKey: ["counterparties"] });
    close();
  };

  const getActiveDebt = () => {
    if (!activeMeter?.counterparty?.balances) return 0;
    const balance = activeMeter.counterparty.balances.find(
      (b) => b.currency === activeMeter.currency,
    );
    return balance && balance.balance < 0 ? Math.abs(balance.balance) : 0;
  };

  return (
    <>
      {isMobile ? (
        <MobilePageHeader
          title={t("stats_utility:utilityPage.title")}
          rightAction={
            <Button
              variation="secondary"
              size="small"
              onClick={() => navigate("analytics")}
              style={{
                width: "42px",
                height: "42px",
                minWidth: "42px",
                borderRadius: "12px",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-sm)",
                background: "var(--color-bg-surface)",
                padding: "0",
              }}
            >
              <HiChartBar
                size={20}
                style={{ color: "var(--color-brand-600)" }}
              />
            </Button>
          }
        />
      ) : null}
      <S.PageContainer>
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder={t("stats_utility:utilityPage.search_placeholder")}
          filtersConfig={filtersConfig}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          sortOptions={sortOptions}
          sortValue={sortValue}
          onSortChange={handleSortChange}
          onClearAll={handleClearAll}
        >
          {!isMobile && (
            <>
              <Button
                variation="secondary"
                icon={<HiChartBar />}
                onClick={() => navigate("analytics")}
              >
                {t("stats_utility:utilityPage.analytics_btn")}
              </Button>
              <Button
                variation="primary"
                size="medium"
                icon={<HiPlus />}
                onClick={() => {
                  setActiveMeter(null);
                  open("create-meter");
                }}
              >
                {t("stats_utility:utilityPage.add_btn")}
              </Button>
            </>
          )}
        </TableToolbar>

        {Object.keys(groupedMeters).length > 0 &&
          Object.entries(groupedMeters).map(([groupName, groupMeters]) => (
            <S.GroupSection key={groupName}>
              {groupName !== t("stats_utility:filters.group_all") && (
                <S.GroupHeader>{groupName}</S.GroupHeader>
              )}
              <S.Grid>
                {groupMeters.map((meter) => (
                  <UtilityMeterCard
                    key={meter.id}
                    meter={meter}
                    onEdit={handleMeterEdit}
                    onDelete={handleMeterDelete}
                    onPay={handleMeterPay}
                    onAddReading={handleMeterAddReading}
                  />
                ))}
              </S.Grid>
            </S.GroupSection>
          ))}

        {/* EMPTY STATE */}
        {!isLoading && Object.keys(groupedMeters).length === 0 && (
          <EmptyState
            icon={<HiOutlineBolt />}
            title={t("stats_utility:utilityPage.empty_title")}
            description={t("stats_utility:utilityPage.empty_desc")}
          />
        )}

        {/* MODALS */}
        <S.ModalWrapper>
          <Modal.Window name="create-meter" mobileBottomSheet>
            <CreateMeterForm meterToEdit={activeMeter} onCloseModal={close} />
          </Modal.Window>

          <Modal.Window name="add-reading">
            <AddReadingForm
              meter={activeMeter as UtilityMeter}
              onCloseModal={close}
            />
          </Modal.Window>

          <Modal.Window name="delete-confirm">
            <ConfirmDelete
              resourceName={
                activeMeter?.name || t("stats_utility:utility.resource_name")
              }
              onConfirm={() => activeMeter && remove(activeMeter.id)}
            />
          </Modal.Window>

          {openName === "pay-utility-debt" && activeMeter && (
            <CreateTransactionModal
              key={activeMeter.id}
              isOpen={true}
              onClose={close}
              onSuccess={handlePaymentSuccess}
              initialData={{
                type: "debt_repay",
                counterparty_id: activeMeter.counterparty_id || "",
                amount: getActiveDebt(),
                note: t("stats_utility:utility.payment_note", {
                  name: activeMeter.name,
                }),
              }}
            />
          )}
        </S.ModalWrapper>

        {isMobile && (
          <FAB
            onClick={() => {
              setActiveMeter(null);
              open("create-meter");
            }}
          />
        )}
      </S.PageContainer>
    </>
  );
}
