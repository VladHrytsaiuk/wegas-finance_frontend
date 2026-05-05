import { useState, useEffect } from "react";
import { HiPlus, HiCube, HiChartBar } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next"; // Додав імпорт t, якщо його не було

import { Button } from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";
import Modal, { useModal } from "../../components/ui/Modal";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import CreateTransactionModal from "../../components/transactions/CreateTransactionModal";

import { useUtilityMeters } from "../../hooks/Utility/useUtility";
import { useUtilityFilters } from "../../hooks/Utility/useUtilityFilters";
import { useHeader } from "../../context/HeaderContext"; // Імпорт хедера
import * as S from "./Utility.styles";

import CreateMeterForm from "../../components/utility/CreateMeterModal";
import AddReadingForm from "../../components/utility/AddReadingModal";
import UtilityMeterCard from "../../components/utility/UtilityMeterCard"; // Наш новий компонент

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

  const [activeMeter, setActiveMeter] = useState<any>(null);

  // Встановлення глобального заголовка
  useEffect(() => {
    setPageTitle(
      t("utilityPage.title", "Комунальні послуги"),
      `Додайте свій лічильник`,
    );
    return () => resetPageTitle();
  }, [setPageTitle, resetPageTitle, t, meters.length]);

  if (isLoading) return <Spinner />;

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["utilityMeters"] });
    queryClient.invalidateQueries({ queryKey: ["counterparties"] });
    close();
  };

  const getActiveDebt = () => {
    if (!activeMeter?.counterparty?.balances) return 0;
    const balance = activeMeter.counterparty.balances.find(
      (b: any) => b.currency === activeMeter.currency,
    );
    return balance && balance.balance < 0 ? Math.abs(balance.balance) : 0;
  };

  return (
    <S.PageContainer>
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder={t(
          "utilityPage.search_placeholder",
          "Пошук послуги...",
        )}
        filtersConfig={filtersConfig}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        sortOptions={sortOptions}
        sortValue={sortValue}
        onSortChange={handleSortChange}
        onClearAll={handleClearAll}
      >
        <Button
          variation="secondary"
          icon={<HiChartBar />}
          onClick={() => navigate("analytics")}
        >
          {t("utilityPage.analytics_btn", "Аналітика")}
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
          {t("utilityPage.add_btn", "Додати послугу")}
        </Button>
      </TableToolbar>

      {Object.entries(groupedMeters).map(([groupName, groupMeters]) => (
        <S.GroupSection key={groupName}>
          {groupName !== "Всі" && <S.GroupHeader>{groupName}</S.GroupHeader>}
          <S.Grid>
            {groupMeters.map((meter) => (
              <UtilityMeterCard
                key={meter.id}
                meter={meter}
                onClick={() => navigate(`/utility/${meter.id}`)}
                onEdit={() => {
                  setActiveMeter(meter);
                  open("create-meter");
                }}
                onPay={() => {
                  setActiveMeter(meter);
                  open("pay-utility-debt");
                }}
                onAddReading={() => {
                  setActiveMeter(meter);
                  open("add-reading");
                }}
              />
            ))}
          </S.Grid>
        </S.GroupSection>
      ))}

      {/* EMPTY STATE */}
      {!isLoading && Object.keys(groupedMeters).length === 0 && (
        <S.EmptyState>
          <S.EmptyIconWrapper>
            <HiCube />
          </S.EmptyIconWrapper>
          <div>
            <h3>{t("utilityPage.empty_title", "Послуг не знайдено")}</h3>
            <p>
              {t(
                "utilityPage.empty_desc",
                "Додайте свій перший лічильник або комунальну послугу, щоб почати відстежувати витрати.",
              )}
            </p>
          </div>
        </S.EmptyState>
      )}

      {/* MODALS */}
      <Modal.Window name="create-meter">
        <CreateMeterForm meterToEdit={activeMeter} onCloseModal={close} />
      </Modal.Window>

      <Modal.Window name="add-reading">
        <AddReadingForm meter={activeMeter} onCloseModal={close} />
      </Modal.Window>

      <Modal.Window name="delete-confirm">
        <ConfirmDelete
          resourceName={activeMeter?.name || "послугу"}
          onConfirm={() => remove(activeMeter.id)}
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
            counterparty_id: activeMeter.counterparty_id,
            amount: getActiveDebt(),
            note: `Оплата послуг: ${activeMeter.name}`,
          }}
        />
      )}
    </S.PageContainer>
  );
}
