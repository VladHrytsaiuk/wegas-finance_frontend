import { Navigate } from "react-router-dom";

import { useIsMobile } from "../../hooks/useIsMobile";
import MobileShoppingList from "../../views/mobile/Shopping/MobileShoppingList";

// Окремого екрана списку на десктопі немає — там списки лежать карточками на /shopping.
export default function ShoppingListPage() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileShoppingList /> : <Navigate to="/shopping" replace />;
}
