import { useState } from "react";
import styled from "styled-components";
import { HiOutlineUsers, HiNoSymbol, HiKey, HiArrowRightOnRectangle } from "react-icons/hi2";
import { useAdminUsers, useAdminUsersMutations } from "../../hooks/Admin/useAdminUsers";
import { useDebounce } from "../../hooks/useDebounce";

const Page = styled.section`width:100%;max-width:1180px;margin:0 auto;`;
const PageHeader = styled.header`
  display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;
  padding: .5rem 0 1.75rem;
  h1{margin:0;color:var(--color-text-main);font-size:1.55rem;line-height:1.2}
  p{margin:.5rem 0 0;color:var(--color-text-secondary);font-size:.92rem}
`;
const Eyebrow = styled.div`display:flex;align-items:center;gap:.45rem;margin-bottom:.55rem;color:var(--color-brand-700);font-size:.72rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;svg{width:16px;height:16px}`;

const Panel = styled.section`background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:16px;box-shadow:var(--shadow-sm);overflow:hidden;`;
const Toolbar = styled.div`display:flex;align-items:center;gap:1rem;padding:.8rem 1rem;border-bottom:1px solid var(--color-border);`;
const Search = styled.label`
  display:flex;align-items:center;gap:.55rem;flex:1;max-width:380px;padding:.52rem .7rem;border:1px solid var(--color-border);border-radius:9px;color:var(--color-text-tertiary);background:var(--color-bg-page);
  input{width:100%;border:0;outline:0;background:transparent;color:var(--color-text-main);font:inherit;font-size:.84rem;}
`;
const Empty = styled.div`min-height:280px;display:flex;align-items:center;justify-content:center;color:var(--color-text-secondary);`;

