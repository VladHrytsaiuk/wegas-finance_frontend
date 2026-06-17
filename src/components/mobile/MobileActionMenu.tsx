import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { HiPlus, HiCamera, HiOutlineDocumentText } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const MenuContainer = styled.div`
  background-color: var(--color-bg-surface);
  border-radius: 20px 20px 0 0;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: slide-up 0.3s ease-out;

  @keyframes slide-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
`;

const MenuHeader = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 8px;
`;

const ActionItem = styled.button`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: var(--color-bg-page);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    background-color: var(--color-bg-hover);
  }
`;

const IconBox = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: var(--color-brand-50);
  color: var(--color-brand-600);
  display: flex;
  align-items: center;
  justify-content: center;

  & svg {
    width: 24px;
    height: 24px;
  }
`;

const ActionLabel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ActionTitle = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-main);
`;

const ActionDesc = styled.span`
  font-size: 12px;
  color: var(--color-text-secondary);
`;

interface MobileActionMenuProps {
  onClose: () => void;
}

function MobileActionMenu({ onClose }: MobileActionMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAction = (path: string) => {
    navigate(path, { state: { background: location } });
    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <MenuContainer onClick={(e) => e.stopPropagation()}>
        <MenuHeader>Швидкі дії</MenuHeader>
        
        <ActionItem onClick={() => handleAction("/transactions/new")}>
          <IconBox><HiPlus /></IconBox>
          <ActionLabel>
            <ActionTitle>{t("transactions:transactionsPage.button_add")}</ActionTitle>
            <ActionDesc>Додати транзакцію вручну</ActionDesc>
          </ActionLabel>
        </ActionItem>

        <ActionItem onClick={onClose}>
          <IconBox><HiCamera /></IconBox>
          <ActionLabel>
            <ActionTitle>Сфотографувати чек</ActionTitle>
            <ActionDesc>Автоматичне розпізнавання</ActionDesc>
          </ActionLabel>
        </ActionItem>

        <ActionItem onClick={() => handleAction("/settings/export")}>
          <IconBox><HiOutlineDocumentText /></IconBox>
          <ActionLabel>
            <ActionTitle>Імпортувати</ActionTitle>
            <ActionDesc>З файлу або банку</ActionDesc>
          </ActionLabel>
        </ActionItem>
      </MenuContainer>
    </Overlay>
  );
}

export default MobileActionMenu;
