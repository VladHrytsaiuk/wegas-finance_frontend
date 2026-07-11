import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import type { Location } from "react-router-dom";
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
import { BootstrapProvider, useBootstrap } from "./context/BootstrapContext";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/ui/AppLayout";
import { AppErrorBoundary } from "./components/ui/AppErrorBoundary";

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
type ModalLocationState = {
  background?: Location;
};

function RouteStageFallback({
  stage,
}: {
  stage: "bootstrap" | "resources";
}) {
  const { setStage } = useBootstrap();

  useEffect(() => {
    setStage(stage);
  }, [setStage, stage]);

  return null;
}

function RouteStageReady({ children }: { children: React.ReactNode }) {
  const { setStage } = useBootstrap();

  useEffect(() => {
    let cancelled = false;

    window.requestAnimationFrame(() => {
      if (!cancelled) {
        setStage("hidden");
        window.dispatchEvent(new Event("app:ready"));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [setStage]);

  return <>{children}</>;
}

function withRouteSuspense(
  element: React.ReactNode,
  stage: "bootstrap" | "resources",
) {
  return (
    <Suspense fallback={<RouteStageFallback stage={stage} />}>
      <RouteStageReady>{element}</RouteStageReady>
    </Suspense>
  );
}

function AppRoutes() {
  const location = useLocation();
  const background = (location.state as ModalLocationState | null)?.background;

  return (
    <AppErrorBoundary resetKey={(background || location).key || location.pathname}>
      <>
        <Routes location={background || location}>
          <Route
            element={
              <ProtectedRoute>
                {withRouteSuspense(<AppLayout />, "resources")}
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={withRouteSuspense(
                <Navigate replace to="dashboard" />,
                "resources",
              )}
            />
            <Route
              path="dashboard"
              element={withRouteSuspense(<Dashboard />, "resources")}
            />
            <Route
              path="accounts"
              element={withRouteSuspense(<Accounts />, "resources")}
            />
            <Route
              path="accounts/:accountId"
              element={withRouteSuspense(<AccountDetails />, "resources")}
            />
            <Route
              path="transactions"
              element={withRouteSuspense(<Transactions />, "resources")}
            />
            <Route
              path="transactions/:transactionId"
              element={withRouteSuspense(<TransactionPage />, "resources")}
            />
            <Route
              path="statistics"
              element={withRouteSuspense(<Statistics />, "resources")}
            />
            <Route
              path="debts"
              element={withRouteSuspense(<Debts />, "resources")}
            />
            <Route
              path="debts/:id"
              element={withRouteSuspense(<DebtorDetails />, "resources")}
            />
            <Route
              path="goals"
              element={withRouteSuspense(<Goals />, "resources")}
            />
            <Route
              path="goals/:id"
              element={withRouteSuspense(<GoalDetails />, "resources")}
            />
            <Route
              path="assets"
              element={withRouteSuspense(<Assets />, "resources")}
            />
            <Route
              path="assets/:id"
              element={withRouteSuspense(<AssetDetails />, "resources")}
            />
            <Route
              path="utility"
              element={withRouteSuspense(<Utility />, "resources")}
            />
            <Route
              path="utility/analytics"
              element={withRouteSuspense(<UtilityAnalyticsPage />, "resources")}
            />
            <Route
              path="utility/:id"
              element={withRouteSuspense(<UtilityDetails />, "resources")}
            />
            <Route
              path="utility/:id/analytics"
              element={withRouteSuspense(
                <UtilityMeterAnalyticsPage />,
                "resources",
              )}
            />
            <Route
              path="shopping"
              element={withRouteSuspense(<Shopping />, "resources")}
            />
            <Route
              path="wishlist"
              element={withRouteSuspense(<WishlistGroups />, "resources")}
            />
            <Route
              path="wishlist/:groupId"
              element={withRouteSuspense(<WishlistItems />, "resources")}
            />
            <Route
              path="investments/dashboard"
              element={withRouteSuspense(<InvestmentDashboard />, "resources")}
            />
            <Route
              path="investments/portfolio"
              element={withRouteSuspense(
                <div>Portfolio (Coming Soon)</div>,
                "resources",
              )}
            />
            <Route
              path="settings"
              element={withRouteSuspense(<SettingsLayout />, "resources")}
            >
              <Route
                index
                element={withRouteSuspense(
                  <Navigate replace to="general" />,
                  "resources",
                )}
              />
              <Route
                path="general"
                element={withRouteSuspense(<General />, "resources")}
              />
              <Route
                path="profile"
                element={withRouteSuspense(<Profile />, "resources")}
              />
              <Route
                path="security"
                element={withRouteSuspense(<Security />, "resources")}
              />
              <Route
                path="users"
                element={withRouteSuspense(<FamilySettings />, "resources")}
              />
              <Route
                path="categories"
                element={withRouteSuspense(<Categories />, "resources")}
              />
              <Route
                path="tags"
                element={withRouteSuspense(<Tags />, "resources")}
              />
              <Route
                path="counterparties"
                element={withRouteSuspense(<Counterparties />, "resources")}
              />
              <Route
                path="export"
                element={withRouteSuspense(<Export />, "resources")}
              />
            </Route>
          </Route>

          <Route
            path="login"
            element={withRouteSuspense(
              <Login setToken={NOOP_SET_TOKEN} />,
              "bootstrap",
            )}
          />
          <Route
            path="pin-login"
            element={withRouteSuspense(<PinLogin />, "bootstrap")}
          />
          <Route
            path="register"
            element={withRouteSuspense(<Register />, "bootstrap")}
          />
          <Route
            path="*"
            element={withRouteSuspense(<PageNotFound />, "bootstrap")}
          />
        </Routes>

        {background && (
          <Routes>
            <Route
              path="transactions/new"
              element={withRouteSuspense(<CreateTransactionModal />, "resources")}
            />
            <Route
              path="transactions/:transactionId/edit"
              element={withRouteSuspense(<EditTransactionModal />, "resources")}
            />
            <Route
              path="accounts/new"
              element={withRouteSuspense(<CreateAccountModal />, "resources")}
            />
            <Route
              path="accounts/:accountId/edit"
              element={withRouteSuspense(<EditAccountModal />, "resources")}
            />
            <Route
              path="statistics/export"
              element={withRouteSuspense(<ExportModal />, "resources")}
            />
          </Routes>
        )}
      </>
    </AppErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <BootstrapProvider>
        <AuthProvider>
          <SyncProvider>
            <ThemeProvider>
              <SettingsProvider>
                <HeaderProvider>
                  <GlobalStyle />
                  <BrowserRouter>
                    <WorkspaceProvider>
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
      </BootstrapProvider>
    </QueryClientProvider>
  );
}

export default App;