const Table = styled.table`width:100%;border-collapse:collapse;text-align:left;font-size:.86rem;`;
const Th = styled.th`padding:.7rem 1rem;border-bottom:1px solid var(--color-border);color:var(--color-text-secondary);font-weight:600;`;
const Td = styled.td`padding:.8rem 1rem;border-bottom:1px solid var(--color-border);color:var(--color-text-main);vertical-align:middle;`;
const Tr = styled.tr`&:last-child ${Td}{border-bottom:0;}&:hover{background:var(--color-bg-page);}`;
const ActionBtn = styled.button`
  display:inline-flex;align-items:center;gap:.3rem;padding:.35rem .6rem;border:1px solid var(--color-border);border-radius:6px;background:var(--color-bg-surface);color:var(--color-text-secondary);font:inherit;font-size:.75rem;font-weight:600;cursor:pointer;
  &:hover{background:var(--color-bg-hover);color:var(--color-text-main);}
`;
const StatusBadge = styled.span<{ $active: boolean }>`
  display:inline-block;padding:.2rem .5rem;border-radius:999px;font-size:.72rem;font-weight:700;
  background:${p => p.$active ? "var(--color-success-100,#dcfce7)" : "var(--color-danger-100,#fee2e2)"};
  color:${p => p.$active ? "var(--color-success-700,#15803d)" : "var(--color-danger-700,#b91c1c)"};
`;
const AdminBadge = styled.span`
  display:inline-block;margin-left:.5rem;padding:.15rem .4rem;border-radius:4px;font-size:.65rem;font-weight:800;background:var(--color-brand-100);color:var(--color-brand-700);
`;
const ErrorMessage = styled.div`
  color: var(--color-danger-600);
  background: var(--color-danger-100);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin: 1rem;
`;
const UserName = styled.div`font-weight: 600;`;
const UserEmail = styled.div`font-size: .75rem; color: var(--color-text-secondary);`;
const ActionsContainer = styled.div`display: flex; gap: .5rem;`;
const Pagination = styled.div`display:flex;align-items:center;justify-content:space-between;padding:1rem;border-top:1px solid var(--color-border);`;
const PageInfo = styled.div`font-size:.85rem;color:var(--color-text-secondary);`;
const PageButtons = styled.div`display:flex;gap:.5rem;`;
const PageBtn = styled.button`padding:.4rem .8rem;border:1px solid var(--color-border);border-radius:6px;background:var(--color-bg-surface);color:var(--color-text-main);font:inherit;font-size:.8rem;font-weight:600;cursor:pointer;&:disabled{opacity:0.5;cursor:not-allowed;}&:not(:disabled):hover{background:var(--color-bg-hover);}`;

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const debouncedSearch = useDebounce(search, 300);
  
  const limit = 50;
  const { data, isLoading, isError } = useAdminUsers(limit, offset, debouncedSearch);
  const { toggleBlock, forceLogout, setRole } = useAdminUsersMutations();
  const isAnyMutationPending = toggleBlock.isPending || forceLogout.isPending || setRole.isPending;

  return (
    <Page>
      <PageHeader>
        <div>
          <Eyebrow><HiOutlineUsers /> Platform admin</Eyebrow>
          <h1>Користувачі та доступ</h1>
          <p>Керування обліковими записами, блокування та надання прав.</p>
        </div>
      </PageHeader>
      
      <Panel>
        <Toolbar>
          <Search>
            <input 
              value={search} 
              onChange={e => {
                setSearch(e.target.value);
                setOffset(0);
              }} 
              placeholder="Пошук за email або ім'ям..." 
            />
          </Search>
        </Toolbar>
        
        {isError && <ErrorMessage>Помилка при завантаженні користувачів.</ErrorMessage>}

        {isLoading ? <Empty>Завантаження...</Empty> : data?.users?.length ? (
          <Table>
            <thead>
              <tr>
                <Th>Ім'я / Email</Th>
                <Th>Сім'я</Th>
                <Th>Статус</Th>
                <Th>Дії</Th>
              </tr>
            </thead>
            <tbody>
              {data.users.map(user => (
                <Tr key={user.id}>
                  <Td>
                    <UserName>
                      {user.name} {user.is_platform_admin && <AdminBadge>ADMIN</AdminBadge>}
                    </UserName>
                    <UserEmail>{user.email}</UserEmail>
                  </Td>
                  <Td>{user.family?.name || "—"}</Td>
                  <Td><StatusBadge $active={user.is_active}>{user.is_active ? "Активний" : "Заблокований"}</StatusBadge></Td>
                  <Td>
                    <ActionsContainer>
                      <ActionBtn 
                        disabled={isAnyMutationPending}
                        onClick={() => {
                          if (confirm(`Ви впевнені, що хочете ${user.is_active ? 'заблокувати' : 'розблокувати'} користувача ${user.email}?`)) {
                            toggleBlock.mutate(user.id);
                          }
                        }}>
                        <HiNoSymbol /> {user.is_active ? "Block" : "Unblock"}
                      </ActionBtn>
                      <ActionBtn 
                        disabled={isAnyMutationPending}
                        onClick={() => {
                          if (confirm(`Примусово розлогінити ${user.email} на всіх пристроях?`)) {
                            forceLogout.mutate(user.id);
                          }
                        }}>
                        <HiArrowRightOnRectangle /> Logout
                      </ActionBtn>
                      <ActionBtn 
                        disabled={isAnyMutationPending}
                        onClick={() => {
                          if (confirm(`Надати/забрати права Platform Admin для ${user.email}?`)) {
                            setRole.mutate({ id: user.id, is_platform_admin: !user.is_platform_admin });
                          }
                        }}>
                        <HiKey /> {user.is_platform_admin ? "Revoke Admin" : "Make Admin"}
                      </ActionBtn>
                    </ActionsContainer>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : <Empty>Нічого не знайдено.</Empty>}

        {data && (
          <Pagination>
            <PageInfo>
              Показано {offset + 1} - {Math.min(offset + limit, data.total)} з {data.total}
            </PageInfo>
            <PageButtons>
              <PageBtn disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>Попередня</PageBtn>
              <PageBtn disabled={offset + limit >= data.total} onClick={() => setOffset(offset + limit)}>Наступна</PageBtn>
            </PageButtons>
          </Pagination>
        )}
      </Panel>
    </Page>
  );
}
