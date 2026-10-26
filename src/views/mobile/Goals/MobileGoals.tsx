import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HiPlus } from "react-icons/hi2";
import styled from "styled-components";

import {
  getGoalsApi,
  type GoalWithDoneStatus,
} from "../../../services/apiGoals";
import { useSettings } from "../../../context/SettingsContext";
import { formatMoney, getUploadedFileUrl } from "../../../utils/helpers";
import {
  Group,
  Row,
  Meta,
  Section,
} from "../../../mobile/ui/Group";
import { NavBar, NavButton } from "../../../mobile/ui/NavBar";
import { LargeTitle } from "../../../mobile/ui/Screen";
import { SearchField } from "../../../mobile/ui/SearchField";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { Tile } from "../../../mobile/ui/Tile";
import { GoalFormSheet } from "./GoalFormSheet";
import {
  deadlineLabel,
  filterGoals,
  GOAL_SORTS,
  type GoalSort,
  type GoalStats,
  type GoalStatusFilter,
} from "./goals";

// Цілі: прогрес, дедлайн, пошук, фільтри й сортування старої сторінки.

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

const Chips = styled.div`
  display: flex;
  gap: 8px;
  margin: 0 -16px;
  padding: 0 16px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Chip = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  height: 32px;
  padding: 0 14px;
  border: none;
  border-radius: 16px;
  font: inherit;
  font-size: 15px;
  white-space: nowrap;
  cursor: pointer;
  color: ${(p) => (p.$active ? "var(--m-on-accent)" : "var(--m-label)")};
  background: ${(p) => (p.$active ? "var(--m-accent)" : "var(--m-surface)")};
`;

const Progress = styled.span`
  display: block;
  width: 100%;
  height: 6px;
  margin: 6px 0 4px;
  border-radius: 3px;
  background: var(--m-fill);
  overflow: hidden;
`;

const ProgressFill = styled.span<{ $pct: number; $color: string }>`
  display: block;
  height: 100%;
  width: ${(p) => p.$pct}%;
  border-radius: 3px;
  background: ${(p) => p.$color};
`;

const Sub = styled.span`
  display: flex;
  flex-direction: column;
`;

const Badge = styled(Meta)<{ $tone: "accent" | "warning" | "muted" }>`
  font-weight: 600;
  color: ${(p) => (p.$tone === "accent" ? "var(--m-accent)" : p.$tone === "warning" ? "#c2410c" : "var(--m-label-2)")};
`;

const SortButton = styled.button.attrs({ type: "button" })`
  padding: 0;
  color: var(--m-accent);
  border: none;
  background: none;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
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

const STATUS_FILTERS: { value: GoalStatusFilter; label: string }[] = [
  { value: "all", label: "Усі" },
  { value: "active", label: "Активні" },
  { value: "reached", label: "Досягнуті" },
  { value: "paused", label: "На паузі" },
  { value: "failed", label: "Невдалі" },
];

const tone = (goal: GoalWithDoneStatus, stats: GoalStats) =>
  stats.isCompleted
    ? "accent"
    : stats.isOverdue || goal.status === "failed" || stats.isUrgent
      ? "warning"
      : "muted";

export default function MobileGoals() {
  const navigate = useNavigate();
  const { language } = useSettings();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<GoalStatusFilter>("all");
  const [currency, setCurrency] = useState("");
  const [sort, setSort] = useState<GoalSort>("deadline-asc");
  const [sortOpen, setSortOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: getGoalsApi,
  });
  const currencies = useMemo(
    () => [...new Set(goals.map((g) => g.currency))].sort(),
    [goals],
  );
  const visible = useMemo(
    () => filterGoals(goals, { query, status, currency, sort }),
    [goals, query, status, currency, sort],
  );

  return (
    <Page>
      <NavBar
        backLabel="Ще"
        onBack={() => navigate("/more")}
        trailing={
          <NavButton
            type="button"
            aria-label="Нова ціль"
            onClick={() => setCreating(true)}
          >
            <HiPlus size={24} />
          </NavButton>
        }
      />
      <Body>
        <LargeTitle title="Цілі" />

        {goals.length > 0 && (
          <>
            <SearchField
              value={query}
              onChange={setQuery}
              label="Пошук цілей"
            />
            <Chips role="group" aria-label="Статус">
              {STATUS_FILTERS.map((f) => (
                <Chip
                  key={f.value}
                  type="button"
                  $active={status === f.value}
                  onClick={() => setStatus(f.value)}
                >
                  {f.label}
                </Chip>
              ))}
              {currencies.length > 1 &&
                currencies.map((cur) => (
                  <Chip
                    key={cur}
                    type="button"
                    $active={currency === cur}
                    onClick={() => setCurrency(currency === cur ? "" : cur)}
                  >
                    {cur}
                  </Chip>
                ))}
            </Chips>
          </>
        )}

        {visible.length > 0 && (
          <Section
            caption={`Цілі · ${visible.length}`}
            action={
              <SortButton onClick={() => setSortOpen(true)}>
                {GOAL_SORTS.find((s) => s.value === sort)?.label}
              </SortButton>
            }
          >
            <Group>
              {visible.map(({ goal, stats }) => {
                const photo = getUploadedFileUrl(goal.photo_url);
                return (
                  <Row
                    key={goal.id}
                    to={`/goals/${goal.id}`}
                    leading={
                      <Tile
                        logo={photo}
                        iconName={goal.icon}
                        color={goal.color}
                        size={44}
                      />
                    }
                    title={goal.name}
                    subtitle={
                      <Sub>
                        <Progress>
                          <ProgressFill
                            $pct={stats.percentage}
                            $color={goal.color || "var(--m-accent)"}
                          />
                        </Progress>
                        {formatMoney(
                          goal.current_amount,
                          goal.currency,
                          language,
                        )}{" "}
                        з{" "}
                        {formatMoney(
                          goal.target_amount,
                          goal.currency,
                          language,
                        )}
                      </Sub>
                    }
                    trailing={
                      <>
                        <Badge $tone={tone(goal, stats)}>
                          {Math.round(stats.percentage)}%
                        </Badge>
                        <Meta>{deadlineLabel(goal, stats)}</Meta>
                      </>
                    }
                    chevron
                    inset={72}
                  />
                );
              })}
            </Group>
          </Section>
        )}

        {!isLoading && goals.length === 0 && (
          <Empty>
            Створіть першу фінансову ціль, щоб відслідковувати прогрес.
            Натисніть «+».
          </Empty>
        )}
        {!isLoading && goals.length > 0 && visible.length === 0 && (
          <Empty>Нічого не знайдено</Empty>
        )}
      </Body>

      <ConfirmSheet
        open={sortOpen}
        onOpenChange={setSortOpen}
        message="Сортувати цілі"
        actions={GOAL_SORTS.map((s) => ({
          label: s.value === sort ? `✓ ${s.label}` : s.label,
          onSelect: () => setSort(s.value),
        }))}
      />
      {creating && (
        <GoalFormSheet
          open={creating}
          onOpenChange={(open) => !open && setCreating(false)}
        />
      )}
    </Page>
  );
}
