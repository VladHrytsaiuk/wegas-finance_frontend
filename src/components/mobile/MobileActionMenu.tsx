import { useRef } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { HiPlus, HiCamera, HiOutlineDocumentText } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { setPendingReceiptPhoto } from "../../utils/pendingReceiptPhoto";

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
  onOpenReceiptImport: () => void;
}

function MobileActionMenu({ onClose, onOpenReceiptImport }: MobileActionMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleAction = (path: string) => {
    navigate(path, { state: { background: location } });
    onClose();
  };

  const handleReceiptSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const photo = event.target.files?.[0];
    event.target.value = "";
    if (!photo) return;

    setPendingReceiptPhoto(photo);
    handleAction("/transactions/new?type=expense&photoOnly=1");
  };

  return (
    <Overlay onClick={onClose}>
      <MenuContainer onClick={(e) => e.stopPropagation()}>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleReceiptSelected}
          hidden
        />
        <MenuHeader>Швидкі дії</MenuHeader>

        <ActionItem onClick={() => handleAction("/transactions/new")}>
          <IconBox><HiPlus /></IconBox>
          <ActionLabel>
            <ActionTitle>{t("transactions:transactionsPage.button_add")}</ActionTitle>
            <ActionDesc>Додати транзакцію вручну</ActionDesc>
          </ActionLabel>
        </ActionItem>

        <ActionItem onClick={() => galleryInputRef.current?.click()}>
          <IconBox><HiCamera /></IconBox>
          <ActionLabel>
            <ActionTitle>Сфотографувати чек</ActionTitle>
            <ActionDesc>Зробити фото, обрати з галереї або файлів</ActionDesc>
          </ActionLabel>
        </ActionItem>

        <ActionItem onClick={onOpenReceiptImport}>
          <IconBox><HiOutlineDocumentText /></IconBox>
          <ActionLabel>
            <ActionTitle>Додати електронний чек</ActionTitle>
            <ActionDesc>XML-файл або посилання на чек</ActionDesc>
          </ActionLabel>
        </ActionItem>
      </MenuContainer>
    </Overlay>
  );
}

export default MobileActionMenu;
