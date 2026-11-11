import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineArrowDownTray,
  HiOutlineArrowRightOnRectangle,
  HiOutlineCog6Tooth,
  HiOutlinePuzzlePiece,
  HiOutlineRectangleGroup,
  HiOutlineShieldCheck,
  HiOutlineTag,
  HiOutlineUserGroup,
  HiOutlineUsers,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { usePageTitle } from "../../../hooks/usePageTitle";
import { useSettingsLayout } from "../../../hooks/Settings/useSettingsLayout";
import { getMeApi, getUsersApi } from "../../../services/apiUsers";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { NavBar } from "../../../mobile/ui/NavBar";
import { LargeTitle } from "../../../mobile/ui/Screen";
import { Tile } from "../../../mobile/ui/Tile";

// Налаштування: профіль зверху, далі розділи. Кожен розділ — окремий екран.

const Page = styled.div.attrs<{ "data-m-screen"?: string }>({
  "data-m-screen": "",
})`
  min-height: 100%;
  background: var(--m-bg);
  color: var(--m-label);
  font-family: var(--m-font);
  -webkit-font-smoothing: antialiased;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 16px 32px;
`;

const Avatar = styled.span`
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-size: 24px;
  font-weight: 600;
  color: var(--m-on-accent);
  background: var(--m-accent);
`;

const icon = (node: ReactNode) => <Tile icon={node} tint="gray" size={30} />;

const ROLE_LABEL: Record<string, string> = {
  admin: "CEO сім'ї",
  member: "Акціонер",
  child: "Стартапер",
};

function MobileSettings() {
  usePageTitle("Налаштування");
  const navigate = useNavigate();
  const { actions } = useSettingsLayout();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: getMeApi });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: getUsersApi });
  const members = Array.isArray(users) ? users.length : 0;

  return (
    <Page>
      <NavBar backLabel="Ще" onBack={() => navigate("/more")} />
      <Body>
        <LargeTitle title="Налаштування" />

        <Group>
          <Row
            to="/settings/profile"
            leading={<Avatar aria-hidden="true">{(me?.name || "?").trim().charAt(0).toUpperCase()}</Avatar>}
            title={me?.name || "Профіль"}
            subtitle={me?.email ? `${me.email}${me.role_id ? ` · ${ROLE_LABEL[me.role_id] ?? ""}` : ""}` : undefined}
            chevron
            inset={84}
          />
        </Group>

        <Group>
          <Row
            to="/settings/users"
            leading={icon(<HiOutlineUserGroup size={18} />)}
            title="Родина"
            trailing={members > 0 ? <Meta>{members}</Meta> : undefined}
            inset={58}
            chevron
          />
          <Row
            to="/settings/integrations"
            leading={icon(<HiOutlinePuzzlePiece size={18} />)}
            title="Інтеграції"
            trailing={<Meta>Monobank, Telegram</Meta>}
            inset={58}
            chevron
          />
        </Group>

        <Section caption="Довідники">
          <Group>
            <Row
              to="/settings/categories"
              leading={icon(<HiOutlineRectangleGroup size={18} />)}
              title="Категорії"
              inset={58}
              chevron
            />
            <Row
              to="/settings/tags"
              leading={icon(<HiOutlineTag size={18} />)}
              title="Теги"
              inset={58}
              chevron
            />
            <Row
              to="/settings/counterparties"
              leading={icon(<HiOutlineUsers size={18} />)}
              title="Контрагенти"
              inset={58}
              chevron
            />
          </Group>
        </Section>

        <Group>
          <Row
            to="/settings/export"
            leading={icon(<HiOutlineArrowDownTray size={18} />)}
            title="Експорт і резервна копія"
            inset={58}
            chevron
          />
          <Row
            to="/settings/general"
            leading={icon(<HiOutlineCog6Tooth size={18} />)}
            title="Загальні"
            trailing={<Meta>Тема, мова, валюта</Meta>}
            inset={58}
            chevron
          />
          <Row
            to="/settings/security"
            leading={icon(<HiOutlineShieldCheck size={18} />)}
            title="Безпека"
            inset={58}
            chevron
          />
        </Group>

        <Group>
          <Row
            onClick={() => setLogoutOpen(true)}
            leading={icon(<HiOutlineArrowRightOnRectangle size={18} />)}
            title={<span style={{ color: "var(--m-destructive, #ff3b30)" }}>Вийти</span>}
            inset={58}
          />
        </Group>
      </Body>

      <ConfirmSheet
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        message="Вийти з акаунта?"
        actions={[{ label: "Вийти", destructive: true, onSelect: actions.handleLogout }]}
      />
    </Page>
  );
}

export default MobileSettings;
