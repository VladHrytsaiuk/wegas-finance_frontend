import styled from "styled-components";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  HiOutlineUser, 
  HiOutlineGlobeAlt, 
  HiOutlineRectangleGroup, 
  HiOutlineTag,
  HiOutlineArrowRightOnRectangle,
  HiOutlineUserGroup,
  HiOutlineDocumentArrowDown,
  HiOutlineChevronRight,
  HiOutlineUsers
} from "react-icons/hi2";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useSettingsLayout } from "../../../hooks/Settings/useSettingsLayout";
import Modal from "../../../components/ui/Modal";
import ConfirmLogout from "../../../components/ui/ConfirmLogout";

const StyledMobileSettings = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-page);
  min-height: 100vh;
`;

const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-bg-surface);
  padding: 16px 20px;
  padding-top: max(16px, env(safe-area-inset-top));
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text-main);
  letter-spacing: -0.5px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px 16px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionTitle = styled.h2`
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-left: 12px;
  margin-bottom: 4px;
`;

const ListGroup = styled.div`
  background-color: var(--color-bg-surface);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
`;

const ListItem = styled(Link)<{ $isLast?: boolean; $isDestructive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  text-decoration: none;
  color: ${props => props.$isDestructive ? 'var(--color-red-600)' : 'var(--color-text-main)'};
  background-color: transparent;
  border-bottom: ${props => props.$isLast ? 'none' : '1px solid var(--color-border)'};
  transition: background-color 0.2s;

  &:active {
    background-color: var(--color-bg-hover);
  }
`;

const ListButton = styled.button<{ $isLast?: boolean; $isDestructive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  width: 100%;
  border: none;
  background-color: transparent;
  color: ${props => props.$isDestructive ? 'var(--color-red-600)' : 'var(--color-text-main)'};
  border-bottom: ${props => props.$isLast ? 'none' : '1px solid var(--color-border)'};
  cursor: pointer;
  transition: background-color 0.2s;

  &:active {
    background-color: var(--color-bg-hover);
  }
`;

const LeftSide = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const IconBox = styled.div<{ $bg: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: ${props => props.$bg};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Label = styled.span`
  font-size: 16px;
  font-weight: 600;
`;

const RightSide = styled.div`
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;

  svg {
    width: 18px;
    height: 18px;
  }
`;

function MobileSettings() {
  const { t, actions } = useSettingsLayout();
  usePageTitle(t("settings:settingsLayout.header"));

  return (
    <Modal>
      <StyledMobileSettings>
        <StickyHeader>
          <HeaderTitle>{t("settings:settingsLayout.header")}</HeaderTitle>
        </StickyHeader>

        <Content>
          <Section>
            <SectionTitle>Обліковий запис</SectionTitle>
            <ListGroup>
              <ListItem to="/settings/profile" $isLast>
                <LeftSide>
                  <IconBox $bg="#8b5cf6">
                    <HiOutlineUser />
                  </IconBox>
                  <Label>{t("settings:settingsLayout.menu_profile")}</Label>
                </LeftSide>
                <RightSide>
                  <HiOutlineChevronRight />
                </RightSide>
              </ListItem>
            </ListGroup>
          </Section>

          <Section>
            <SectionTitle>Структура фінансів</SectionTitle>
            <ListGroup>
              <ListItem to="/settings/categories">
                <LeftSide>
                  <IconBox $bg="#f59e0b">
                    <HiOutlineRectangleGroup />
                  </IconBox>
                  <Label>{t("settings:settingsLayout.menu_categories")}</Label>
                </LeftSide>
                <RightSide>
                  <HiOutlineChevronRight />
                </RightSide>
              </ListItem>

              <ListItem to="/settings/tags">
                <LeftSide>
                  <IconBox $bg="#ec4899">
                    <HiOutlineTag />
                  </IconBox>
                  <Label>{t("settings:settingsLayout.menu_tags")}</Label>
                </LeftSide>
                <RightSide>
                  <HiOutlineChevronRight />
                </RightSide>
              </ListItem>

              <ListItem to="/settings/counterparties" $isLast>
                <LeftSide>
                  <IconBox $bg="#10b981">
                    <HiOutlineUsers />
                  </IconBox>
                  <Label>{t("settings:settingsLayout.menu_counterparties")}</Label>
                </LeftSide>
                <RightSide>
                  <HiOutlineChevronRight />
                </RightSide>
              </ListItem>
            </ListGroup>
          </Section>

          <Section>
            <SectionTitle>Система</SectionTitle>
            <ListGroup>
              <ListItem to="/settings/general">
                <LeftSide>
                  <IconBox $bg="#3b82f6">
                    <HiOutlineGlobeAlt />
                  </IconBox>
                  <Label>{t("settings:settingsLayout.menu_general")}</Label>
                </LeftSide>
                <RightSide>
                  <HiOutlineChevronRight />
                </RightSide>
              </ListItem>

              <ListItem to="/settings/users">
                <LeftSide>
                  <IconBox $bg="#6366f1">
                    <HiOutlineUserGroup />
                  </IconBox>
                  <Label>{t("settings:settingsLayout.menu_users")}</Label>
                </LeftSide>
                <RightSide>
                  <HiOutlineChevronRight />
                </RightSide>
              </ListItem>

              <ListItem to="/settings/export" $isLast>
                <LeftSide>
                  <IconBox $bg="#06b6d4">
                    <HiOutlineDocumentArrowDown />
                  </IconBox>
                  <Label>{t("settings:settingsLayout.menu_export")}</Label>
                </LeftSide>
                <RightSide>
                  <HiOutlineChevronRight />
                </RightSide>
              </ListItem>
            </ListGroup>
          </Section>

          <Section>
            <ListGroup>
              <Modal.Open opens="logout">
                <ListButton $isLast $isDestructive>
                  <LeftSide>
                    <IconBox $bg="#ef4444">
                      <HiOutlineArrowRightOnRectangle />
                    </IconBox>
                    <Label>{t("settings:settingsLayout.menu_logout")}</Label>
                  </LeftSide>
                </ListButton>
              </Modal.Open>
            </ListGroup>
          </Section>
        </Content>

        <Modal.Window name="logout">
          <ConfirmLogout
            resourceName={t("settings:settingsLayout.menu_logout")}
            onConfirm={actions.handleLogout}
          />
        </Modal.Window>
      </StyledMobileSettings>
    </Modal>
  );
}

export default MobileSettings;
