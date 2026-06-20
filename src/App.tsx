import { lazy, Suspense } from "react";
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
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SettingsProvider } from "./context/SettingsContext";
import { HeaderProvider } from "./context/HeaderContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { SyncProvider } from "./context/SyncContext";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/ui/AppLayout";
import { CenteredSpinner } from "./components/ui/CenteredSpinner";

// --- LAZY LOADED PAGES ---
const Login = lazy(() => import("./pages/auth/Login"));
const PinLogin = lazy(() => import("./pages/auth/PinLogin"));
const Register = lazy(() => import("./pages/auth/Register"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Accounts = lazy(() => import("./pages/accounts/Accounts"));
const Transactions = lazy(() => import("./pages/transactions/Transactions"));
const TransactionPage = lazy(() => import("./pages/transactions/TransactionPage"));
const SettingsLayout = lazy(() => import("./pages/settings/SettingsLayout"));
const General = lazy(() => import("./pages/settings/General"));
const Profile = lazy(() => import("./pages/settings/Profile"));
const Security = lazy(() => import("./pages/settings/Security"));
const Categories = lazy(() => import("./pages/settings/Categories"));
const Tags = lazy(() => import("./pages/settings/Tags"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));
const FamilySettings = lazy(() => import("./pages/settings/FamilySettings"));
const AccountDetails = lazy(() => import("./pages/accounts/AccountDetails"));
const Export = lazy(() => import("./pages/settings/ExportPage"));
const Counterparties = lazy(() => import("./pages/settings/Counterparties"));
const InvestmentDashboard = lazy(() => import("./pages/investments/InvestmentDashboard"));
const Statistics = lazy(() => import("./pages/statistics/Statistics").then(m => ({ default: m.Statistics })));
const Assets = lazy(() => import("./pages/assets/Assets"));
const AssetDetails = lazy(() => import("./pages/assets/AssetDetails"));
const Debts = lazy(() => import("./pages/debts/Debts"));
const DebtorDetails = lazy(() => import("./pages/debts/DebtorDetails"));
const Utility = lazy(() => import("./pages/utility/Utility"));
const UtilityDetails = lazy(() => import("./pages/utility/UtilityDetails"));
const UtilityAnalyticsPage = lazy(() => import("./pages/utility/UtilityAnalyticsPage"));
const UtilityMeterAnalyticsPage = lazy(() => import("./pages/utility/UtilityMeterAnalyticsPage"));
const Goals = lazy(() => import("./pages/Goals/Goals"));
const GoalDetails = lazy(() => import("./pages/Goals/GoalDetails"));
const Shopping = lazy(() => import("./pages/Shopping/Shopping"));
const WishlistGroups = lazy(() => import("./pages/wishlist/WishlistGroups"));
const WishlistItems = lazy(() => import("./pages/wishlist/WishlistItems"));

// --- LAZY LOADED MODALS ---
const CreateTransactionModal = lazy(() => import("./components/transactions/CreateTransactionModal"));
const EditTransactionModal = lazy(() => import("./components/transactions/EditTransactionModal"));
const CreateAccountModal = lazy(() => import("./components/accounts/CreateAccountModal"));
const EditAccountModal = lazy(() => import("./components/accounts/EditAccountModal"));
const ExportModal = lazy(() => import("./components/stats/ExportModal"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

// --- Memoized or Static Objects ---
const TOASTER_CONTAINER_STYLE = { margin: "8px", zIndex: 999999 };
const TOASTER_OPTIONS = {
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
};

const NOOP_SET_TOKEN = () => {};

function AppRoutes() {
  const location = useLocation();
  const background = location.state && location.state.background;

  return (
    <Suspense
      fallback={
        <CenteredSpinner
          fullHeight
          message="Завантаження ресурсів..."
        />
      }
    >
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
            <Route path="security" element={<Security />} />
            <Route path="users" element={<FamilySettings />} />
            <Route path="categories" element={<Categories />} />
            <Route path="tags" element={<Tags />} />
            <Route path="counterparties" element={<Counterparties />} />
            <Route path="export" element={<Export />} />
          </Route>
        </Route>

        <Route path="login" element={<Login setToken={NOOP_SET_TOKEN} />} />
        <Route path="pin-login" element={<PinLogin />} />
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
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <AuthProvider>
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
                  containerStyle={TOASTER_CONTAINER_STYLE}
                  toastOptions={TOASTER_OPTIONS}
                />
              </HeaderProvider>
            </SettingsProvider>
          </ThemeProvider>
        </SyncProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
;
