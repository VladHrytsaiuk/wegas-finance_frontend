import styled from "styled-components";
import {
  HiOutlineChartBarSquare,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineBanknotes,
  HiOutlineInbox,
  HiOutlineExclamationTriangle,
  HiOutlineBoltSlash,
} from "react-icons/hi2";
import { useAdminOverview, useAdminOverviewMutations } from "../../hooks/Admin/useAdminOverview";

// --- STYLES ---
const Page = styled.section`
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
`;

const PageHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0 1.75rem;

  h1 {
    margin: 0;
    color: var(--color-text-main);
    font-size: 1.55rem;
    line-height: 1.2;
  }
  p {
    margin: 0.5rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.92rem;
  }
`;

const Eyebrow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.55rem;
  color: var(--color-brand-700);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.2rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div<{ $isWarning?: boolean }>`
  background: var(--color-bg-surface);
  border: 1px solid ${(p) => (p.$isWarning ? "var(--color-danger-500, #ef4444)" : "var(--color-border)")};
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;

  ${(p) =>
    p.$isWarning &&
    `
    background: linear-gradient(135deg, var(--color-bg-surface) 0%, rgba(239, 68, 68, 0.05) 100%);
  `}
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-weight: 600;

  svg {
    width: 24px;
    height: 24px;
    color: var(--color-text-tertiary);
  }
`;

const StatValue = styled.div<{ $isWarning?: boolean }>`
  font-size: 2.2rem;
  font-weight: 800;
  color: ${(p) => (p.$isWarning ? "var(--color-danger-600, #dc2626)" : "var(--color-text-main)")};
  line-height: 1;
`;

const StatSubtitle = styled.div`
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
`;

const MaintenanceCard = styled.div<{ $isActive: boolean }>`
  background: ${(p) =>
    p.$isActive
      ? "linear-gradient(135deg, var(--color-danger-600, #dc2626), var(--color-danger-700, #b91c1c))"
      : "var(--color-bg-surface)"};
  border: 1px solid ${(p) => (p.$isActive ? "transparent" : "var(--color-border)")};
  border-radius: 16px;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
  color: ${(p) => (p.$isActive ? "#fff" : "var(--color-text-main)")};
`;

const MaintenanceInfo = styled.div`
  h2 {
    margin: 0 0 0.4rem;
    font-size: 1.2rem;
  }
  p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

const ToggleSwitch = styled.button<{ $isActive: boolean }>`
  width: 56px;
  height: 32px;
  border-radius: 999px;
  background: ${(p) => (p.$isActive ? "#fff" : "var(--color-border)")};
  border: none;
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
  position: relative;
  transition: background 0.3s;
  opacity: ${(p) => (p.disabled ? 0.6 : 1)};

  &::after {
    content: "";
    position: absolute;
    top: 4px;
    left: ${(p) => (p.$isActive ? "28px" : "4px")};
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${(p) => (p.$isActive ? "var(--color-danger-600, #dc2626)" : "#fff")};
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const LoadingEmpty = styled.div`
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
`;

const ErrorMessage = styled.div`
  color: var(--color-danger-600);
  background: var(--color-danger-100);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
`;

export default function AdminOverview() {
  const { data, isLoading, isError } = useAdminOverview();
  const { toggleMaintenance } = useAdminOverviewMutations();

  const handleToggleMaintenance = () => {
    if (!data) return;
    const isCurrentlyMaintenance = !!data.maintenance_mode;
    
    const message = isCurrentlyMaintenance
      ? "Вимкнути Maintenance Mode? Користувачі знову зможуть заходити."
      : "Увімкнути Maintenance Mode? Всі звичайні користувачі побачать заглушку, API буде недоступне.";
      
    if (confirm(message)) {
      toggleMaintenance.mutate(!isCurrentlyMaintenance);
    }
  };

  if (isLoading) {
    return (
      <Page>
        <LoadingEmpty>Завантаження даних...</LoadingEmpty>
      </Page>
    );
  }

  if (isError) {
    return (
      <Page>
        <ErrorMessage>Помилка при завантаженні статистики.</ErrorMessage>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader>
        <div>
          <Eyebrow>
            <HiOutlineChartBarSquare /> Platform admin
          </Eyebrow>
          <h1>Огляд системи</h1>
          <p>Ключові показники WeGaS Finance, статистика та керування станом.</p>
        </div>
      </PageHeader>

      <DashboardGrid>
        <StatCard>
          <StatHeader>
            Користувачі
            <HiOutlineUsers />
          </StatHeader>
          <StatValue>{data?.total_users || 0}</StatValue>
          <StatSubtitle>
            + {data?.new_users_7_days || 0} за останні 7 днів
          </StatSubtitle>
        </StatCard>

        <StatCard>
          <StatHeader>
            Сім'ї
            <HiOutlineUserGroup />
          </StatHeader>
          <StatValue>{data?.total_families || 0}</StatValue>
          <StatSubtitle>
            Зареєстровано в системі
          </StatSubtitle>
        </StatCard>

        <StatCard>
          <StatHeader>
            Транзакції
            <HiOutlineBanknotes />
          </StatHeader>
          <StatValue>{data?.total_transactions || 0}</StatValue>
          <StatSubtitle>
            Всього створено записів
          </StatSubtitle>
        </StatCard>

        <StatCard>
          <StatHeader>
            Чеки в Inbox
            <HiOutlineInbox />
          </StatHeader>
          <StatValue>{data?.total_inbox_entries || 0}</StatValue>
          <StatSubtitle>
            Очікують або оброблені
          </StatSubtitle>
        </StatCard>
      </DashboardGrid>

      <h3>Проблемні зони</h3>
      <DashboardGrid>
        <StatCard $isWarning={(data?.inbox_parse_errors || 0) > 0}>
          <StatHeader>
            Помилки чеків
            <HiOutlineExclamationTriangle />
          </StatHeader>
          <StatValue $isWarning={(data?.inbox_parse_errors || 0) > 0}>
            {data?.inbox_parse_errors || 0}
          </StatValue>
          <StatSubtitle>
            Потребують ручного рев'ю
          </StatSubtitle>
        </StatCard>

        <StatCard $isWarning={(data?.failed_monobank || 0) > 0}>
          <StatHeader>
            Збої Monobank
            <HiOutlineBoltSlash />
          </StatHeader>
          <StatValue $isWarning={(data?.failed_monobank || 0) > 0}>
            {data?.failed_monobank || 0}
          </StatValue>
          <StatSubtitle>
            Синхронізація &gt; 24 год тому
          </StatSubtitle>
        </StatCard>
      </DashboardGrid>

      <h3>Керування</h3>
      <MaintenanceCard $isActive={!!data?.maintenance_mode}>
        <MaintenanceInfo>
          <h2>Технічне обслуговування (Maintenance Mode)</h2>
          <p>
            {data?.maintenance_mode
              ? "Увага! Додаток наразі заблокований для звичайних користувачів."
              : "Система працює в штатному режимі. Доступ відкрито для всіх."}
          </p>
        </MaintenanceInfo>

        <ToggleSwitch
          $isActive={!!data?.maintenance_mode}
          onClick={handleToggleMaintenance}
          disabled={toggleMaintenance.isPending}
          title="Toggle Maintenance Mode"
        />
      </MaintenanceCard>
    </Page>
  );
}
