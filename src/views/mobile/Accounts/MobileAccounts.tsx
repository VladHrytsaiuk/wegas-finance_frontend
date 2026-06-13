import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../../../hooks/usePageTitle";

const StyledMobileAccounts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-main);
`;

const AccountCard = styled.div`
  background-color: var(--color-bg-surface);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AccountHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AccountName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-main);
`;

const AccountBalance = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: var(--color-brand-600);
`;

function MobileAccounts() {
  const { t } = useTranslation();
  usePageTitle(t("navigation:general.accounts"));

  return (
    <StyledMobileAccounts>
      <Title>{t("navigation:general.accounts")}</Title>
      
      <AccountCard>
        <AccountHeader>
          <AccountName>Monobank Platinum</AccountName>
        </AccountHeader>
        <AccountBalance>₴ 12,450.00</AccountBalance>
      </AccountCard>

      <AccountCard>
        <AccountHeader>
          <AccountName>Cash</AccountName>
        </AccountHeader>
        <AccountBalance>₴ 5,000.00</AccountBalance>
      </AccountCard>

      <div style={{ textAlign: "center", color: "var(--color-text-tertiary)", marginTop: "20px" }}>
        Account list coming soon...
      </div>
    </StyledMobileAccounts>
  );
}

export default MobileAccounts;
