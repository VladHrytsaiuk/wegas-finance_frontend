import styled from "styled-components";
import { HiOutlineShieldCheck, HiCog6Tooth } from "react-icons/hi2";
import { useAdminAuditLogs, useAdminSettings, useAdminSettingsMutations } from "../../hooks/Admin/useAdminUsers";

const Page = styled.section`width:100%;max-width:1180px;margin:0 auto;`;
const PageHeader = styled.header`
  display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;
  padding: .5rem 0 1.75rem;
  h1{margin:0;color:var(--color-text-main);font-size:1.55rem;line-height:1.2}
  p{margin:.5rem 0 0;color:var(--color-text-secondary);font-size:.92rem}
`;
const Eyebrow = styled.div`display:flex;align-items:center;gap:.45rem;margin-bottom:.55rem;color:var(--color-brand-700);font-size:.72rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;svg{width:16px;height:16px}`;

const Panel = styled.section`background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:16px;box-shadow:var(--shadow-sm);overflow:hidden;margin-bottom:2rem;`;
const PanelHeader = styled.div`padding:1.2rem 1.5rem;border-bottom:1px solid var(--color-border);display:flex;align-items:center;gap:.5rem;font-weight:700;font-size:1.1rem;svg{color:var(--color-text-tertiary)}`;
const PanelBody = styled.div`padding:1.5rem;`;

const SettingRow = styled.div`display:flex;align-items:center;justify-content:space-between;padding:1rem 0;border-bottom:1px solid var(--color-border);&:last-child{border-bottom:0;padding-bottom:0;}`;
const SettingInfo = styled.div`
  h4{margin:0 0 .25rem;font-size:.95rem;color:var(--color-text-main);}
  p{margin:0;font-size:.8rem;color:var(--color-text-secondary);}
`;

const Empty = styled.div`min-height:200px;display:flex;align-items:center;justify-content:center;color:var(--color-text-secondary);`;

const Table = styled.table`width:100%;border-collapse:collapse;text-align:left;font-size:.86rem;`;
const Th = styled.th`padding:.7rem 1rem;border-bottom:1px solid var(--color-border);color:var(--color-text-secondary);font-weight:600;`;
const Td = styled.td`padding:.8rem 1rem;border-bottom:1px solid var(--color-border);color:var(--color-text-main);vertical-align:top;`;
const Tr = styled.tr`&:last-child ${Td}{border-bottom:0;}&:hover{background:var(--color-bg-page);}`;

const ToggleBtn = styled.button<{ $active: boolean }>`
  padding:.5rem 1rem;border-radius:8px;font-weight:600;font-size:.85rem;cursor:pointer;
  border:1px solid ${p => p.$active ? "var(--color-danger-300)" : "var(--color-border)"};
  background:${p => p.$active ? "var(--color-danger-100)" : "var(--color-bg-surface)"};
  color:${p => p.$active ? "var(--color-danger-700)" : "var(--color-text-main)"};
  &:hover{filter:brightness(.95)}
`;

export default function AdminAudit() {
  const { data: logsData, isLoading: logsLoading, isError: logsError } = useAdminAuditLogs(50, 0);
  const { data: settingsData, isLoading: settingsLoading, isError: settingsError } = useAdminSettings();
  const { setMaintenanceMode } = useAdminSettingsMutations();

  const isMaintenanceMode = settingsData?.["maintenance_mode"] === "true";

  return (
    <Page>
      <PageHeader>
        <div>
          <Eyebrow><HiOutlineShieldCheck /> Platform admin</Eyebrow>
          <h1>Аудит та налаштування</h1>
          <p>Системний лог дій адміністраторів та глобальні перемикачі.</p>
        </div>
      </PageHeader>
      
      <Panel>
        <PanelHeader><HiCog6Tooth /> Глобальні налаштування</PanelHeader>
        <PanelBody>
          {settingsLoading ? <p>Завантаження...</p> : settingsError ? <p style={{ color: "var(--color-danger-600)" }}>Помилка завантаження налаштувань.</p> : (
            <SettingRow>
              <SettingInfo>
                <h4>Режим обслуговування (Maintenance Mode)</h4>
                <p>Якщо увімкнено, всі користувачі крім Platform Admins будуть бачити сторінку технічних робіт.</p>
              </SettingInfo>
              <ToggleBtn 
                $active={isMaintenanceMode} 
                disabled={setMaintenanceMode.isPending}
                style={{ opacity: setMaintenanceMode.isPending ? 0.6 : 1 }}
                onClick={() => {
                  if (confirm(isMaintenanceMode ? 'Вимкнути maintenance mode?' : 'Увімкнути maintenance mode? Всі звичайні користувачі не зможуть користуватись додатком!')) {
                    setMaintenanceMode.mutate(!isMaintenanceMode);
                  }
                }}
              >
                {isMaintenanceMode ? "Вимкнути" : "Увімкнути"}
              </ToggleBtn>
            </SettingRow>
          )}
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader><HiOutlineShieldCheck /> Журнал аудиту (Audit Log)</PanelHeader>
        {logsError && <p style={{ padding: '1.5rem', color: 'var(--color-danger-600)', background: 'var(--color-danger-100)', textAlign: 'center', margin: '1rem', borderRadius: '8px' }}>Помилка при завантаженні журналів.</p>}
        {logsLoading ? <Empty>Завантаження...</Empty> : logsData?.logs?.length ? (
          <Table>
            <thead>
              <tr>
                <Th>Час</Th>
                <Th>Адмін</Th>
                <Th>Дія</Th>
                <Th>Об'єкт</Th>
                <Th>Деталі</Th>
              </tr>
            </thead>
            <tbody>
              {logsData.logs.map(log => (
                <Tr key={log.id}>
                  <Td style={{ whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString()}</Td>
                  <Td>{log.admin?.email}</Td>
                  <Td style={{ fontWeight: 600 }}>{log.action}</Td>
                  <Td>{log.entity_type} <span style={{ color: 'var(--color-text-tertiary)', fontSize: '.75rem' }}>{log.entity_id}</span></Td>
                  <Td>
                    <pre style={{ margin: 0, fontSize: '.75rem', color: 'var(--color-text-secondary)', maxWidth: '300px', overflowX: 'auto' }}>
                      {log.changes}
                    </pre>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : <Empty>Логів поки немає.</Empty>}
      </Panel>
    </Page>
  );
}
