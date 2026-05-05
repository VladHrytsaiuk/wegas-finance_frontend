import { useState } from "react";
import { format, isValid } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  HiArrowLeft,
  HiCalendar,
  HiTrash,
  HiCheckCircle,
  HiExclamationCircle,
  HiArrowTopRightOnSquare,
  HiBanknotes,
  HiChartBar,
  HiPencil,
} from "react-icons/hi2";

// Components
import { Button } from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Modal, { useModal } from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import AddReadingForm from "../../components/utility/AddReadingModal";
import CreateTransactionModal from "../../components/transactions/CreateTransactionModal";
import CreateMeterForm from "../../components/utility/CreateMeterModal";
import { useUtilityMeters } from "../../hooks/Utility/useUtility";

// Hook & Styles
import { useUtilityDetails } from "../../hooks/Utility/useUtilityDetails";
import { formatMoney } from "../../utils/helpers";
import * as S from "./UtilityDetails.styles";
import { patchUtilityReading } from "../../services/apiUtility";

export default function UtilityDetails() {
  return (
    <Modal>
      <UtilityDetailsContent />
    </Modal>
  );
}

function UtilityDetailsContent() {
  const { data, state, actions } = useUtilityDetails();
  const { open, close, openName } = useModal();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { remove } = useUtilityMeters();

  const [activeReading, setActiveReading] = useState<any>(null);

  if (state.isLoading) return <Spinner />;
  if (!data.meter) return <div>Лічильник не знайдено</div>;

  const { meter, readings, totalDebt, lastReadingDate } = data;

  const formatDateSafe = (date: any) => {
    if (!date) return "—";
    const d = new Date(date);
    return isValid(d) ? format(d, "dd.MM.yyyy") : "—";
  };

  const handlePayAllSuccess = async (response: any) => {
    try {
      const txId =
        response?.id ||
        response?.data?.id ||
        (typeof response === "string" ? response : null);

      if (!txId) {
        toast.error("Помилка при створенні транзакції");
        return;
      }

      const unpaidReadings = readings.filter((r) => !r.is_paid);

      await Promise.all(
        unpaidReadings.map((r) =>
          patchUtilityReading(r.id, {
            is_paid: true,
            payment_transaction_id: txId,
          }),
        ),
      );

      toast.success("Весь борг успішно погашено!");
      // Тут можна винести ці інвалідації в окремий метод хука, але поки залишимо так
      queryClient.invalidateQueries({ queryKey: ["utilityReadings"] });
      queryClient.invalidateQueries({ queryKey: ["utilityMeters"] });
      queryClient.invalidateQueries({ queryKey: ["counterparties"] });
      close();
    } catch (error) {
      console.error(error);
      toast.error("Сталася помилка при оновленні статусів");
    }
  };

  const handleDeleteMeter = () => {
    remove(meter.id, {
      onSuccess: () => navigate("/utility"),
    });
  };

  return (
    <>
      <S.PageContainer>
        <S.BackButton onClick={actions.handleBack}>
          <HiArrowLeft />
          Назад до списку
        </S.BackButton>

        <S.Header>
          <S.TitleBlock>
            <h1>{meter.name}</h1>
            <S.SubTitle>
              <span>
                {meter.type} • {meter.asset?.name || "Без об'єкту"}
                {meter.counterparty ? ` • ${meter.counterparty.name}` : ""}
              </span>
              {meter.personal_account && (
                <span className="account">О/Р: {meter.personal_account}</span>
              )}
            </S.SubTitle>
          </S.TitleBlock>

          <S.ActionsColumn>
            <S.ActionRow>
              <S.IconButton
                onClick={() => navigate("analytics")}
                title="Аналітика витрат"
              >
                <HiChartBar />
              </S.IconButton>
              <S.IconButton
                onClick={() => open("edit-meter")}
                title="Редагувати"
              >
                <HiPencil />
              </S.IconButton>
              <S.IconButton
                className="danger"
                onClick={() => open("delete-meter")}
                title="Видалити"
              >
                <HiTrash />
              </S.IconButton>
            </S.ActionRow>

            <S.ActionRow>
              {totalDebt > 0 && (
                <Button
                  variation="danger"
                  icon={<HiBanknotes />}
                  onClick={() => open("pay-all")}
                >
                  Оплатити борг ({formatMoney(totalDebt, meter.currency)})
                </Button>
              )}

              <Button
                variation="primary"
                icon={<HiCalendar />}
                onClick={() => open("add-reading")}
              >
                Внести показник
              </Button>
            </S.ActionRow>
          </S.ActionsColumn>
        </S.Header>

        <S.StatsGrid>
          <S.StatCard>
            <h3>Поточний борг</h3>
            <S.StatValue
              $isDebt={totalDebt > 0}
              className={totalDebt === 0 ? "green" : ""}
            >
              {formatMoney(totalDebt, meter.currency)}
            </S.StatValue>
            <S.StatSub>За неоплачені показники</S.StatSub>
          </S.StatCard>

          <S.StatCard>
            <h3>Останній показник</h3>
            <S.StatValue>
              {meter.last_reading_value ?? 0} {meter.unit}
            </S.StatValue>
            <S.StatSub>
              {lastReadingDate && lastReadingDate > 0
                ? formatDateSafe(lastReadingDate)
                : "Дані відсутні"}
            </S.StatSub>
          </S.StatCard>

          <S.StatCard>
            <h3>Актуальний Тариф</h3>
            <S.StatValue>
              {formatMoney(meter.tariff * 100, meter.currency)}
            </S.StatValue>
            <S.StatSub>за 1 {meter.unit}</S.StatSub>
          </S.StatCard>
        </S.StatsGrid>

        <S.TableWrapper>
          <Table>
            <Table.Header>
              <tr>
                <th>Дата</th>
                <th>Показник</th>
                <th>Спожито</th>
                <th>Тариф</th>
                <th>Сума</th>
                <th>Статус</th>
                {/* Використовуємо Styled Component замість inline */}
                <S.ActionHeader></S.ActionHeader>
              </tr>
            </Table.Header>
            <Table.Body>
              {readings.map((r) => {
                const paymentTxId =
                  r.payment_transaction_id ||
                  (r.is_paid ? r.transaction_id : null);
                const accrualTxId = r.transaction_id;

                return (
                  <Table.Row key={r.id}>
                    <Table.Cell>
                      <S.DateCell>{formatDateSafe(r.date)}</S.DateCell>
                    </Table.Cell>

                    <Table.Cell>
                      <S.ValueCell>
                        <strong>{r.value}</strong> <span>{meter.unit}</span>
                      </S.ValueCell>
                    </Table.Cell>

                    <Table.Cell>
                      <S.DiffValue $positive={r.diff > 0}>
                        {r.diff > 0 ? `+${Number(r.diff).toFixed(2)}` : r.diff}
                      </S.DiffValue>
                    </Table.Cell>

                    <Table.Cell>
                      <S.ValueCell>
                        {formatMoney(
                          (r.tariff_at_date || meter.tariff) * 100,
                          meter.currency,
                        )}
                      </S.ValueCell>
                    </Table.Cell>

                    <Table.Cell>
                      <S.CostCell>
                        {formatMoney(r.calculated_cost, meter.currency)}
                      </S.CostCell>
                    </Table.Cell>

                    <Table.Cell>
                      <S.StatusBadge $paid={r.is_paid}>
                        {r.is_paid ? (
                          paymentTxId ? (
                            <S.TransactionLink
                              onClick={() =>
                                navigate(`/transactions/${paymentTxId}`)
                              }
                              title="Відкрити транзакцію оплати"
                            >
                              <HiCheckCircle /> Оплачено{" "}
                              <HiArrowTopRightOnSquare size={14} />
                            </S.TransactionLink>
                          ) : (
                            <>
                              <HiCheckCircle /> Оплачено
                            </>
                          )
                        ) : (
                          <S.ActionGroup>
                            <S.PayButton
                              onClick={() => {
                                setActiveReading(r);
                                open("pay-reading");
                              }}
                            >
                              <HiExclamationCircle /> Оплатити
                            </S.PayButton>

                            {accrualTxId && (
                              <S.SecondaryTransactionLink
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/transactions/${accrualTxId}`);
                                }}
                                title="Відкрити транзакцію нарахування"
                              >
                                <HiArrowTopRightOnSquare size={14} />
                              </S.SecondaryTransactionLink>
                            )}
                          </S.ActionGroup>
                        )}
                      </S.StatusBadge>
                    </Table.Cell>

                    <Table.Cell>
                      <S.ActionButton
                        onClick={() => {
                          actions.setReadingToDelete(r.id);
                          open("delete-reading");
                        }}
                      >
                        <HiTrash size={18} />
                      </S.ActionButton>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </S.TableWrapper>

        {/* --- MODALS --- */}
        <Modal.Window name="edit-meter">
          <CreateMeterForm meterToEdit={meter} onCloseModal={close} />
        </Modal.Window>

        <Modal.Window name="delete-meter">
          {totalDebt > 0 ? (
            <S.DeleteWarningContainer>
              <S.WarningIcon>🚫</S.WarningIcon>
              <h3>Неможливо видалити</h3>
              <p>
                На цьому лічильнику є непогашений борг (
                {formatMoney(totalDebt, meter.currency)}).
                <br />
                Спочатку оплатіть його або видаліть показники.
              </p>
              <Button
                variation="secondary"
                onClick={close}
                style={{ marginTop: "1rem" }}
              >
                Зрозуміло
              </Button>
            </S.DeleteWarningContainer>
          ) : (
            <ConfirmDelete
              resourceName={`послугу "${meter.name}"`}
              onConfirm={handleDeleteMeter}
            />
          )}
        </Modal.Window>

        <Modal.Window name="add-reading">
          <AddReadingForm meter={meter} onCloseModal={close} />
        </Modal.Window>

        <Modal.Window name="delete-reading">
          <ConfirmDelete
            resourceName="показник"
            onConfirm={actions.handleDeleteConfirm}
          />
        </Modal.Window>
      </S.PageContainer>

      {/* --- GLOBAL MODALS --- */}
      {openName === "pay-reading" && activeReading && (
        <CreateTransactionModal
          key={`pay-reading-${activeReading.id}`}
          isOpen={true}
          onClose={() => {
            setActiveReading(null);
            close();
          }}
          initialData={{
            type: "debt_repay",
            counterparty_id: meter.counterparty_id,
            amount: activeReading.calculated_cost,
            note: `Оплата ${meter.name}: показник ${activeReading.value}`,
          }}
          onSuccess={async (response) => {
            if (activeReading) {
              const txId =
                response?.id ||
                response?.data?.id ||
                (typeof response === "string" ? response : null);

              await patchUtilityReading(activeReading.id, {
                is_paid: true,
                payment_transaction_id: txId,
              });

              queryClient.invalidateQueries({ queryKey: ["utilityReadings"] });
              queryClient.invalidateQueries({ queryKey: ["utilityMeters"] });
              queryClient.invalidateQueries({ queryKey: ["counterparties"] });
              setActiveReading(null);
              close();
            }
          }}
        />
      )}

      {openName === "pay-all" && (
        <CreateTransactionModal
          key={`pay-all-${meter.id}`}
          isOpen={true}
          onClose={close}
          initialData={{
            type: "debt_repay",
            counterparty_id: meter.counterparty_id,
            amount: totalDebt,
            note: `Повна оплата заборгованості: ${meter.name}`,
          }}
          onSuccess={handlePayAllSuccess}
        />
      )}
    </>
  );
}
