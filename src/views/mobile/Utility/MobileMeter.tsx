import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { HiOutlineChartBar } from "react-icons/hi2";
import styled from "styled-components";

import type { UtilityReading } from "../../../types";
import { getMeterById, patchUtilityReading } from "../../../services/apiUtility";
import { useSettings } from "../../../context/SettingsContext";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useUtilityReadings } from "../../../hooks/Utility/useUtility";
import { formatMoney } from "../../../utils/helpers";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { ConfirmSheet, type ConfirmAction } from "../../../mobile/ui/ConfirmSheet";
import { ScreenState } from "../../../mobile/ui/Loader";
import { NavBar, NavButton } from "../../../mobile/ui/NavBar";
import { PrimaryButton } from "../../../mobile/ui/Sheet";
import { Tile } from "../../../mobile/ui/Tile";
import { AddSheet } from "../AddSheet/AddSheet";
import { emptyInitial } from "../AddSheet/editState";
import { minorToInput } from "../AddSheet/items";
import { MeterFormSheet } from "./MeterFormSheet";
import { ReadingSheet } from "./ReadingSheet";
import {
  dateLabel,
  fmtNumber,
  meterDebt,
  serviceType,
  unpaidTotal,
} from "./utility";

// Один лічильник: борг, останній показник, тариф, історія показників, оплата
// (звичайною панеллю «+» з боргом) і видалення показника.

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
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SecondaryButton = styled.button`
  width: 100%;
  height: 50px;
  border: none;
  border-radius: var(--m-radius-group);
  font: inherit;
  font-size: 17px;
  font-weight: 600;
  color: var(--m-accent);
  background: var(--m-surface);
  cursor: pointer;
`;

