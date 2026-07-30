import { useIsMobile } from "../../hooks/useIsMobile";
import MobilePageHeader from "../../components/mobile/MobilePageHeader";
import { useGeneralSettings } from "../../hooks/Settings/useGeneralSettings";
import * as S from "./General.styles";

function Finance() {
  const { state, actions } = useGeneralSettings();
  const isMobile = useIsMobile();
  const isBusy = state.isLoading || state.isPending;

  return (
    <>
      {isMobile && <MobilePageHeader title="Фінанси" />}
      <S.Container style={{ padding: isMobile ? "20px 16px" : undefined }}>
        {!isMobile && <S.SectionTitle>Фінанси</S.SectionTitle>}
        <S.FormGroup>
          <S.SettingRow>
            <S.Label>
              <S.LabelText>Вимкнути ручну перевірку чеків</S.LabelText>
              <S.LabelDescription>
                Однозначні чеки з Inbox будуть автоматично прив'язуватися до операцій Monobank.
              </S.LabelDescription>
            </S.Label>
            <S.SwitchButton
              $isActive={!state.requireReceiptReview}
              onClick={actions.toggleReceiptReview}
              disabled={isBusy}
              aria-label="Вимкнути ручну перевірку чеків"
            />
          </S.SettingRow>
        </S.FormGroup>
      </S.Container>
    </>
  );
}

export default Finance;
