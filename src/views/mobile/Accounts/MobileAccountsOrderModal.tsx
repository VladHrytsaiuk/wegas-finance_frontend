import { Reorder } from "framer-motion";
import { HiBars3, HiCheck, HiXMark } from "react-icons/hi2";
import styled from "styled-components";

import type { Account } from "../../../services/apiAccounts";

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: min(100%, 560px);
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text-main);
`;

const Description = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: var(--color-text-secondary);
`;

const List = styled(Reorder.Group)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
`;

const Row = styled(Reorder.Item)`
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 10px 12px 10px 10px;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-sm);
`;

const DragHandle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  background: var(--color-bg-page);
  touch-action: none;
`;

const AccountMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const AccountTopLine = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const AccountName = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const AccountSubtitle = styled.div`
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
`;

const AccountOwner = styled.div`
  font-size: 10px;
  color: var(--color-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
`;

const CurrencyBadge = styled.span`
  flex-shrink: 0;
  padding: 3px 7px;
  border-radius: 999px;
  background: var(--color-brand-50);
  color: var(--color-brand-700);
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
`;

const TypeBadge = styled.span`
  justify-self: end;
  padding: 5px 8px;
  border-radius: 999px;
  background: var(--color-bg-page);
  color: var(--color-text-secondary);
  font-size: 10px;
  font-weight: 700;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  color: var(--color-text-main);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 14px;
  border: none;
  background: var(--color-brand-600);
  color: var(--color-white);
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
`;

const accountTypeLabel = (account: Account) => {
  if (account.type === "card") return "Картка";
  if (account.type === "cash") return "Готівка";
  if (account.type === "piggy_bank") return "Скарбничка";
  return account.type;
};

const BANK_LABELS: Record<string, string> = {
  monobank: "monobank",
  privat: "PrivatBank",
  privatbank: "PrivatBank",
  raiffeisen: "Raiffeisen",
  ukrsib: "Ukrsibbank",
  pumb: "PUMB",
  sense: "Sense Bank",
  oschad: "Oschadbank",
};

const CARD_TYPE_LABELS: Record<string, string> = {
  black: "Black",
  white: "White",
  platinum: "Platinum",
  iron: "Iron",
  gold: "Gold",
  debit: "Debit",
  credit: "Credit",
  universal: "Universal",
  "kartka-dlya-vyplat": "Картка для виплат",
  "kartka-dlia-vyplat": "Картка для виплат",
  epidtrymka: "єПідтримка",
  ye_pidtrymka: "єПідтримка",
  cashback: "Cashback",
  "nats-keshbek": "Нацкешбек",
  child: "Дитяча",
  junior: "Junior",
};

const titleize = (value?: string) => {
  if (!value) return "";

  return value
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const bankLabel = (value?: string) => {
  if (!value) return "";

  const normalized = value.trim().toLowerCase();
  return BANK_LABELS[normalized] || titleize(value);
};

const cardTypeLabel = (value?: string) => {
  if (!value) return "";

  const normalized = value.trim().toLowerCase();
  return CARD_TYPE_LABELS[normalized] || titleize(value);
};

const accountSubtitleLabel = (
  account: Account,
) => {
  const bank = bankLabel(account.bank_name);
  const cardType = cardTypeLabel(account.card_type);
  const type = accountTypeLabel(account);
  const parts = [bank, cardType || type].filter(Boolean);
  return parts.join(" • ") || type;
};

type MobileAccountsOrderModalProps = {
  accounts: Account[];
  ownerNames: Record<string, string>;
  isDirty: boolean;
  isSaving: boolean;
  onCloseModal?: () => void;
  onSave: () => Promise<boolean>;
  onReorder: (next: Account[]) => void;
};

export function MobileAccountsOrderModal({
  accounts,
  ownerNames,
  isDirty,
  isSaving,
  onCloseModal,
  onSave,
  onReorder,
}: MobileAccountsOrderModalProps) {
  return (
    <ModalBody>
      <Header>
        <Title>Порядок рахунків</Title>
        <Description>
          Перетягуй рахунки у потрібному порядку. Фільтри зверху лише відображають цей список.
        </Description>
      </Header>

      <List axis="y" values={accounts} onReorder={onReorder}>
        {accounts.map((account) => (
          <Row key={account.id} value={account}>
            <DragHandle aria-hidden="true">
              <HiBars3 size={18} />
            </DragHandle>

            <AccountMeta>
              <AccountTopLine>
                <AccountName>{account.name}</AccountName>
                {account.currency && (
                  <CurrencyBadge>{account.currency.toUpperCase()}</CurrencyBadge>
                )}
              </AccountTopLine>

              <AccountSubtitle>{accountSubtitleLabel(account)}</AccountSubtitle>
              {ownerNames[account.user_id] && (
                <AccountOwner>{ownerNames[account.user_id]}</AccountOwner>
              )}
            </AccountMeta>

            <TypeBadge>{accountTypeLabel(account)}</TypeBadge>
          </Row>
        ))}
      </List>

      <Footer>
        <SecondaryButton type="button" onClick={onCloseModal}>
          <HiXMark size={18} />
          Скасувати
        </SecondaryButton>

        {isDirty && (
          <PrimaryButton
            type="button"
            onClick={async () => {
              try {
                const isSaved = await onSave();
                if (isSaved) {
                  onCloseModal?.();
                }
              } catch {
                return;
              }
            }}
            disabled={isSaving}
          >
            <HiCheck size={18} />
            {isSaving ? "Збереження..." : "Зберегти"}
          </PrimaryButton>
        )}
      </Footer>
    </ModalBody>
  );
}