const Tone = styled.span<{ $tone: "debt" | "ok" }>`
  font-weight: 600;
  color: ${(p) => (p.$tone === "debt" ? "#c2410c" : "var(--m-accent)")};
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

type Paying = { kind: "one"; reading: UtilityReading } | { kind: "all" };

export default function MobileMeter() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language } = useSettings();
  const { readings, removeReading } = useUtilityReadings(id);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [paying, setPaying] = useState<Paying | null>(null);
  const [active, setActive] = useState<UtilityReading | null>(null);
  const [deleting, setDeleting] = useState<UtilityReading | null>(null);

  const { data: meter, isLoading } = useQuery({
    queryKey: ["utilityMeter", id],
    queryFn: () => getMeterById(id),
    enabled: !!id,
    retry: false,
  });
  usePageTitle(meter?.name ?? "Комуналка");

  const back = () => navigate("/utility");

  if (!meter) {
    return (
      <Page>
        <NavBar backLabel="Комуналка" onBack={back} />
        <ScreenState loading={isLoading}>
          {isLoading ? "Завантаження…" : "Лічильник не знайдено"}
        </ScreenState>
      </Page>
    );
  }

  const type = serviceType(meter.type);
  const totalDebt = unpaidTotal(readings);
  const money = (minor: number) => formatMoney(minor, meter.currency, language);
  const lastReading = readings[0];

  const refresh = () => {
    for (const key of [
      "utilityReadings",
      "utilityMeters",
      "utilityMeter",
      "counterparties",
      "accounts",
      "transactions",
    ]) {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
  };

  // Після операції оплати показники відмічаються оплаченими й прив'язуються до неї.
  const markPaid = async (transactionId: string) => {
    const targets =
      paying?.kind === "one"
        ? [paying.reading]
        : readings.filter((r) => !r.is_paid);
    try {
      await Promise.all(
        targets.map((r) =>
          patchUtilityReading(r.id, {
            is_paid: true,
            payment_transaction_id: transactionId,
          }),
        ),
      );
    } catch {
      toast.error("Оплату проведено, але показники не вдалося відмітити");
    }
    refresh();
  };

  const payPrefill = () => {
    const amount =
      paying?.kind === "one" ? paying.reading.calculated_cost : totalDebt;
    return {
      ...emptyInitial(),
      kind: "debt" as const,
      debtType: "debt_repay" as const,
      counterpartyId: meter.counterparty_id ?? "",
      amount: minorToInput(amount),
      note:
        paying?.kind === "one"
          ? `Оплата ${meter.name}: показник ${paying.reading.value}`
          : `Повна оплата заборгованості: ${meter.name}`,
    };
  };

  const readingActions = (r: UtilityReading): ConfirmAction[] => {
    const paymentTx = r.payment_transaction_id || (r.is_paid ? r.transaction_id : null);
    return [
      ...(!r.is_paid && meter.counterparty_id
        ? [{ label: "Оплатити", onSelect: () => setPaying({ kind: "one", reading: r }) }]
        : []),
      ...(r.transaction_id
        ? [{ label: "Відкрити нарахування", onSelect: () => navigate(`/transactions/${r.transaction_id}`) }]
        : []),
      ...(paymentTx
        ? [{ label: "Відкрити оплату", onSelect: () => navigate(`/transactions/${paymentTx}`) }]
        : []),
      { label: "Видалити показник", destructive: true, onSelect: () => setDeleting(r) },
    ];
  };

  return (
    <Page>
      <NavBar
        backLabel="Комуналка"
        onBack={back}
        trailing={
          <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <NavButton
              type="button"
              aria-label="Аналітика лічильника"
              onClick={() => navigate(`/utility/${meter.id}/analytics`)}
            >
              <HiOutlineChartBar size={24} />
            </NavButton>
            <NavButton type="button" onClick={() => setEditing(true)}>
              Змінити
            </NavButton>
          </span>
        }
      />
      <Body>
        <Hero>
          <Tile icon={<type.Icon size={34} />} color={type.color} size={64} />
          <HeroTitle>{meter.name}</HeroTitle>
          <Meta>
            {[
              type.label,
              meter.counterparty?.name,
              meter.asset?.name,
              meter.personal_account && `рахунок ${meter.personal_account}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Meta>
        </Hero>

        <Group>
          <Row
            title="Борг за показниками"
            trailing={
              <Tone $tone={totalDebt > 0 ? "debt" : "ok"}>
                {totalDebt > 0 ? money(totalDebt) : "Немає"}
              </Tone>
            }
          />
          {meterDebt(meter) > 0 && meterDebt(meter) !== totalDebt && (
            <Row
              title="Борг перед постачальником"
              subtitle="разом з іншими його лічильниками"
              trailing={<Tone $tone="debt">{money(meterDebt(meter))}</Tone>}
            />
          )}
          <Row
            title="Останній показник"
            subtitle={lastReading ? dateLabel(lastReading.date) : "Даних ще немає"}
            trailing={
              lastReading
                ? `${fmtNumber(lastReading.value)} ${meter.unit}`
                : "—"
            }
          />
          <Row
            title="Тариф"
            subtitle={`за 1 ${meter.unit}`}
            trailing={money(meter.tariff * 100)}
          />
        </Group>

        <Actions>
          <PrimaryButton type="button" onClick={() => setAdding(true)}>
            Внести показник
          </PrimaryButton>
          {totalDebt > 0 && meter.counterparty_id && (
            <SecondaryButton type="button" onClick={() => setPaying({ kind: "all" })}>
              Оплатити весь борг · {money(totalDebt)}
            </SecondaryButton>
          )}
        </Actions>

        <Section caption={`Історія · ${readings.length}`}>
          {readings.length === 0 ? (
            <Empty>Показників ще немає. Внесіть перший.</Empty>
          ) : (
            <Group>
              {readings.map((r) => (
                <Row
                  key={r.id}
                  onClick={() => setActive(r)}
                  title={`${fmtNumber(r.value)} ${meter.unit}`}
                  subtitle={`${dateLabel(r.date)} · ${r.diff > 0 ? "+" : ""}${fmtNumber(r.diff, 3)} × ${fmtNumber(r.tariff_at_date || meter.tariff, 4)}`}
                  trailing={
                    <>
                      <span style={{ fontWeight: 500 }}>{money(r.calculated_cost)}</span>
                      <Tone $tone={r.is_paid ? "ok" : "debt"}>
                        {r.is_paid ? "Оплачено" : "Борг"}
                      </Tone>
                    </>
                  }
                  chevron
                  inset={16}
                />
              ))}
            </Group>
          )}
        </Section>
      </Body>

      <ConfirmSheet
        open={!!active}
        onOpenChange={(open) => !open && setActive(null)}
        message={active ? `${fmtNumber(active.value)} ${meter.unit} · ${dateLabel(active.date)}` : ""}
        actions={active ? readingActions(active) : []}
      />
      <ConfirmSheet
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        message="Видалити показник? Разом з ним буде видалено нарахування боргу й оплату (гроші повернуться на рахунок)."
        actions={[
          {
            label: "Видалити показник",
            destructive: true,
            onSelect: () => deleting && removeReading(deleting.id),
          },
        ]}
      />
      {adding && (
        <ReadingSheet
          open={adding}
          onOpenChange={(open) => !open && setAdding(false)}
          meter={meter}
        />
      )}
      {editing && (
        <MeterFormSheet
          open={editing}
          onOpenChange={(open) => !open && setEditing(false)}
          meter={meter}
          readingsCount={readings.length}
          onDeleted={back}
        />
      )}
      {paying && (
        <AddSheet
          open
          onOpenChange={(open) => {
            if (!open) {
              setPaying(null);
              refresh();
            }
          }}
          onOpenReceiptImport={() => undefined}
          title={meter.name}
          prefill={payPrefill()}
          onCreated={markPaid}
        />
      )}
    </Page>
  );
}
