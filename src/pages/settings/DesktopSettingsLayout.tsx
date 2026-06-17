import { Outlet } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineTag,
  HiOutlineRectangleGroup,
  HiOutlineGlobeAlt,
  HiOutlineUserGroup,
  HiArrowRightOnRectangle,
  HiOutlineDocumentArrowDown,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

import Modal from "../../components/ui/Modal";
import ConfirmLogout from "../../components/ui/ConfirmLogout";

import { useSettingsLayout } from "../../hooks/Settings/useSettingsLayout";
import { usePageTitle } from "../../hooks/usePageTitle";
import * as S from "./SettingsLayout.styles";

function SettingsLayout() {
  const { actions, t } = useSettingsLayout();
  usePageTitle(t("navigation:general.settings", "Налаштування"));

  return (
    <Modal>
      <S.PageContainer>
        <S.LayoutGrid>
          <S.Sidebar>
            <S.SidebarItem to="general">
              <HiOutlineGlobeAlt /> {t("settings:settingsLayout.menu_general")}
            </S.SidebarItem>

            <S.SidebarItem to="profile">
              <HiOutlineUser /> {t("settings:settingsLayout.menu_profile")}
            </S.SidebarItem>

            <S.SidebarItem to="security">
              <HiOutlineShieldCheck /> {t("settings:settingsLayout.menu_security", "Безпека")}
            </S.SidebarItem>

            <S.SidebarItem to="users">
              <HiOutlineUserGroup /> {t("settings:settingsLayout.menu_users")}
            </S.SidebarItem>

            <S.SidebarItem to="categories">
              <HiOutlineRectangleGroup /> {t("settings:settingsLayout.menu_categories")}
            </S.SidebarItem>

            <S.SidebarItem to="counterparties">
              <HiOutlineDocumentArrowDown />{" "}
              {t("settings:settingsLayout.menu_counterparties")}
            </S.SidebarItem>

            <S.SidebarItem to="tags">
              <HiOutlineTag /> {t("settings:settingsLayout.menu_tags")}
            </S.SidebarItem>

            <S.SidebarItem to="export">
              <HiOutlineDocumentArrowDown /> {t("settings:settingsLayout.menu_export")}
            </S.SidebarItem>

            <Modal.Open opens="logout">
              <S.LogoutButton>
                <HiArrowRightOnRectangle /> {t("settings:settingsLayout.menu_logout")}
              </S.LogoutButton>
            </Modal.Open>
          </S.Sidebar>

          <S.ContentCard>
            <Outlet />
          </S.ContentCard>
        </S.LayoutGrid>

        <Modal.Window name="logout">
          <ConfirmLogout
            resourceName={t("settings:settingsLayout.menu_logout")}
            onConfirm={actions.handleLogout}
          />
        </Modal.Window>
      </S.PageContainer>
    </Modal>
  );
}

export default SettingsLayout;
