import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineDocumentText, HiOutlinePhoto } from "react-icons/hi2";
import styled from "styled-components";

import type { Account, Transaction } from "../../../types";
import { getAccountsApi } from "../../../services/apiAccounts";
import { getAssetById } from "../../../services/apiAssets";
import { getCategoriesApi } from "../../../services/apiCategories";
import { getTransactionsApi } from "../../../services/apiTransactions";
import { useSettings } from "../../../context/SettingsContext";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { TransactionListItem } from "../../../hooks/Transactions/useTransactionItem";
import { formatMoney, getUploadedFileUrl } from "../../../utils/helpers";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { ScreenState } from "../../../mobile/ui/Loader";
import { NavBar, NavButton } from "../../../mobile/ui/NavBar";
import { PhotoViewer } from "../../../mobile/ui/PhotoViewer";
import { Tile } from "../../../mobile/ui/Tile";
import { TxRow } from "../../../mobile/ui/TxRow";
import { AssetFormSheet } from "./AssetFormSheet";
import {
  assetPhotos,
  assetType,
  dateLabel,
  isCar,
  isRealEstate,
  isThing,
  warranty,
} from "./assets";

// Актив: вартість, характеристики (авто / нерухомість), вартість володіння,
// гарантія з прогресом, документи, фото й історія операцій.

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

const Value = styled.strong`
  font-size: 30px;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
`;

const PhotoStrip = styled.button`
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  border-radius: var(--m-radius-group);
  overflow: hidden;
  background: var(--m-fill);
  cursor: pointer;

  img {
    display: block;
    width: 100%;
    max-height: 240px;
    object-fit: cover;
  }

  span {
    position: absolute;
    right: 10px;
    bottom: 10px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 13px;
    color: #fff;
    background: rgba(0, 0, 0, 0.55);
  }
`;

const Progress = styled.span`
  display: block;
  width: 100%;
  height: 6px;
  margin: 6px 0 2px;
  border-radius: 3px;
  background: var(--m-fill);
  overflow: hidden;
`;

const Fill = styled.span<{ $pct: number; $color: string }>`
  display: block;
  height: 100%;
  width: ${(p) => p.$pct}%;
  border-radius: 3px;
  background: ${(p) => p.$color};
`;

const Tone = styled.span<{ $tone: "ok" | "warn" | "bad" }>`
  font-weight: 600;
  color: ${(p) =>
    p.$tone === "ok" ? "var(--m-accent)" : p.$tone === "warn" ? "#b45309" : "#c2410c"};
`;

const Sub = styled.span`
  display: flex;
  flex-direction: column;
`;

const Mono = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 15px;
  word-break: break-all;
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

