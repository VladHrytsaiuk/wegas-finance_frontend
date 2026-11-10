import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HiOutlinePaperClip, HiPlus } from "react-icons/hi2";
import styled from "styled-components";

import { getAssets } from "../../../services/apiAssets";
import { useSettings } from "../../../context/SettingsContext";
import { formatMoney } from "../../../utils/helpers";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { ScreenState } from "../../../mobile/ui/Loader";
import { NavBar, NavButton } from "../../../mobile/ui/NavBar";
import { LargeTitle } from "../../../mobile/ui/Screen";
import { SearchField } from "../../../mobile/ui/SearchField";
import { Tile } from "../../../mobile/ui/Tile";
import { AssetFormSheet } from "./AssetFormSheet";
import {
  ASSET_SORTS,
  assetPhotos,
  assetType,
  dateLabel,
  filterAssets,
  isThing,
  type AssetSort,
} from "./assets";

// Активи: речі, транспорт, нерухомість — ціна, дата покупки, гарантія.

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

const Tone = styled(Meta)<{ $tone: "ok" | "bad" | "muted" }>`
  font-weight: 600;
  color: ${(p) =>
    p.$tone === "ok" ? "var(--m-accent)" : p.$tone === "bad" ? "#c2410c" : "var(--m-label-2)"};
`;

const Sub = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

export default function MobileAssets() {
  const navigate = useNavigate();
  const { language } = useSettings();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<AssetSort>("purchase_date-desc");
  const [sortOpen, setSortOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [now] = useState(() => Date.now());

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: getAssets,
  });
  const visible = useMemo(() => filterAssets(assets, query, sort), [assets, query, sort]);

  return (
    <Page>
      <NavBar
        backLabel="Ще"
        onBack={() => navigate("/more")}
        trailing={
          <NavButton type="button" aria-label="Новий актив" onClick={() => setCreating(true)}>
            <HiPlus size={24} />
          </NavButton>
        }
      />
      <Body>
        <LargeTitle title="Активи" />

        {assets.length > 0 && (
          <SearchField value={query} onChange={setQuery} label="Пошук активів" />
        )}

        {isLoading && <ScreenState loading>Завантаження…</ScreenState>}

        {visible.length > 0 && (
          <Section
            caption={`Активи · ${visible.length}`}
            action={
              <SortButton onClick={() => setSortOpen(true)}>
                {ASSET_SORTS.find((s) => s.value === sort)?.label}
              </SortButton>
            }
          >
            <Group>
              {visible.map((asset) => {
                const type = assetType(asset.type);
                const photos = assetPhotos(asset);
                const hasWarranty = isThing(asset.type) && !!asset.warranty_end;
                const expired = hasWarranty && now > (asset.warranty_end ?? 0);
                return (
                  <Row
                    key={asset.id}
                    to={`/assets/${asset.id}`}
                    leading={<Tile icon={<type.Icon size={22} />} tint="gray" size={44} />}
                    title={asset.name}
                    subtitle={
                      <Sub>
                        {type.label}
                        {photos.length > 0 && (
                          <HiOutlinePaperClip size={12} aria-label="Є фото" />
                        )}
                      </Sub>
                    }
                    trailing={
                      <>
                        <span style={{ fontWeight: 500 }}>
                          {formatMoney(asset.price, asset.currency, language, false)}
                        </span>
                        {asset.is_sold ? (
                          <Tone $tone="muted">Продано</Tone>
                        ) : hasWarranty ? (
                          <Tone $tone={expired ? "bad" : "ok"}>
                            {expired ? "Гарантія минула" : `до ${dateLabel(asset.warranty_end)}`}
                          </Tone>
                        ) : (
                          <Meta>{dateLabel(asset.purchase_date)}</Meta>
                        )}
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

        {!isLoading && assets.length === 0 && (
          <Empty>
            Додайте першу річ, авто чи нерухомість, щоб бачити гарантію й витрати на
            володіння. Натисніть «+».
          </Empty>
        )}
        {!isLoading && assets.length > 0 && visible.length === 0 && (
          <Empty>Нічого не знайдено</Empty>
        )}
      </Body>

      <ConfirmSheet
        open={sortOpen}
        onOpenChange={setSortOpen}
        message="Сортувати активи"
        actions={ASSET_SORTS.map((s) => ({
          label: s.value === sort ? `✓ ${s.label}` : s.label,
          onSelect: () => setSort(s.value),
        }))}
      />
      {creating && (
        <AssetFormSheet open={creating} onOpenChange={(open) => !open && setCreating(false)} />
      )}
    </Page>
  );
}
