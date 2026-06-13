import { useIsMobile } from "../../hooks/useIsMobile";
import DesktopTransactions from "./DesktopTransactions";
import MobileTransactions from "../../views/mobile/Transactions/MobileTransactions";

function Transactions() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileTransactions />;
  }

  return <DesktopTransactions />;
}

export default Transactions;
