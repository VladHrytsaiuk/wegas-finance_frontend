import { NavLink } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineChartBarSquare,
  HiOutlineFolder,
  HiOutlineBuildingStorefront,
  HiOutlineUsers,
  HiOutlineBuildingLibrary,
  HiOutlineScale,
  HiOutlineClipboardDocumentCheck,
} from "react-icons/hi2";

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Heading = styled.p<{ $collapsed: boolean }>`
  margin: 0 0 0.7rem;
  padding: 0 0.65rem;
  color: var(--color-text-tertiary);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: ${(p) => (p.$collapsed ? 0 : 1)};
`;

const Item = styled(NavLink)<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 42px;
  padding: 0 0.7rem;
  color: var(--color-text-secondary);
  border-radius: 10px;
  font-size: 0.86rem;
  font-weight: 600;
  overflow: hidden;
  text-decoration: none;

  svg { flex: 0 0 20px; width: 20px; height: 20px; }
  span { white-space: nowrap; opacity: ${(p) => (p.$collapsed ? 0 : 1)}; transition: opacity .2s; }
  &:hover { background: var(--color-bg-page); color: var(--color-text-main); }
  &.active { color: var(--color-brand-700); background: var(--color-brand-50); }
`;

const FutureItem = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 42px;
  padding: 0 0.7rem;
  color: var(--color-text-tertiary);
  font-size: 0.86rem;
  font-weight: 600;
  opacity: .58;
  cursor: not-allowed;
  svg { flex: 0 0 20px; width: 20px; height: 20px; }
  span { white-space: nowrap; opacity: ${(p) => (p.$collapsed ? 0 : 1)}; transition: opacity .2s; }
`;

const currentItems = [
  { to: "/admin", label: "Огляд", icon: HiOutlineChartBarSquare, end: true },
  { to: "/admin/categories", label: "Категорії", icon: HiOutlineFolder },
  { to: "/admin/counterparties", label: "Контрагенти", icon: HiOutlineBuildingStorefront },
  { to: "/admin/users", label: "Користувачі", icon: HiOutlineUsers },
  { to: "/admin/audit", label: "Аудит", icon: HiOutlineClipboardDocumentCheck },
];

const futureItems = [
  { label: "Банки", icon: HiOutlineBuildingLibrary },
  { label: "Одиниці виміру", icon: HiOutlineScale },
];

export function AdminNav({ isCollapsed }: { isCollapsed: boolean }) {
  return <Nav>
    <Heading $collapsed={isCollapsed}>Platform admin</Heading>
    {currentItems.map(({ to, label, icon: Icon, end }) => (
      <Item key={to} to={to} end={end} $collapsed={isCollapsed} title={isCollapsed ? label : undefined}>
        <Icon />
        <span>{label}</span>
      </Item>
    ))}
    <Heading $collapsed={isCollapsed} style={{ marginTop: "1.4rem" }}>Незабаром</Heading>
    {futureItems.map(({ label, icon: Icon }) => (
      <FutureItem key={label} $collapsed={isCollapsed} title={`${label} — незабаром`}>
        <Icon />
        <span>{label}</span>
      </FutureItem>
    ))}
  </Nav>;
}
