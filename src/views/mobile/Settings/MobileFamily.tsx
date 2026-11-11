import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { HiOutlineLink, HiPlus } from "react-icons/hi2";
import styled from "styled-components";

import { usePageTitle } from "../../../hooks/usePageTitle";
import { useUserRole } from "../../../hooks/useUserRole";
import { useWebSocketAuth } from "../../../hooks/useWebSocketAuth";
import { getUsersApi, type UserProfile } from "../../../services/apiUsers";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { ScreenState } from "../../../mobile/ui/Loader";
import { NavButton } from "../../../mobile/ui/NavBar";
import { Tile } from "../../../mobile/ui/Tile";
import { InviteSheet } from "./InviteSheet";
import { JoinSheet } from "./JoinSheet";
import { MemberSheet } from "./MemberSheet";
import { SettingsScreen } from "./SettingsScreen";
import { roleOf } from "./family";

// Родина: учасники з ролями; адмін додає (вручну чи за кодом), змінює й вилучає.

const Avatar = styled.span<{ $color: string }>`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-size: 17px;
  font-weight: 600;
  color: ${(p) => p.$color};
  background: ${(p) => p.$color}24;
`;

const Empty = styled.p`
  margin: 0;
  padding: 24px 16px;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
  text-align: center;
  font-size: 15px;
  color: var(--m-label-2);
`;

export default function MobileFamily() {
  usePageTitle("Родина");
  const queryClient = useQueryClient();
  const { user: me, canManageTeam } = useUserRole();
  const [addChoice, setAddChoice] = useState(false);
  const [adding, setAdding] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [editing, setEditing] = useState<UserProfile | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ["users"], queryFn: getUsersApi });
  const members = Array.isArray(data) ? data : [];

  // Хтось приєднався за кодом — оновлюємо список і закриваємо код.
  const onMessage = useCallback(
    (msg: { type?: string }) => {
      if (msg.type === "member_joined") {
        toast.success("Новий учасник приєднався!");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        setInviting(false);
      }
    },
    [queryClient],
  );
  useWebSocketAuth(onMessage);

  return (
    <SettingsScreen
      title="Родина"
      trailing={
        canManageTeam ? (
          <NavButton type="button" aria-label="Додати учасника" onClick={() => setAddChoice(true)}>
            <HiPlus size={24} />
          </NavButton>
        ) : undefined
      }
    >
      {isLoading ? (
        <ScreenState loading>Завантаження…</ScreenState>
      ) : members.length === 0 ? (
        <Empty>Родина порожня</Empty>
      ) : (
        <Section caption={`Учасники · ${members.length}`}>
          <Group>
            {members.map((member) => {
              const role = roleOf(member.role_id);
              const self = member.id === me?.id;
              return (
                <Row
                  key={member.id}
                  onClick={canManageTeam ? () => setEditing(member) : undefined}
                  leading={
                    <Avatar $color={role.color} aria-hidden="true">
                      {(member.name || "?").trim().charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  title={self ? `${member.name} (ви)` : member.name}
                  subtitle={member.email}
                  trailing={<Meta>{role.label}</Meta>}
                  chevron={canManageTeam}
                  inset={68}
                />
              );
            })}
          </Group>
        </Section>
      )}

      <Group>
        <Row
          onClick={() => setJoining(true)}
          leading={<Tile icon={<HiOutlineLink size={18} />} tint="gray" size={30} />}
          title="Приєднатися до родини за кодом"
          inset={58}
          chevron
        />
      </Group>

      <ConfirmSheet
        open={addChoice}
        onOpenChange={setAddChoice}
        message="Додати учасника"
        actions={[
          { label: "Запросити за кодом", onSelect: () => setInviting(true) },
          { label: "Створити вручну", onSelect: () => setAdding(true) },
        ]}
      />
      {adding && <MemberSheet open={adding} onOpenChange={(open) => !open && setAdding(false)} />}
      {editing && (
        <MemberSheet
          key={editing.id}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          member={editing}
          isSelf={editing.id === me?.id}
        />
      )}
      {inviting && <InviteSheet open={inviting} onOpenChange={(open) => !open && setInviting(false)} familyId={me?.family_id} />}
      {joining && <JoinSheet open={joining} onOpenChange={(open) => !open && setJoining(false)} />}
    </SettingsScreen>
  );
}
