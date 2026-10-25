import { useIsMobile } from "../../hooks/useIsMobile";
import DesktopAccounts from "./DesktopAccounts";
import MobileAccountsList from "../../views/mobile/AccountsList/MobileAccountsList";

function Accounts() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileAccountsList />;
  }

  return <DesktopAccounts />;
}

export default Accounts;
