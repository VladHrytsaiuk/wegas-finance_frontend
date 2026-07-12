import React, { useRef } from "react";
import styled, { css } from "styled-components";
import { BANK_SKINS } from "../accounts/bankSkins";
import { formatMoney } from "../../utils/helpers";
import { useSettings } from "../../context/SettingsContext";
import { BankLogo, PaymentSystemLogo } from "../accounts/form/CardStyles";
import {
  HiArchiveBox,
  HiArrowPath,
  HiBanknotes,
  HiBeaker,
  HiEnvelope,
  HiLockClosed,
  HiUser,
} from "react-icons/hi2";
import type { Account } from "../../services/apiAccounts";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const SliderContainer = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 12px;
  padding: 10px 0;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar {
    display: none;
  }
  
  &::before,
  &::after {
    content: '';
    flex: 0 0 7.5%;
  }
`;

const noisePattern = `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' stitchTiles='stitch' result='noise'/%3E%3CfeColorMatrix in='noise' type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 15 -7' result='contrastNoise'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`;

const PrivatNoiseEffect = css`
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: ${noisePattern};
    mix-blend-mode: overlay;
    opacity: 0.4;
    pointer-events: none;
    z-index: 0;
  }
  & > * {
    z-index: 2;
    position: relative;
  }
`;

const Card = styled.div<{ $bg: string; $color: string; $border?: string; $active: boolean; $isPrivat?: boolean }>`
  flex: 0 0 85%;
  scroll-snap-align: center;
  height: 180px;
  background: ${(props) => props.$bg};
  color: ${(props) => props.$color};
  border: ${(props) => props.$border || "none"};
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: ${(props) => (props.$active ? "0 10px 25px rgba(0,0,0,0.25)" : "0 4px 10px rgba(0,0,0,0.1)")};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${(props) => (props.$active ? "scale(1)" : "scale(0.92)")};
  opacity: ${(props) => (props.$active ? "1" : "0.6")};
  position: relative;
  overflow: hidden;
  box-sizing: border-box;

  ${(props) => props.$isPrivat && PrivatNoiseEffect}
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SyncBadge = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    width: 12px;
    height: 12px;
  }
