import { HiCloudArrowUp, HiInformationCircle } from "react-icons/hi2";

// Styles & Logic
import * as S from "./UploadStep.styles";
import { useUploadStep } from "../../hooks/Import/useUploadStep";

interface Props {
  bankType: "privatbank" | "monobank";
  setBankType: (type: "privatbank" | "monobank") => void;
  onFileSelect: (file: File) => void;
  lockedBankType?: "privatbank" | "monobank" | null;
}

export default function UploadStep({
  bankType,
  setBankType,
  onFileSelect,
  lockedBankType,
}: Props) {
  const {
    state: { isDragging },
    refs: { fileInputRef },
    handlers: {
      triggerFileInput,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleFileChange,
    },
    t,
  } = useUploadStep({ onFileSelect });

  return (
    <S.Container>
      {/* SWITCHER (Only if not locked) */}
      {!lockedBankType && (
        <S.SwitcherContainer>
          <S.SwitcherButton
            $active={bankType === "privatbank"}
            $activeColor="var(--color-brand-600)"
            onClick={() => setBankType("privatbank")}
          >
            {t("importModal.bank_privat", "ПриватБанк")}
          </S.SwitcherButton>
          <S.SwitcherButton
            $active={bankType === "monobank"}
            $activeColor="#000000"
            onClick={() => setBankType("monobank")}
          >
            {t("importModal.bank_mono", "Monobank")}
          </S.SwitcherButton>
        </S.SwitcherContainer>
      )}

      {/* LOCKED HEADER */}
      {lockedBankType && (
        <S.LockedHeader>
          <h3>
            {t("importModal.import_from", "Імпорт з")}{" "}
            {lockedBankType === "privatbank"
              ? t("importModal.bank_privat")
              : t("importModal.bank_mono")}
          </h3>
        </S.LockedHeader>
      )}

      {/* DRAG & DROP ZONE */}
      <S.UploadZone
        $isDragging={isDragging}
        onClick={triggerFileInput}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <S.UploadIconCircle>
          <HiCloudArrowUp size={48} color="var(--color-brand-500)" />
        </S.UploadIconCircle>

        <S.UploadText>
          <S.UploadTitle>
            {t("importModal.upload_title", "Завантажте виписку")}
          </S.UploadTitle>
          <S.UploadSubtitle>
            {bankType === "privatbank"
              ? t("importModal.upload_hint_privat", "Оберіть PDF файл")
              : t(
                  "importModal.upload_hint_mono",
                  "Рекомендовано CSV або PDF, XLS"
                )}
          </S.UploadSubtitle>
        </S.UploadText>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept={bankType === "privatbank" ? ".pdf" : ".pdf,.csv,.xls,.xlsx"}
          onChange={handleFileChange}
        />
      </S.UploadZone>

      {/* INSTRUCTIONS */}
      <S.InstructionBox>
        <S.InstructionHeader>
          <HiInformationCircle size={18} color="var(--color-brand-500)" />
          <strong>
            {t("importModal.instr_title", "Як отримати виписку?")}
          </strong>
        </S.InstructionHeader>

        <S.InstructionList>
          {bankType === "privatbank" ? (
            <>
              <li>{t("importModal.instr_privat_1")}</li>
              <li>{t("importModal.instr_privat_2")}</li>
              <li>{t("importModal.instr_privat_3")}</li>
            </>
          ) : (
            <>
              <li>{t("importModal.instr_mono_1")}</li>
              <li>{t("importModal.instr_mono_2")}</li>
              <li>{t("importModal.instr_mono_3")}</li>
            </>
          )}
        </S.InstructionList>
      </S.InstructionBox>
    </S.Container>
  );
}
