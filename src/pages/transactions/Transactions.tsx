import { useIsMobile } from "../../hooks/useIsMobile";
import DesktopTransactions from "./DesktopTransactions";
import MobileTransactionHistory from "../../views/mobile/Transactions/MobileTransactionHistory";

function Transactions() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileTransactionHistory />;
  }

  return <DesktopTransactions />;
}

export default Transactions;