`;

const CardChip = styled.div`
  width: 32px;
  height: 20px;
  background: linear-gradient(135deg, #e2e2e2 0%, #a5a5a5 100%);
  border-radius: 4px;
  margin-top: 8px;
  margin-bottom: 4px;
  position: relative;
  opacity: 0.8;
  flex-shrink: 0;

  &::before { content: ""; position: absolute; top: 50%; left: 0; width: 100%; height: 1px; background: rgba(0,0,0,0.2); }
  &::after { content: ""; position: absolute; left: 50%; top: 0; height: 100%; width: 1px; background: rgba(0,0,0,0.2); }
`;

const CardNumber = styled.div`
  font-family: "Courier New", Courier, monospace;
  font-size: 14px;
  letter-spacing: 2px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;

  .dots {
    font-size: 18px;
    letter-spacing: -1px;
    line-height: 0.5;
  }
`;

const AccountName = styled.div`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardOwner = styled.div`
  font-size: 10px;
  opacity: 0.6;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  svg { width: 10px; height: 10px; }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
`;

const CashTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
`;

const CashTypeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  backdrop-filter: blur(6px);
`;

const CashNameBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CashName = styled.div`
  font-size: 18px;
  font-weight: 800;
  line-height: 1.15;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CashOwner = styled.div`
  font-size: 11px;
  opacity: 0.78;
  display: flex;
  align-items: center;
  gap: 5px;

  svg {
    width: 11px;
    height: 11px;
  }
`;

const CardBalance = styled.div`
  font-size: 22px;
  font-weight: 700;
  font-family: "JetBrains Mono", monospace;
  letter-spacing: -0.5px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`;

const Dot = styled.div<{ $active: boolean }>`
  width: ${(props) => (props.$active ? "18px" : "6px")};
  height: 6px;
  border-radius: 3px;
  background-color: ${(props) => (props.$active ? "var(--color-brand-600)" : "var(--color-border)")};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

type SliderAccount = Account & {
  owner_name?: string;
};

interface CardSliderProps {
  accounts: SliderAccount[];
  activeAccountId: string | null;
  onAccountChange: (accountId: string) => void;
  onCardClick: (accountId: string) => void;
}

function CardSlider({ accounts, activeAccountId, onAccountChange, onCardClick }: CardSliderProps) {
  const { currency: baseCurrency, language } = useSettings();
  const sliderRef = useRef<HTMLDivElement>(null);
  const activeIndex = accounts.findIndex((account) => account.id === activeAccountId);

  const isProgrammaticScroll = useRef(false);

  React.useEffect(() => {
    if (!sliderRef.current || activeIndex < 0) return;
    const container = sliderRef.current;
    const itemWidth = container.offsetWidth * 0.85 + 12;
    const targetScroll = activeIndex * itemWidth;
    
    // Allow a small margin of error for fractional pixels
    if (Math.abs(container.scrollLeft - targetScroll) > 5) {
      isProgrammaticScroll.current = true;
      container.scrollTo({ left: targetScroll, behavior: "smooth" });
      
      const timeout = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 400); // 400ms is enough for smooth scroll to finish
      return () => clearTimeout(timeout);
    }
  }, [activeIndex, accounts.length]);

  const getSkin = (account: SliderAccount) => {
    if (account.type === "card") {
      const bank = account.bank_name;
      const design = account.card_type || account.card_design;
      if (bank && design) {
        const key = `${bank}-${design}`;
        if (BANK_SKINS[key]) return BANK_SKINS[key];
      }
      if (account.icon && BANK_SKINS[account.icon]) {
        return BANK_SKINS[account.icon];
      }
      return BANK_SKINS["default"];
    }
    return {
      bg: account.color || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#ffffff",
      bankId: "other"
    };
  };

  const getStorageIcon = (account: SliderAccount) => {
    if (account.type === "cash") return <HiBanknotes size={20} />;

    switch (account.storage_type?.slug) {
      case "envelope":
        return <HiEnvelope size={20} />;
      case "safe":
        return <HiLockClosed size={20} />;
      case "jar":
        return <HiBeaker size={20} />;
      default:
        return <HiArchiveBox size={20} />;
    }
  };

  const getTypeLabel = (account: SliderAccount) => {
    if (account.type === "cash") return "Готівка";
    return account.storage_type?.name || "Скарбничка";
  };

  const handleScroll = () => {
    if (!sliderRef.current || isProgrammaticScroll.current) return;
    const container = sliderRef.current;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.offsetWidth * 0.85 + 12;
    const index = Math.round(scrollLeft / itemWidth);
    
    if (index !== activeIndex && accounts[index]) {
      onAccountChange(accounts[index].id);
    }
  };

  return (
    <Wrapper>
      <SliderContainer ref={sliderRef} onScroll={handleScroll}>
        {accounts.map((acc) => {
          const skin = getSkin(acc);
          const isActive = acc.id === activeAccountId;
          const isPrivat = skin.bankId === "privat";

          if (acc.type !== "card") {
            return (
              <Card
                key={acc.id}
                $bg={skin.bg}
                $color={skin.color}
                $border={skin.border}
                $active={isActive}
                $isPrivat={false}
                onClick={() => onCardClick(acc.id)}
              >
                <CashTopRow>
                  <CashTypeBadge>
                    {getStorageIcon(acc)}
                    <span>{getTypeLabel(acc)}</span>
                  </CashTypeBadge>
                  {acc.is_synced && (
                    <SyncBadge>
                      <HiArrowPath />
                    </SyncBadge>
                  )}
                </CashTopRow>

                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <CashNameBlock>
                    <CashName>{acc.name}</CashName>
                    {acc.owner_name && (
                      <CashOwner>
                        <HiUser /> {acc.owner_name}
                      </CashOwner>
                    )}
                  </CashNameBlock>
                  <CardFooter>
                    <CardBalance>
                      {formatMoney(
                        acc.calculated_balance || acc.balance || 0,
                        acc.currency || baseCurrency,
                        language,
                      )}
                    </CardBalance>
                  </CardFooter>
                </div>
              </Card>
            );
          }
          
          return (
            <Card
              key={acc.id}
              $bg={skin.bg}
              $color={skin.color}
              $border={skin.border}
              $active={isActive}
              $isPrivat={isPrivat}
              onClick={() => onCardClick(acc.id)}
            >
              <CardHeader>
                <BankLogo skin={skin} />
                {acc.is_synced && (
                  <SyncBadge>
                    <HiArrowPath />
                  </SyncBadge>
                )}
              </CardHeader>

              <div>
                <CardChip />
                <CardNumber>
                  <span className="dots">•••• •••• •••• </span>
                  <span>{acc.card_number ? acc.card_number.slice(-4) : "0000"}</span>
                </CardNumber>
                <AccountName>{acc.name}</AccountName>
                {acc.owner_name && (
                  <CardOwner>
                    <HiUser /> {acc.owner_name}
                  </CardOwner>
                )}
              </div>
              
              <CardFooter>
                <CardBalance>
                  {formatMoney(acc.calculated_balance || acc.balance || 0, acc.currency || baseCurrency, language)}
                </CardBalance>
                <PaymentSystemLogo 
                   system={acc.payment_system || "mastercard"} 
                   color={skin.color} 
                />
              </CardFooter>
            </Card>
          );
        })}
      </SliderContainer>
      
      <Pagination>
        {accounts.map((acc, index) => (
          <Dot key={acc.id} $active={index === activeIndex} />
        ))}
      </Pagination>
    </Wrapper>
  );
}

export default CardSlider;
