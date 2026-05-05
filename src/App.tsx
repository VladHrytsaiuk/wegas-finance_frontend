import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

import { GlobalStyle } from "./styles/GlobalStyle";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Accounts from "./pages/accounts/Accounts";
import Transactions from "./pages/transactions/Transactions";
import TransactionPage from "./pages/transactions/TransactionPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/ui/AppLayout";

// Налаштування
import SettingsLayout from "./pages/settings/SettingsLayout";
import General from "./pages/settings/General";
import Profile from "./pages/settings/Profile";
import Categories from "./pages/settings/Categories";
import Tags from "./pages/settings/Tags";
import PageNotFound from "./pages/PageNotFound";
import Users from "./pages/settings/Users";
import AccountDetails from "./pages/accounts/AccountDetails";
import Export from "./pages/settings/ExportPage";
import Counterparties from "./pages/settings/Counterparties";
import InvestmentDashboard from "./pages/investments/InvestmentDashboard"; // Імпорт
import { ThemeProvider } from "./context/ThemeContext";
import { SettingsProvider } from "./context/SettingsContext";
import { Statistics } from "./pages/statistics/Statistics";
import { HeaderProvider } from "./context/HeaderContext";
import { WorkspaceProvider } from "./context/WorkspaceContext"; // 👈 1. Додано імпорт

// Модалки
import CreateTransactionModal from "./components/transactions/CreateTransactionModal";
import EditTransactionModal from "./components/transactions/EditTransactionModal";
import CreateAccountModal from "./components/accounts/CreateAccountModal";
import EditAccountModal from "./components/accounts/EditAccountModal";
import ExportModal from "./components/stats/ExportModal";

// Сторінки
import Assets from "./pages/assets/Assets";
import AssetDetails from "./pages/assets/AssetDetails";
import Debts from "./pages/debts/Debts";
import DebtorDetails from "./pages/debts/DebtorDetails";
import Utility from "./pages/utility/Utility";
import UtilityDetails from "./pages/utility/UtilityDetails";
import UtilityAnalyticsPage from "./pages/utility/UtilityAnalyticsPage";
import UtilityMeterAnalyticsPage from "./pages/utility/UtilityMeterAnalyticsPage";
import { SyncProvider } from "./context/SyncContext";
import Goals from "./pages/Goals/Goals";
import GoalDetails from "./pages/Goals/GoalDetails";
import Shopping from "./pages/Shopping/Shopping";
import WishlistGroups from "./pages/wishlist/WishlistGroups";
import WishlistItems from "./pages/wishlist/WishlistItems";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

function AppRoutes() {
  const location = useLocation();
  const background = location.state && location.state.background;

  return (
    <>
      <Routes location={background || location}>
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate replace to="dashboard" />} />
          {/* --- FINANCE ROUTES --- */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="accounts/:accountId" element={<AccountDetails />} />
          <Route path="transactions" element={<Transactions />} />
          <Route
            path="transactions/:transactionId"
            element={<TransactionPage />}
          />
          <Route path="statistics" element={<Statistics />} />
          <Route path="debts" element={<Debts />} />
          <Route path="debts/:id" element={<DebtorDetails />} />
          <Route path="goals" element={<Goals />} />
          <Route path="goals/:id" element={<GoalDetails />} />
          <Route path="assets" element={<Assets />} />
          <Route path="assets/:id" element={<AssetDetails />} />
          <Route path="utility" element={<Utility />} />
          <Route path="utility/analytics" element={<UtilityAnalyticsPage />} />
          {/* 🔥 НОВЕ */}
          <Route path="utility/:id" element={<UtilityDetails />} />
          <Route
            path="utility/:id/analytics"
            element={<UtilityMeterAnalyticsPage />}
          />
          <Route path="shopping" element={<Shopping />} />
          <Route path="wishlist" element={<WishlistGroups />} />
          <Route path="wishlist/:groupId" element={<WishlistItems />} />
          {/* 🔥 НОВЕ */}
          {/* --- INVESTMENTS ROUTES (Поки що ведуть на 404 або дублюють) --- */}
          {/* Ти зможеш додати сюди реальні сторінки пізніше */}
          <Route
            path="investments/dashboard"
            element={<InvestmentDashboard />}
          />
          <Route
            path="investments/portfolio"
            element={<div>Portfolio (Coming Soon)</div>}
          />
          {/* --- SHARED SETTINGS --- */}
          <Route path="settings" element={<SettingsLayout />}>
            <Route index element={<Navigate replace to="general" />} />
            <Route path="general" element={<General />} />
            <Route path="profile" element={<Profile />} />
            <Route path="users" element={<Users />} />
            <Route path="categories" element={<Categories />} />
            <Route path="tags" element={<Tags />} />
            <Route path="counterparties" element={<Counterparties />} />
            <Route path="export" element={<Export />} />
          </Route>
        </Route>

        <Route path="login" element={<Login setToken={() => {}} />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>

      {background && (
        <Routes>
          <Route path="transactions/new" element={<CreateTransactionModal />} />
          <Route
            path="transactions/:transactionId/edit"
            element={<EditTransactionModal />}
          />
          <Route path="accounts/new" element={<CreateAccountModal />} />
          <Route
            path="accounts/:accountId/edit"
            element={<EditAccountModal />}
          />
          <Route path="statistics/export" element={<ExportModal />} />
        </Routes>
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <SyncProvider>
        <ThemeProvider>
          <SettingsProvider>
            <HeaderProvider>
              <GlobalStyle />
              <BrowserRouter>
                <WorkspaceProvider>
                  {" "}
                  {/* 👈 Перенесли сюди */}
                  <GlobalStyle />
                  <AppRoutes />
                </WorkspaceProvider>
              </BrowserRouter>
              <Toaster
                position="top-center"
                gutter={12}
                containerStyle={{ margin: "8px" }}
                toastOptions={{
                  success: { duration: 3000 },
                  error: { duration: 5000 },
                  style: {
                    fontSize: "16px",
                    maxWidth: "500px",
                    padding: "16px 24px",
                    backgroundColor: "var(--color-bg-surface)",
                    color: "var(--color-text-main)",
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-md)",
                  },
                }}
              />
            </HeaderProvider>
          </SettingsProvider>
        </ThemeProvider>
      </SyncProvider>
    </QueryClientProvider>
  );
}

export default App;
