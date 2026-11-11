import { useProfileForm } from "../../../hooks/Settings/useProfile";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { RowInput } from "../../../mobile/ui/Field";
import { Group, Row } from "../../../mobile/ui/Group";
import { ScreenState } from "../../../mobile/ui/Loader";
import { PrimaryButton } from "../../../mobile/ui/Sheet";
import { SettingsScreen } from "./SettingsScreen";

// Профіль: ім'я й email.

export default function MobileProfile() {
  usePageTitle("Профіль");
  const { state, actions } = useProfileForm();
  const { name, email, isLoading, isUpdating, user } = state;
  const changed = name !== (user?.name ?? "") || email !== (user?.email ?? "");
  const valid = name.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <SettingsScreen title="Профіль">
      {isLoading ? (
        <ScreenState loading>Завантаження…</ScreenState>
      ) : (
        <form onSubmit={actions.handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Group>
            <Row
              title="Ім'я"
              trailing={
                <RowInput
                  aria-label="Ім'я"
                  value={name}
                  autoComplete="name"
                  onChange={(e) => actions.setName(e.target.value)}
                  disabled={isUpdating}
                />
              }
            />
            <Row
              title="Email"
              trailing={
                <RowInput
                  aria-label="Email"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => actions.setEmail(e.target.value)}
                  disabled={isUpdating}
                />
              }
            />
          </Group>
          <PrimaryButton type="submit" disabled={!changed || !valid || isUpdating}>
            Зберегти
          </PrimaryButton>
        </form>
      )}
    </SettingsScreen>
  );
}
