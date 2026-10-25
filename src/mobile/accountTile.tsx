import type { ReactNode } from "react";
import {
  HiOutlineBanknotes,
  HiOutlineCreditCard,
  HiOutlineFlag,
  HiOutlineCurrencyDollar,
  HiOutlineWallet,
} from "react-icons/hi2";

import { bankLogo } from "./bankLogo";
import { accountSection, type AccountLike, type AccountSection } from "./accountSection";
import { Tile } from "./ui/Tile";

// Плитка рахунку: логотип банку, а без нього — іконка за видом рахунку.

const SECTION_ICONS: Record<AccountSection, ReactNode> = {
  cards: <HiOutlineCreditCard size={20} />,
  cash: <HiOutlineBanknotes size={20} />,
  savings: <HiOutlineFlag size={20} />,
  crypto: <HiOutlineCurrencyDollar size={20} />,
  other: <HiOutlineWallet size={20} />,
};

export function AccountTile({ account, size }: { account: AccountLike; size?: number }) {
  const section = accountSection(account);
  return (
    <Tile
      logo={bankLogo(account)}
      icon={SECTION_ICONS[section]}
      tint={section === "savings" ? "green" : "gray"}
      size={size}
    />
  );
}
