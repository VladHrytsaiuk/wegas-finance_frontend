import React from "react";
import styled from "styled-components";
import { HiOutlineQrCode, HiOutlineUserPlus } from "react-icons/hi2";
import Modal from "../../components/ui/Modal";

const ChoiceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
`;

const ChoiceCard = styled.button`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;

  &:hover {
    border-color: var(--color-brand-500);
    background-color: var(--color-bg-page);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  & svg {
    width: 2.5rem;
    height: 2.5rem;
    color: var(--color-brand-600);
    background-color: var(--color-brand-50);
    padding: 0.6rem;
    border-radius: 12px;
  }
`;

const ChoiceContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ChoiceTitle = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-main);
`;

const ChoiceDescription = styled.span`
  font-size: 0.9rem;
  color: var(--color-text-secondary);
`;

interface AddMemberChoiceModalProps {
  onInviteViaCode: () => void;
  onCreateManually: () => void;
  t: any;
}

export const AddMemberChoiceModal: React.FC<AddMemberChoiceModalProps> = ({
  onInviteViaCode,
  onCreateManually,
  t,
}) => {
  return (
    <ChoiceContainer>
      <ChoiceCard onClick={onInviteViaCode}>
        <HiOutlineQrCode />
        <ChoiceContent>
          <ChoiceTitle>{t("settings:usersPage.choice_invite_title", "Запросити через код")}</ChoiceTitle>
          <ChoiceDescription>
            {t("settings:usersPage.choice_invite_desc", "Згенеруйте 6-значний код для швидкого приєднання.")}
          </ChoiceDescription>
        </ChoiceContent>
      </ChoiceCard>

      <ChoiceCard onClick={onCreateManually}>
        <HiOutlineUserPlus />
        <ChoiceContent>
          <ChoiceTitle>{t("settings:usersPage.choice_manual_title", "Створити вручну")}</ChoiceTitle>
          <ChoiceDescription>
            {t("settings:usersPage.choice_manual_desc", "Додайте учасника, ввівши його дані та пароль.")}
          </ChoiceDescription>
        </ChoiceContent>
      </ChoiceCard>
    </ChoiceContainer>
  );
};
