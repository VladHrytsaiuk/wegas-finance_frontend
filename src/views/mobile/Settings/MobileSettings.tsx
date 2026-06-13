import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { 
  HiOutlineUser, 
  HiOutlineGlobeAlt, 
  HiOutlineRectangleGroup, 
  HiOutlineTag,
  HiOutlineArrowRightOnRectangle
} from "react-icons/hi2";
import { usePageTitle } from "../../../hooks/usePageTitle";

const StyledMobileSettings = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 16px;
`;

const SettingItem = styled.div`
  background-color: var(--color-bg-surface);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 12px;
  color: var(--color-text-main);
  border: 1px solid var(--color-border);
`;

const IconWrapper = styled.div`
  color: var(--color-brand-600);
  display: flex;
  align-items: center;
  justify-content: center;
  & svg {
    width: 20px;
    height: 20px;
  }
`;

function MobileSettings() {
  const { t } = useTranslation();
  usePageTitle(t("navigation:general.settings"));

  return (
    <StyledMobileSettings>
      <Title>{t("navigation:general.settings")}</Title>

      <SettingItem>
        <IconWrapper><HiOutlineGlobeAlt /></IconWrapper>
        <span>{t("settings:settingsLayout.menu_general")}</span>
      </SettingItem>

      <SettingItem>
        <IconWrapper><HiOutlineUser /></IconWrapper>
        <span>{t("settings:settingsLayout.menu_profile")}</span>
      </SettingItem>

      <SettingItem>
        <IconWrapper><HiOutlineRectangleGroup /></IconWrapper>
        <span>{t("settings:settingsLayout.menu_categories")}</span>
      </SettingItem>

      <SettingItem>
        <IconWrapper><HiOutlineTag /></IconWrapper>
        <span>{t("settings:settingsLayout.menu_tags")}</span>
      </SettingItem>

      <SettingItem style={{ marginTop: '20px', color: 'var(--color-red-600)' }}>
        <IconWrapper style={{ color: 'var(--color-red-600)' }}><HiOutlineArrowRightOnRectangle /></IconWrapper>
        <span>{t("settings:settingsLayout.menu_logout")}</span>
      </SettingItem>

    </StyledMobileSettings>
  );
}

export default MobileSettings;
