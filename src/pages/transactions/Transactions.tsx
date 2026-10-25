import { useIsMobile } from "../../hooks/useIsMobile";
import DesktopTransactions from "./DesktopTransactions";
import MobileOperations from "../../views/mobile/Operations/MobileOperations";

function Transactions() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileOperations />;
  }

  return <DesktopTransactions />;
}

export default Transactions;