export default function MobileAsset() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { language } = useSettings();
  const [editing, setEditing] = useState(false);
  const [viewer, setViewer] = useState(false);
  const [now] = useState(() => Date.now());

  const { data: asset, isLoading } = useQuery({
    queryKey: ["asset", id],
    queryFn: () => getAssetById(id),
    enabled: !!id,
    retry: false,
  });
  const { data: txData } = useQuery({
    queryKey: ["transactions", { asset_id: id }],
    queryFn: () => getTransactionsApi({ asset_id: id, limit: 100 }),
    enabled: !!id,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
  });
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccountsApi,
  });
  usePageTitle(asset?.name ?? "Актив");

  if (!asset) {
    return (
      <Page>
        <NavBar backLabel="Активи" onBack={() => navigate("/assets")} />
        <ScreenState loading={isLoading}>
          {isLoading ? "Завантаження…" : "Актив не знайдено"}
        </ScreenState>
      </Page>
    );
  }

  const type = assetType(asset.type);
  const money = (minor: number) => formatMoney(minor, asset.currency, language, false);
  const photos = assetPhotos(asset).map((p) => getUploadedFileUrl(p.path)).filter(Boolean) as string[];
  const docs = asset.documents ?? [];
  const history: Transaction[] = txData?.data ?? [];
  const guarantee = isThing(asset.type) ? warranty(asset.purchase_date, asset.warranty_end, now) : null;

  // Вартість володіння: покупка + витрати на утримання − доходи від активу.
  const maintenance =
    asset.stats?.total_expenses ??
    history
      .filter((t) => t.type === "expense" && t.date > asset.purchase_date + 1000)
      .reduce((n, t) => n + t.amount, 0);
  const income =
    asset.stats?.total_income ??
    history.filter((t) => t.type === "income").reduce((n, t) => n + t.amount, 0);
  const tco = asset.price + maintenance - income;
  const current = asset.stats?.current_value || asset.current_price || asset.price;
  const guaranteeColor = guarantee?.expired
    ? "#ef4444"
    : guarantee?.expiring
      ? "#f59e0b"
      : "var(--m-accent)";

  return (
    <Page>
      <NavBar
        backLabel="Активи"
        onBack={() => navigate("/assets")}
        trailing={
          <NavButton type="button" onClick={() => setEditing(true)}>
            Змінити
          </NavButton>
        }
      />
      <Body>
        <Hero>
          <Tile icon={<type.Icon size={32} />} tint="gray" size={64} />
          <HeroTitle>{asset.name}</HeroTitle>
          <Meta>
            {type.label}
            {asset.is_sold ? " · Продано" : ""}
          </Meta>
          <Value>{money(current)}</Value>
          <Meta>поточна вартість</Meta>
        </Hero>

        {photos.length > 0 && (
          <PhotoStrip type="button" aria-label="Відкрити фото" onClick={() => setViewer(true)}>
            <img src={photos[0]} alt="" />
            {photos.length > 1 && (
              <span>
                <HiOutlinePhoto size={14} /> +{photos.length - 1}
              </span>
            )}
          </PhotoStrip>
        )}

        <Group>
          <Row title="Дата покупки" trailing={dateLabel(asset.purchase_date)} />
          <Row title="Ціна покупки" trailing={money(asset.price)} />
          {isThing(asset.type) && (
            <Row title="Серійний номер" trailing={<Mono>{asset.serial_number || "—"}</Mono>} />
          )}
          {asset.note && <Row title="Примітка" subtitle={asset.note} wrapSubtitle />}
        </Group>

        {isCar(asset.type) && (
          <Section caption="Транспорт">
            <Group>
              <Row
                title="Пробіг"
                trailing={asset.mileage ? `${asset.mileage.toLocaleString("uk-UA")} км` : "—"}
              />
              <Row title="VIN-код" trailing={<Mono>{asset.vin_code || "—"}</Mono>} />
              <Row title="Страховка до" trailing={dateLabel(asset.insurance_expiry)} />
              <Row title="Останнє ТО" trailing={dateLabel(asset.last_service_date)} />
            </Group>
          </Section>
        )}

        {isRealEstate(asset.type) && (
          <Section caption="Нерухомість">
            <Group>
              <Row title="Адреса" subtitle={asset.address || "—"} wrapSubtitle />
              <Row title="Площа" trailing={asset.area ? `${asset.area} м²` : "—"} />
              <Row title="Кадастровий №" trailing={<Mono>{asset.cadastral_num || "—"}</Mono>} />
            </Group>
          </Section>
        )}

        <Section caption="Вартість володіння">
          <Group>
            <Row title="Покупка" trailing={money(asset.price)} />
            <Row title="Обслуговування" trailing={`+ ${money(maintenance)}`} />
            {income > 0 && <Row title="Доходи від активу" trailing={`− ${money(income)}`} />}
            <Row title={<strong>Разом</strong>} trailing={<strong>{money(tco)}</strong>} />
          </Group>
        </Section>

        {isThing(asset.type) && (
          <Section caption="Гарантія">
            <Group>
              {guarantee ? (
                <Row
                  title={dateLabel(asset.warranty_end)}
                  subtitle={
                    <Sub>
                      <Progress>
                        <Fill $pct={guarantee.percent} $color={guaranteeColor} />
                      </Progress>
                      {dateLabel(asset.purchase_date)} → {dateLabel(asset.warranty_end)} ·{" "}
                      {Math.round(guarantee.percent)}%
                    </Sub>
                  }
                  trailing={
                    <Tone $tone={guarantee.expired ? "bad" : guarantee.expiring ? "warn" : "ok"}>
                      {guarantee.expired
                        ? "Минула"
                        : guarantee.expiring
                          ? "Спливає"
                          : `${guarantee.daysLeft} дн.`}
                    </Tone>
                  }
                />
              ) : (
                <Row title="Гарантія не вказана" />
              )}
            </Group>
          </Section>
        )}

        {docs.length > 0 && (
          <Section caption={`Документи · ${docs.length}`}>
            <Group>
              {docs.map((doc) => (
                <Row
                  key={doc.id}
                  onClick={() => window.open(getUploadedFileUrl(doc.path), "_blank", "noopener")}
                  leading={<HiOutlineDocumentText size={24} color="var(--m-label-2)" />}
                  title={doc.name}
                  trailing={<Meta>Відкрити</Meta>}
                  inset={52}
                />
              ))}
            </Group>
          </Section>
        )}

        <Section caption={history.length ? `Історія · ${history.length}` : "Історія"}>
          {history.length > 0 ? (
            <Group>
              {history.map((tx) => (
                <TxRow
                  key={tx.id}
                  transaction={tx as unknown as TransactionListItem}
                  categories={categories}
                  accounts={accounts as unknown as Account[]}
                  showTime
                />
              ))}
            </Group>
          ) : (
            <Empty>З цим активом ще немає операцій: ремонт, обслуговування чи дохід.</Empty>
          )}
        </Section>
      </Body>

      {editing && (
        <AssetFormSheet
          open={editing}
          onOpenChange={(open) => !open && setEditing(false)}
          asset={asset}
        />
      )}
      {viewer && photos.length > 0 && (
        <PhotoViewer urls={photos} startIndex={0} onClose={() => setViewer(false)} />
      )}
    </Page>
  );
}
