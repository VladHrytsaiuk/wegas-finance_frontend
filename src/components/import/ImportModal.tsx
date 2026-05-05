import {
  HiDocumentText,
  HiExclamationCircle,
  HiSparkles,
  HiInformationCircle,
} from "react-icons/hi2";

// UI Components
import Spinner from "../ui/Spinner";
import { Button } from "../ui/Button";
import Checkbox from "../ui/Checkbox";

// Sub-components
import UploadStep from "./UploadStep";
import TransactionRow from "./TransactionRow";
import DuplicateComparisonModal from "./DuplicateComparisonModal";
import EditTransactionModal from "./EditTransactionModal";

// Styles & Logic
import * as S from "./ImportModal.styles";
import { useImportModal } from "../../hooks/Import/useImportModal";

interface ImportModalProps {
  // 🔥 Зміна: приймаємо об'єкт account
  account: any;
  onClose?: () => void;
}

export default function ImportModal({ account, onClose }: ImportModalProps) {
  const {
    state: {
      step,
      bankType,
      isLoading,
      transactions,
      selectedIndices,
      editingTx,
      duplicatePreview,
      lockedBankType,
      invalidTransactionsCount,
      hasInvalidTransactions,
      isSaving,
    },
    data: { categories, counterparties },
    actions: {
      setStep,
      setBankType,
      setEditingTx,
      setDuplicatePreview,
      processFile,
      handleToggle,
      handleToggleAll,
      handleFillEmptyCategories,
      handleSaveEdit,
      importBatch,
    },
    t,
  } = useImportModal({ account, onClose });

  if (isLoading)
    return (
      <S.LoadingContainer>
        <Spinner />
      </S.LoadingContainer>
    );

  return (
    <S.Container>
      <S.Header>
        <h2>
          <HiDocumentText color="var(--color-brand-600)" />
          {step === "upload"
            ? t("accountDetailsPage.action_import_button")
            : t("importModal.title_preview", "Перевірка даних")}
        </h2>
      </S.Header>

      <S.ContentWrapper>
        {step === "upload" ? (
          <UploadStep
            bankType={bankType}
            setBankType={setBankType}
            onFileSelect={processFile}
            // Якщо lockedBankType встановлено (Privat/Mono),
            // UploadStep має приховати селект або зробити його disabled
            lockedBankType={lockedBankType}
          />
        ) : (
          <>
            <br />
            <S.DisclaimerWrapper>
              <S.DisclaimerBanner>
                <HiInformationCircle size={16} />
                <span>
                  {t(
                    "importModal.disclaimer",
                    "Категорії та контрагенти визначені автоматично...",
                  )}
                </span>
              </S.DisclaimerBanner>
            </S.DisclaimerWrapper>

            {/* ... ТАБЛИЦЯ (Без змін) ... */}
            <S.TableContainer>
              <S.Table>
                <S.StickyThead>
                  <tr>
                    <S.ThCheckbox>
                      <Checkbox
                        checked={
                          selectedIndices.size > 0 &&
                          transactions.some((t) => !t.is_duplicate)
                        }
                        onChange={handleToggleAll}
                      />
                    </S.ThCheckbox>
                    <S.ThDate>{t("exportMapping.table_date")}</S.ThDate>
                    <S.ThNote>{t("exportMapping.table_note")}</S.ThNote>
                    <S.ThCategory>
                      {t("exportMapping.table_category")}
                    </S.ThCategory>
                    <S.ThAmount>{t("exportMapping.table_amount")}</S.ThAmount>
                    <S.ThAction />
                  </tr>
                </S.StickyThead>
                <tbody>
                  {transactions.map((tx, idx) => (
                    <TransactionRow
                      key={idx}
                      tx={tx}
                      idx={idx}
                      isSelected={selectedIndices.has(idx)}
                      categories={categories}
                      counterparties={counterparties}
                      onToggle={handleToggle}
                      onEdit={(t, i) => setEditingTx({ index: i, data: t })}
                      onShowDuplicate={(n, e) =>
                        setDuplicatePreview({ newTx: n, existingTx: e })
                      }
                    />
                  ))}
                </tbody>
              </S.Table>
              {transactions.length === 0 && (
                <S.EmptyState>
                  {t("transactionsModal.status_empty")}
                </S.EmptyState>
              )}
            </S.TableContainer>
          </>
        )}
      </S.ContentWrapper>

      <S.Footer>
        <S.FooterActions>
          {step === "preview" && hasInvalidTransactions ? (
            <S.ErrorMessage>
              <HiExclamationCircle size={20} />
              <span>
                {t("importModal.error_missing_categories", {
                  count: invalidTransactionsCount,
                })}
              </span>
            </S.ErrorMessage>
          ) : (
            <div />
          )}

          <S.FooterLeftGroup>
            {step === "upload" ? (
              <Button variation="secondary" onClick={onClose}>
                {t("accountForm.button_cancel")}
              </Button>
            ) : (
              <>
                {hasInvalidTransactions && (
                  <S.MagicButton onClick={handleFillEmptyCategories}>
                    <HiSparkles />
                    {t(
                      "importModal.button_fill_magic",
                      'Заповнити пусті як "Інше"',
                    )}
                  </S.MagicButton>
                )}
                <Button variation="secondary" onClick={() => setStep("upload")}>
                  {t("importModal.button_upload_other", "Завантажити інший")}
                </Button>
                <Button
                  disabled={
                    selectedIndices.size === 0 ||
                    isSaving ||
                    hasInvalidTransactions
                  }
                  onClick={() => importBatch()}
                >
                  {isSaving
                    ? t("accountForm.button_saving")
                    : t("importModal.button_import_count", {
                        count: selectedIndices.size,
                      })}
                </Button>
              </>
            )}
          </S.FooterLeftGroup>
        </S.FooterActions>
      </S.Footer>

      {editingTx && (
        <EditTransactionModal
          transaction={editingTx.data}
          categories={categories}
          counterparties={counterparties}
          onSave={handleSaveEdit}
          onCancel={() => setEditingTx(null)}
        />
      )}
      {duplicatePreview && (
        <DuplicateComparisonModal
          newTx={duplicatePreview.newTx}
          existingTx={duplicatePreview.existingTx}
          onClose={() => setDuplicatePreview(null)}
        />
      )}
    </S.Container>
  );
}
