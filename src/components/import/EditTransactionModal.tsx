import { useState } from "react";
import { HiXMark } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

// Components
import { Button } from "../ui/Button";
import { CategorySelect } from "../categories/CategorySelect";
import CounterpartySelect from "../counterparties/CounterpartySelect";

// Styles & Types
import * as S from "./EditTransactionModal.styles";
import type { ExtendedTransaction } from "./ImportTypes";

interface Props {
  transaction: ExtendedTransaction;
  categories: any[];
  counterparties: any[];
  onSave: (updated: Partial<ExtendedTransaction>) => void;
  onCancel: () => void;
}

export default function EditTransactionModal({
  transaction,
  categories,
  counterparties,
  onSave,
  onCancel,
}: Props) {
  const { t } = useTranslation();

  const [type, setType] = useState<string>(transaction.type);
  const [amount, setAmount] = useState<number>(
    Math.abs(transaction.amount / 100)
  );
  const [desc, setDesc] = useState<string>(transaction.description);

  const [cpId, setCpId] = useState<string>(transaction.counterparty_id || "");
  const [catId, setCatId] = useState<string>(transaction.category_id || "");

  const [cpName, setCpName] = useState<string>(
    transaction.counterparty_name || ""
  );

  const handleSubmit = () => {
    const selectedCp = counterparties.find((c: any) => c.id === cpId);
    const finalCpName = selectedCp ? selectedCp.name : cpName;

    onSave({
      type,
      amount: Math.round(amount * 100) * (type === "expense" ? -1 : 1),
      counterparty_id: cpId,
      counterparty_name: finalCpName,
      category_id: catId,
      description: desc,
    });
  };

  return (
    <S.Overlay onClick={onCancel}>
      <S.Card onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <S.Header>
          <S.Title>{t("transactions:transactionForm.title_edit")}</S.Title>
          <S.CloseButton onClick={onCancel}>
            <HiXMark size={24} />
          </S.CloseButton>
        </S.Header>

        <S.FormContainer>
          {/* TYPE SWITCHER */}
          <S.SwitcherContainer>
            <S.SwitcherButton
              type="button"
              $active={type === "expense"}
              $activeColor="var(--color-red-600)"
              onClick={() => setType("expense")}
            >
              {t("transactions:transactionForm.type_expense")}
            </S.SwitcherButton>
            <S.SwitcherButton
              type="button"
              $active={type === "income"}
              $activeColor="var(--color-brand-600)"
              onClick={() => setType("income")}
            >
              {t("transactions:transactionForm.type_income")}
            </S.SwitcherButton>
            <S.SwitcherButton
              type="button"
              $active={type === "transfer"}
              $activeColor="var(--color-blue-600)"
              onClick={() => setType("transfer")}
            >
              {t("transactions:transactionForm.type_transfer")}
            </S.SwitcherButton>
          </S.SwitcherContainer>

          {/* AMOUNT */}
          <S.FormField>
            <S.Label>{t("transactions:transactionForm.label_amount")}</S.Label>
            <S.Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
            />
          </S.FormField>

          {/* COUNTERPARTY */}
          {type !== "transfer" && (
            <S.FormField>
              <S.Label>{t("transactions:transactionForm.label_counterparty")}</S.Label>
              <CounterpartySelect
                counterparties={counterparties}
                value={cpId}
                onChange={(val) => {
                  setCpId(val);
                  if (val) setCpName("");
                }}
              />

              {!cpId && (
                <S.Input
                  value={cpName}
                  onChange={(e) => setCpName(e.target.value)}
                  placeholder={t(
                    "importModal.placeholder_manual_cp",
                    "Або введіть назву вручну"
                  )}
                  style={{ marginTop: 4 }}
                />
              )}
            </S.FormField>
          )}

          {/* CATEGORY */}
          {type !== "transfer" && (
            <S.FormField>
              <S.Label>{t("transactions:transactionForm.label_category")}</S.Label>
              <CategorySelect
                categories={categories.filter((c: any) => c.type === type)}
                value={catId}
                onChange={setCatId}
              />
            </S.FormField>
          )}

          {/* DESCRIPTION */}
          <S.FormField>
            <S.Label>{t("export_import:exportMapping.table_note")}</S.Label>
            <S.Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </S.FormField>
        </S.FormContainer>

        {/* FOOTER */}
        <S.Footer>
          <Button variation="secondary" onClick={onCancel}>
            {t("accounts:accountForm.button_cancel")}
          </Button>
          <Button onClick={handleSubmit}>{t("accounts:accountForm.button_save")}</Button>
        </S.Footer>
      </S.Card>
    </S.Overlay>
  );
}
