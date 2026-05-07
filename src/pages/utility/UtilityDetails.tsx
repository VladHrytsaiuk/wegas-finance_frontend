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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const { remove } = useUtilityMeters();

  const [activeReading, setActiveReading] = useState<any>(null);

  if (state.isLoading) return <Spinner />;
  if (!data.meter) return <div>{t("stats_utility:utility.not_found")}</div>;

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
        toast.error(t("stats_utility:utility.error_tx_create"));
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

      toast.success(t("stats_utility:utility.success_pay_all"));
      // Тут можна винести ці інвалідації в окремий метод хука, але поки залишимо так
      queryClient.invalidateQueries({ queryKey: ["utilityReadings"] });
      queryClient.invalidateQueries({ queryKey: ["utilityMeters"] });
      queryClient.invalidateQueries({ queryKey: ["counterparties"] });
      close();
    } catch (error) {
      console.error(error);
      toast.error(t("stats_utility:utility.error_status_update"));
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
          {t("stats_utility:utility.back_to_list")}
        </S.BackButton>

        <S.Header>
          <S.TitleBlock>
            <h1>{meter.name}</h1>
            <S.SubTitle>
              <span>
                {meter.type} •{" "}
                {meter.asset?.name || t("stats_utility:utility.no_asset")}
                {meter.counterparty ? ` • ${meter.counterparty.name}` : ""}
              </span>
              {meter.personal_account && (
                <span className="account">
                  {t("stats_utility:utility.personal_account_label")}:{" "}
                  {meter.personal_account}
                </span>
              )}
            </S.SubTitle>
          </S.TitleBlock>

          <S.ActionsColumn>
            <S.ActionRow>
              <S.IconButton
                onClick={() => navigate("analytics")}
                title={t("stats_utility:utility.tooltip_analytics")}
              >
                <HiChartBar />
              </S.IconButton>
              <S.IconButton
                onClick={() => open("edit-meter")}
                title={t("stats_utility:utility.tooltip_edit")}
              >
                <HiPencil />
              </S.IconButton>
              <S.IconButton
                className="danger"
                onClick={() => open("delete-meter")}
                title={t("stats_utility:utility.tooltip_delete")}
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
                  {t("stats_utility:utility.btn_pay_debt", {
                    amount: formatMoney(totalDebt, meter.currency),
                  })}
                </Button>
              )}

              <Button
                variation="primary"
                icon={<HiCalendar />}
                onClick={() => open("add-reading")}
              >
                {t("stats_utility:utility.btn_add_reading")}
              </Button>
            </S.ActionRow>
          </S.ActionsColumn>
        </S.Header>

        <S.StatsGrid>
          <S.StatCard>
            <h3>{t("stats_utility:utility.current_debt")}</h3>
            <S.StatValue
              $isDebt={totalDebt > 0}
              className={totalDebt === 0 ? "green" : ""}
            >
              {formatMoney(totalDebt, meter.currency)}
            </S.StatValue>
            <S.StatSub>{t("stats_utility:utility.unpaid_desc")}</S.StatSub>
          </S.StatCard>

          <S.StatCard>
            <h3>{t("stats_utility:utility.last_reading")}</h3>
            <S.StatValue>
              {meter.last_reading_value ?? 0} {meter.unit}
            </S.StatValue>
            <S.StatSub>
              {lastReadingDate && lastReadingDate > 0
                ? formatDateSafe(lastReadingDate)
                : t("stats_utility:utility.no_data")}
            </S.StatSub>
          </S.StatCard>

          <S.StatCard>
            <h3>{t("stats_utility:utility.actual_rate")}</h3>
            <S.StatValue>
              {formatMoney(meter.tariff * 100, meter.currency)}
            </S.StatValue>
            <S.StatSub>
              {t("stats_utility:utility.per_unit")} {meter.unit}
            </S.StatSub>
          </S.StatCard>
        </S.StatsGrid>

        <S.TableWrapper>
          <Table>
            <Table.Header>
              <tr>
                <th>{t("stats_utility:utility.table_date")}</th>
                <th>{t("stats_utility:utility.table_reading")}</th>
                <th>{t("stats_utility:utility.table_consumed")}</th>
                <th>{t("stats_utility:utility.table_rate")}</th>
                <th>{t("stats_utility:utility.table_amount")}</th>
                <th>{t("stats_utility:utility.table_status")}</th>
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
                              title={t(
                                "stats_utility:utility.tooltip_view_payment",
                              )}
                            >
                              <HiCheckCircle />{" "}
                              {t("stats_utility:utility.status_paid")}{" "}
                              <HiArrowTopRightOnSquare size={14} />
                            </S.TransactionLink>
                          ) : (
                            <>
                              <HiCheckCircle />{" "}
                              {t("stats_utility:utility.status_paid")}
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
                              <HiExclamationCircle />{" "}
                              {t("stats_utility:utility.btn_pay")}
                            </S.PayButton>

                            {accrualTxId && (
                              <S.SecondaryTransactionLink
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/transactions/${accrualTxId}`);
                                }}
                                title={t(
                                  "stats_utility:utility.tooltip_view_accrual",
                                )}
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
              <h3>{t("stats_utility:utility.delete_error_title")}</h3>
              <p>
                {t("stats_utility:utility.delete_error_desc", {
                  amount: formatMoney(totalDebt, meter.currency),
                })}
              </p>
              <Button
                variation="secondary"
                onClick={close}
                style={{ marginTop: "1rem" }}
              >
                {t("stats_utility:utility.btn_understand")}
              </Button>
            </S.DeleteWarningContainer>
          ) : (
            <ConfirmDelete
              resourceName={`${t("stats_utility:utility.resource_name")} "${meter.name}"`}
              onConfirm={handleDeleteMeter}
            />
          )}
        </Modal.Window>

        <Modal.Window name="add-reading">
          <AddReadingForm meter={meter} onCloseModal={close} />
        </Modal.Window>

        <Modal.Window name="delete-reading">
          <ConfirmDelete
            resourceName={t("stats_utility:utility.resource_reading")}
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
            note: t("stats_utility:utility.payment_reading_note", {
              name: meter.name,
              value: activeReading.value,
            }),
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
            note: t("stats_utility:utility.payment_full_note", {
              name: meter.name,
            }),
          }}
          onSuccess={handlePayAllSuccess}
        />
      )}
    </>
  );
}
