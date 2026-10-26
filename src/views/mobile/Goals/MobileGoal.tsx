import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addMonths, format } from "date-fns";
import { uk } from "date-fns/locale";
import toast from "react-hot-toast";
import styled from "styled-components";
import { HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";

import type { Account } from "../../../types";
import {
  deleteGoalApi,
  getGoalApi,
  updateGoalApi,
  type GoalWithDoneStatus,
} from "../../../services/apiGoals";
import { useSettings } from "../../../context/SettingsContext";
import { useUserRole } from "../../../hooks/useUserRole";
import { formatMoney, getUploadedFileUrl } from "../../../utils/helpers";
import { safeExternalUrl } from "../../../utils/safeUrl";
import { AccountTile } from "../../../mobile/accountTile";
import { Section, Group, Row, Amount, Meta } from "../../../mobile/ui/Group";
import { NavBar, NavButton } from "../../../mobile/ui/NavBar";
import {
  ConfirmSheet,
  type ConfirmAction,
} from "../../../mobile/ui/ConfirmSheet";
import { PrimaryButton, Sheet } from "../../../mobile/ui/Sheet";
import { PhotoViewer } from "../../../mobile/ui/PhotoViewer";
import { Tile } from "../../../mobile/ui/Tile";
import { GoalFormSheet } from "./GoalFormSheet";
import { deadlineLabel, goalStats } from "./goals";

// Ціль: прогрес, прогноз, рахунки-джерела, опис, фото й дії старих GoalCard /
// GoalDetails (пауза, змінити, видалити, продовжити термін).

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
  padding: 8px 16px 32px;
`;

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;

  h2 {
    margin: 6px 0 0;
    font-size: 22px;
    font-weight: 700;
  }
`;

const Photo = styled.button`
  width: 100%;
  padding: 0;
  border: none;
  border-radius: var(--m-radius-card);
  overflow: hidden;
  cursor: zoom-in;

  img {
    display: block;
    width: 100%;
    max-height: 220px;
    object-fit: cover;
  }
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
`;

const Big = styled.strong`
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
`;

const Track = styled.span`
  display: block;
  height: 8px;
  border-radius: 4px;
  background: var(--m-fill);
  overflow: hidden;
`;

const Fill = styled.span<{ $pct: number; $color: string }>`
  display: block;
  height: 100%;
  width: ${(p) => p.$pct}%;
  border-radius: 4px;
  background: ${(p) => p.$color};
`;

const Line = styled.span`
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  color: var(--m-label-2);
  font-variant-numeric: tabular-nums;
`;

const Badge = styled.span<{ $tone: "accent" | "warning" | "muted" }>`
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => (p.$tone === "accent" ? "var(--m-accent)" : p.$tone === "warning" ? "#c2410c" : "var(--m-label-2)")};
  background: ${(p) =>
    p.$tone === "accent"
      ? "var(--m-accent-soft)"
      : p.$tone === "warning"
        ? "#fdf0e6"
        : "var(--m-fill)"};
`;

const Note = styled.p`
  margin: 0;
  padding: 12px 16px;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
  font-size: 16px;
  line-height: 1.4;
  white-space: pre-wrap;
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  min-height: 44px;
  border: none;
  border-radius: 12px;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  color: ${(p) => (p.$primary ? "var(--m-on-accent)" : "var(--m-accent)")};
  background: ${(p) => (p.$primary ? "var(--m-accent)" : "var(--m-accent-soft)")};

  &:disabled {
    opacity: 0.5;
  }
`;

const DestructiveButton = styled.button`
  width: 100%;
  min-height: 48px;
  border: none;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
  font: inherit;
  font-size: 17px;
  color: #ff3b30;
  cursor: pointer;
`;

const DateField = styled.input`
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 17px;
  color: var(--m-label);
  text-align: right;
`;

const Center = styled.p`
  margin: 40vh 0 0;
  text-align: center;
  color: var(--m-label-2);
`;

const FORECAST: Record<string, string> = {
  reached: "Ціль досягнута",
  on_track: "Встигаєте вчасно",
  behind: "Відстаєте від дедлайну",
  no_data: "Мало даних для прогнозу",
};

export default function MobileGoal() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language } = useSettings();
  const { user: me } = useUserRole();
  const [editing, setEditing] = useState(false);
  const [extending, setExtending] = useState(false);
  const [newDeadline, setNewDeadline] = useState(() =>
    format(addMonths(new Date(), 1), "yyyy-MM-dd"),
  );
  const [confirm, setConfirm] = useState<null | {
    message: string;
    actions: ConfirmAction[];
  }>(null);
  const [viewer, setViewer] = useState(false);

  const {
    data: goal,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["goal", id],
    queryFn: () => getGoalApi(id) as Promise<GoalWithDoneStatus>,
    enabled: !!id,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["goal", id] });
    queryClient.invalidateQueries({ queryKey: ["goals"] });
  };
  const update = useMutation({
    // Лише змінені поля: бекенд тепер не чіпає те, чого немає в запиті.
    mutationFn: (changes: Record<string, unknown>) =>
      updateGoalApi({ id, ...changes }),
    onSuccess: () => {
      toast.success("Ціль оновлено");
      setExtending(false);
      refresh();
    },
    onError: () => toast.error("Не вдалося оновити ціль"),
  });
  const remove = useMutation({
    mutationFn: () => deleteGoalApi(id),
    onSuccess: () => {
      toast.success("Ціль видалено");
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      navigate("/goals", { replace: true });
    },
    onError: () => toast.error("Не вдалося видалити ціль"),
  });

  const back = () =>
    window.history.length > 1 ? navigate(-1) : navigate("/goals");

  if (isLoading) {
    return (
      <Page>
        <NavBar backLabel="Цілі" onBack={back} />
        <Center>Завантаження…</Center>
      </Page>
    );
  }
  if (isError || !goal) {
    return (
      <Page>
        <NavBar backLabel="Цілі" onBack={back} />
        <Center>Ціль не знайдено</Center>
      </Page>
    );
  }

  const stats = goalStats(goal);
  const money = (minor: number, cur = goal.currency) =>
    formatMoney(minor, cur, language);
  const photo = getUploadedFileUrl(goal.photo_url);
  const link = safeExternalUrl(goal.external_link);
  const accounts = (goal.accounts ?? []) as Account[];
  const accountsTotal = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const canEdit = !goal.user_id || goal.user_id === me?.id;
  const canPause = goal.status === "active" || goal.status === "paused";
  const tone = stats.isCompleted
    ? "accent"
    : stats.isOverdue || goal.status === "failed"
      ? "warning"
      : "muted";
  const statusText = stats.isCompleted
    ? "Ціль досягнута"
    : stats.isPaused
      ? "На паузі"
      : goal.status === "failed" || stats.isOverdue
        ? "Дедлайн минув"
        : "Активна";

  return (
    <Page>
      <NavBar
        backLabel="Цілі"
        onBack={back}
        trailing={
          canEdit && (
            <NavButton type="button" onClick={() => setEditing(true)}>
              Змінити
            </NavButton>
          )
        }
      />
      <Body>
        {photo && (
          <Photo
            type="button"
            aria-label="Фото цілі"
            onClick={() => setViewer(true)}
          >
            <img src={photo} alt="" />
          </Photo>
        )}
        <Hero>
          {!photo && <Tile iconName={goal.icon} color={goal.color} size={64} />}
          <h2>{goal.name}</h2>
          <Badge $tone={tone}>{statusText}</Badge>
        </Hero>

        <Card>
          <Big>{money(goal.current_amount)}</Big>
          <Track>
            <Fill
              $pct={stats.percentage}
              $color={goal.color || "var(--m-accent)"}
            />
          </Track>
          <Line>
            <span>з {money(goal.target_amount)}</span>
            <span>{Math.round(stats.percentage)}%</span>
          </Line>
          {!stats.isCompleted && (
            <Line>Залишилось зібрати: {money(stats.remaining)}</Line>
          )}
        </Card>

        {canEdit && (
          <Actions>
            {canPause && (
              <ActionButton
                type="button"
                disabled={update.isPending}
                onClick={() =>
                  update.mutate({
                    status: stats.isPaused ? "active" : "paused",
                  })
                }
              >
                {stats.isPaused ? "Відновити" : "Пауза"}
              </ActionButton>
            )}
            {(stats.isOverdue || goal.status === "failed") && (
              <ActionButton
                type="button"
                $primary
                onClick={() => setExtending(true)}
              >
                Продовжити термін
              </ActionButton>
            )}
          </Actions>
        )}

        <Group>
          <Row
            title="Дедлайн"
            trailing={
              <Meta>
                {goal.date_deadline
                  ? format(new Date(goal.date_deadline), "d MMMM yyyy", {
                      locale: uk,
                    })
                  : "Без дедлайну"}
              </Meta>
            }
          />
          {goal.date_deadline && (
            <Row
              title="Днів лишилось"
              trailing={<Meta>{deadlineLabel(goal, stats)}</Meta>}
            />
          )}
          <Row
            title="Прогноз"
            subtitle={
              stats.forecastDate
                ? `Досягнете ${format(stats.forecastDate, "d MMMM yyyy", { locale: uk })}`
                : undefined
            }
            trailing={<Meta>{FORECAST[stats.forecastStatus]}</Meta>}
          />
          {!stats.isCompleted && (
            <Row
              title="Потрібно на день"
              trailing={<Amount>{money(stats.dailyNeeded)}</Amount>}
            />
          )}
        </Group>

        <Section caption="Рахунки">
          <Group>
            {accounts.map((acc) => (
              <Row
                key={acc.id}
                to={`/accounts/${acc.id}`}
                leading={<AccountTile account={acc} size={30} />}
                title={acc.name}
                trailing={<Meta>{money(acc.balance ?? 0, acc.currency)}</Meta>}
                chevron
                inset={58}
              />
            ))}
            {accounts.length > 0 ? (
              <Row
                title="Всього"
                trailing={<Amount>{money(accountsTotal)}</Amount>}
              />
            ) : (
              <Row
                title="Рахунки не прив'язані"
                subtitle="Гроші на цілі рахуються з прив'язаних рахунків"
              />
            )}
          </Group>
        </Section>

        {goal.description && <Note>{goal.description}</Note>}
        {link && (
          <Group>
            <Row
              onClick={() => window.open(link, "_blank", "noopener")}
              leading={
                <HiOutlineArrowTopRightOnSquare
                  size={20}
                  color="var(--m-accent)"
                />
              }
              title="Посилання"
              subtitle={goal.external_link}
              inset={48}
            />
          </Group>
        )}

        {canEdit && (
          <DestructiveButton
            type="button"
            onClick={() =>
              setConfirm({
                message: "Ціль буде видалено. Прив'язані рахунки залишаться.",
                actions: [
                  {
                    label: "Видалити ціль",
                    destructive: true,
                    onSelect: () => remove.mutate(),
                  },
                ],
              })
            }
          >
            Видалити ціль
          </DestructiveButton>
        )}
      </Body>

      {viewer && photo && (
        <PhotoViewer
          urls={[photo]}
          startIndex={0}
          onClose={() => setViewer(false)}
        />
      )}
      <ConfirmSheet
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        message={confirm?.message ?? ""}
        actions={confirm?.actions ?? []}
      />
      <Sheet
        open={extending}
        onOpenChange={setExtending}
        title="Продовжити термін"
        footer={
          <PrimaryButton
            type="button"
            disabled={!newDeadline || update.isPending}
            onClick={() =>
              update.mutate({
                date_deadline: new Date(`${newDeadline}T12:00:00`).getTime(),
                status: "active",
              })
            }
          >
            Зберегти
          </PrimaryButton>
        }
      >
        <Group>
          <Row
            title="Новий дедлайн"
            trailing={
              <DateField
                type="date"
                aria-label="Новий дедлайн"
                min={format(new Date(), "yyyy-MM-dd")}
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
              />
            }
          />
        </Group>
      </Sheet>
      {editing && (
        <GoalFormSheet
          open={editing}
          onOpenChange={(open) => {
            if (!open) {
              setEditing(false);
              refresh();
            }
          }}
          editingGoal={goal}
        />
      )}
    </Page>
  );
}
