import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const SkeletonSurface = styled.div`
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 25%,
    var(--color-border) 50%,
    var(--color-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
`;

export const SkeletonBlock = styled(SkeletonSurface)<{
  $width?: string;
  $height?: string;
  $radius?: string;
}>`
  width: ${(props) => props.$width || "100%"};
  height: ${(props) => props.$height || "1rem"};
  border-radius: ${(props) => props.$radius || "8px"};
  flex-shrink: 0;
`;

const PageSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const TopActionsRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const ToolbarTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const TopActionsLeft = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  min-width: 220px;
`;

const TopActionsRight = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
`;

const ToolbarActionsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
  flex-wrap: wrap;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
`;

const CardSkeleton = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 122px;
  padding: 1.15rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-bg-surface);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
`;

const TableSkeletonWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
`;

const TableCardRow = styled.div`
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr 120px;
  gap: 0.75rem;
  align-items: center;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-bg-surface);

  @media (max-width: 960px) {
    grid-template-columns: 1.4fr 1fr 1fr;
  }
`;

const ToolbarShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
`;

const ToolbarCardShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-bg-surface);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
`;

const InlineControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.125rem 0;
`;

const BottomBarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchSkeleton = styled(SkeletonBlock)`
  min-width: 260px;
  flex: 1;
`;

const FilterPillRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const TableShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-bg-surface);
  overflow: hidden;
`;

const TableHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 54px 1.6fr 1fr 1fr 120px 52px;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-page);

  @media (max-width: 960px) {
    grid-template-columns: 54px 1.6fr 1fr 120px;
  }
`;

const GroupHeaderSkeleton = styled.div`
  padding: 0.7rem 1rem;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-page);
`;

const AccountsGridShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const AccountsGroupShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
`;

const AccountsTableShell = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-bg-surface);
  overflow: hidden;
`;

const AccountsTableHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 140px 60px;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-page);
`;

const AccountsTableDataRow = styled.div`
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 140px 60px;
  gap: 0.75rem;
  align-items: center;
  min-height: 66px;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
`;

const PaginationShell = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
  flex-wrap: wrap;
`;

const WidgetSkeletonWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  width: 100%;
  height: 100%;
  padding: 1rem;
  border-radius: 12px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
`;

const SummaryCardSkeletonWrap = styled(WidgetSkeletonWrap)`
  justify-content: space-between;
`;

const TransactionListSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const WidgetBodySkeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  width: 100%;
  height: 100%;
`;

const DetailHeaderWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 1rem;
  width: 100%;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const DetailCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1.25rem;
  border-radius: 18px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
`;

const MobileSectionCard = styled(DetailCard)`
  padding: 1rem;
`;

const StatsSkeletonRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const InfoListSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
`;

const InfoRowSkeleton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const ImportModalSkeletonWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

export function PageToolbarSkeleton({
  withViewToggle = false,
  actionButtonWidths = ["110px", "140px"],
}: {
  withViewToggle?: boolean;
  actionButtonWidths?: string[];
}) {
  return (
    <ToolbarShell>
      <TopActionsRow>
        <TopActionsLeft>
          {withViewToggle && (
            <SkeletonBlock $width="76px" $height="38px" $radius="10px" />
          )}
        </TopActionsLeft>
        <TopActionsRight>
          {actionButtonWidths.map((width, index) => (
            <SkeletonBlock
              key={`${width}-${index}`}
              $width={width}
              $height="40px"
              $radius="10px"
            />
          ))}
        </TopActionsRight>
      </TopActionsRow>

      <InlineControlsRow>
        <FilterPillRow>
          <SkeletonBlock $width="120px" $height="38px" $radius="10px" />
          <SkeletonBlock $width="44px" $height="38px" $radius="10px" />
          <SkeletonBlock $width="44px" $height="38px" $radius="10px" />
          <SkeletonBlock $width="44px" $height="38px" $radius="10px" />
        </FilterPillRow>
      </InlineControlsRow>

      <BottomBarRow>
        <SearchSkeleton $height="44px" $radius="12px" />
        <SkeletonBlock $width="180px" $height="40px" $radius="10px" />
      </BottomBarRow>
    </ToolbarShell>
  );
}

export function ListPageSkeleton({
  viewMode = "grid",
}: {
  viewMode?: "grid" | "table";
}) {
  return (
    <PageSkeletonContainer>
      <ToolbarShell>
        <ToolbarTopRow>
          <div />
          <ToolbarActionsGroup>
            <SkeletonBlock $width="78px" $height="38px" $radius="12px" />
            <SkeletonBlock $width="146px" $height="40px" $radius="12px" />
          </ToolbarActionsGroup>
        </ToolbarTopRow>

        <ToolbarCardShell>
          <InlineControlsRow>
            <FilterPillRow>
              <SkeletonBlock $width="112px" $height="38px" $radius="10px" />
              <SkeletonBlock $width="112px" $height="38px" $radius="10px" />
              <SkeletonBlock $width="112px" $height="38px" $radius="10px" />
              <SkeletonBlock $width="112px" $height="38px" $radius="10px" />
              <SkeletonBlock $width="92px" $height="38px" $radius="10px" />
              <SkeletonBlock $width="128px" $height="38px" $radius="10px" />
            </FilterPillRow>
          </InlineControlsRow>

          <BottomBarRow>
            <SearchSkeleton $height="40px" $radius="10px" />
            <SkeletonBlock $width="184px" $height="38px" $radius="10px" />
          </BottomBarRow>
        </ToolbarCardShell>
      </ToolbarShell>

      {viewMode === "grid" ? (
        <AccountsGridShell>
          {Array.from({ length: 2 }).map((_, groupIndex) => (
            <AccountsGroupShell key={groupIndex}>
              <SkeletonBlock $width="180px" $height="0.9rem" />
              <CardGrid>
                {Array.from({ length: 3 }).map((__, index) => (
                  <CardSkeleton key={`${groupIndex}-${index}`}>
                    <SkeletonBlock $width="52px" $height="52px" $radius="16px" />
                    <div
                      style={{
                        display: "flex",
                        flex: 1,
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      <SkeletonBlock $width="62%" $height="1rem" $radius="10px" />
                      <SkeletonBlock $width="34%" $height="0.8rem" $radius="10px" />
                      <SkeletonBlock $width="48%" $height="0.8rem" $radius="10px" />
                    </div>
                    <SkeletonBlock $width="96px" $height="1.15rem" $radius="10px" />
                  </CardSkeleton>
                ))}
              </CardGrid>
            </AccountsGroupShell>
          ))}
        </AccountsGridShell>
      ) : (
        <AccountsTableShell>
          <AccountsTableHeaderRow>
            <SkeletonBlock $height="0.8rem" />
            <SkeletonBlock $height="0.8rem" />
            <SkeletonBlock $height="0.8rem" />
            <SkeletonBlock $height="0.8rem" />
            <SkeletonBlock $height="0.8rem" />
          </AccountsTableHeaderRow>

          {Array.from({ length: 2 }).map((_, groupIndex) => (
            <div key={groupIndex}>
              <GroupHeaderSkeleton>
                <SkeletonBlock $width="140px" $height="0.8rem" />
              </GroupHeaderSkeleton>

              {Array.from({ length: 3 }).map((__, rowIndex) => (
                <AccountsTableDataRow key={`${groupIndex}-${rowIndex}`}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <SkeletonBlock $width="34px" $height="34px" $radius="10px" />
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 }}>
                      <SkeletonBlock $width="58%" $radius="10px" />
                      <SkeletonBlock $width="36%" $height="0.75rem" $radius="10px" />
                    </div>
                  </div>
                  <SkeletonBlock $width="74%" $radius="10px" />
                  <SkeletonBlock $width="64%" $radius="10px" />
                  <SkeletonBlock $width="104px" $radius="10px" />
                  <SkeletonBlock $width="28px" $height="28px" $radius="10px" />
                </AccountsTableDataRow>
              ))}
            </div>
          ))}
        </AccountsTableShell>
      )}
    </PageSkeletonContainer>
  );
}

export function TransactionsPageSkeleton() {
  return (
    <PageSkeletonContainer>
      <ToolbarShell>
        <ToolbarTopRow>
          <div />
          <ToolbarActionsGroup>
            <SkeletonBlock $width="122px" $height="40px" $radius="12px" />
            <SkeletonBlock $width="144px" $height="40px" $radius="12px" />
          </ToolbarActionsGroup>
        </ToolbarTopRow>

        <ToolbarCardShell>
          <InlineControlsRow>
            <FilterPillRow>
              <SkeletonBlock $width="44px" $height="38px" $radius="10px" />
              <SkeletonBlock $width="132px" $height="38px" $radius="10px" />
              <SkeletonBlock $width="132px" $height="38px" $radius="10px" />
              <SkeletonBlock $width="132px" $height="38px" $radius="10px" />
              <SkeletonBlock $width="132px" $height="38px" $radius="10px" />
            </FilterPillRow>
          </InlineControlsRow>

          <BottomBarRow>
            <SearchSkeleton $height="40px" $radius="10px" />
            <SkeletonBlock $width="184px" $height="38px" $radius="10px" />
          </BottomBarRow>
        </ToolbarCardShell>
      </ToolbarShell>

      <TableSkeletonWrap>
        <PaginationShell>
          <SkeletonBlock $width="220px" $height="18px" />
          <FilterPillRow>
            <SkeletonBlock $width="40px" $height="36px" $radius="10px" />
            <SkeletonBlock $width="40px" $height="36px" $radius="10px" />
            <SkeletonBlock $width="40px" $height="36px" $radius="10px" />
          </FilterPillRow>
        </PaginationShell>

        <TableShell>
          <TableHeaderRow>
            <SkeletonBlock $height="0.9rem" />
            <SkeletonBlock $height="0.9rem" />
            <SkeletonBlock $height="0.9rem" />
            <SkeletonBlock $height="0.9rem" />
            <SkeletonBlock $height="0.9rem" />
            <SkeletonBlock $height="0.9rem" />
          </TableHeaderRow>

          {Array.from({ length: 2 }).map((_, groupIndex) => (
            <div key={groupIndex}>
              <GroupHeaderSkeleton>
                <SkeletonBlock $width="160px" $height="0.95rem" />
              </GroupHeaderSkeleton>

              {Array.from({ length: 3 }).map((__, rowIndex) => (
                <TableCardRow key={`${groupIndex}-${rowIndex}`}>
                  <SkeletonBlock $width="32px" $height="32px" $radius="10px" />
                  <SkeletonBlock />
                  <SkeletonBlock />
                  <SkeletonBlock />
                  <SkeletonBlock />
                </TableCardRow>
              ))}
            </div>
          ))}
        </TableShell>

        <PaginationShell>
          <SkeletonBlock $width="220px" $height="18px" />
          <FilterPillRow>
            <SkeletonBlock $width="40px" $height="36px" $radius="10px" />
            <SkeletonBlock $width="40px" $height="36px" $radius="10px" />
            <SkeletonBlock $width="40px" $height="36px" $radius="10px" />
          </FilterPillRow>
        </PaginationShell>
      </TableSkeletonWrap>
    </PageSkeletonContainer>
  );
}

export function DashboardSummaryCardSkeleton() {
  return (
    <div
      style={{
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "16px",
        padding: "0.6rem 0.8rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        boxShadow: "var(--shadow-sm)",
        height: "100%",
        width: "100%",
        overflow: "hidden"
      }}
    >
      <SkeletonBlock $width="40px" $height="40px" $radius="10px" />
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, justifyContent: "center" }}>
        <SkeletonBlock $width="40%" $height="0.75rem" />
        <SkeletonBlock $width="70%" $height="1.2rem" $radius="8px" />
      </div>
    </div>
  );
}

export function DashboardWidgetSkeleton({
  rows = 4,
  showControls = true,
}: {
  rows?: number;
  showControls?: boolean;
}) {
  return (
    <WidgetSkeletonWrap>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.75rem",
          alignItems: "center",
        }}
      >
        <SkeletonBlock $width="36%" $height="1rem" />
        {showControls && (
          <SkeletonBlock $width="92px" $height="32px" $radius="10px" />
        )}
      </div>

      <TransactionListSkeleton>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <SkeletonBlock $width="38px" $height="38px" $radius="12px" />
            <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: "0.5rem" }}>
              <SkeletonBlock $width="62%" />
              <SkeletonBlock $width="34%" $height="0.8rem" />
            </div>
            <SkeletonBlock $width="84px" />
          </div>
        ))}
      </TransactionListSkeleton>
    </WidgetSkeletonWrap>
  );
}

export function DashboardChartSkeleton() {
  return (
    <WidgetSkeletonWrap>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.75rem",
          alignItems: "center",
        }}
      >
        <SkeletonBlock $width="32%" $height="1rem" />
        <SkeletonBlock $width="96px" $height="32px" $radius="10px" />
      </div>
      <SkeletonBlock $height="100%" $radius="16px" />
    </WidgetSkeletonWrap>
  );
}

export function DashboardInlineListSkeleton({
  rows = 4,
  withTrailingValue = true,
}: {
  rows?: number;
  withTrailingValue?: boolean;
}) {
  return (
    <WidgetBodySkeleton>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
        >
          <SkeletonBlock $width="38px" $height="38px" $radius="12px" />
          <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: "0.45rem" }}>
            <SkeletonBlock $width="56%" $radius="10px" />
            <SkeletonBlock $width="34%" $height="0.75rem" $radius="10px" />
          </div>
          {withTrailingValue && <SkeletonBlock $width="84px" $radius="10px" />}
        </div>
      ))}
    </WidgetBodySkeleton>
  );
}

export function DashboardInlineChartSkeleton() {
  return (
    <WidgetBodySkeleton>
      <SkeletonBlock $height="100%" $radius="16px" />
    </WidgetBodySkeleton>
  );
}

export function DashboardInlinePieSkeleton() {
  return (
    <WidgetBodySkeleton>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 1fr) minmax(160px, 0.85fr)",
          gap: "1rem",
          alignItems: "center",
          height: "100%",
        }}
      >
        <SkeletonBlock $height="220px" $radius="999px" />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}
            >
              <SkeletonBlock $width="14px" $height="14px" $radius="999px" />
              <SkeletonBlock $width="100%" $height="0.85rem" $radius="10px" />
            </div>
          ))}
        </div>
      </div>
    </WidgetBodySkeleton>
  );
}

export function AccountsWidgetBodySkeleton() {
  return (
    <WidgetBodySkeleton>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "6px 10px",
            borderRadius: "12px",
          }}
        >
          <SkeletonBlock $width="40px" $height="40px" $radius="10px" />
          <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: "0.4rem" }}>
            <SkeletonBlock $width={index % 2 === 0 ? "58%" : "44%"} $height="0.95rem" $radius="10px" />
            <SkeletonBlock $width={index % 2 === 0 ? "32%" : "26%"} $height="0.75rem" $radius="10px" />
          </div>
          <SkeletonBlock $width="92px" $height="1rem" $radius="10px" />
        </div>
      ))}
    </WidgetBodySkeleton>
  );
}

export function RecentTransactionsBodySkeleton() {
  return (
    <WidgetBodySkeleton>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: "40px minmax(0, 1fr) 92px",
            alignItems: "center",
            gap: "12px",
            minHeight: "58px",
            padding: "0 1.25rem",
          }}
        >
          <SkeletonBlock $width="36px" $height="36px" $radius="12px" />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <SkeletonBlock $width={index % 2 === 0 ? "54%" : "68%"} $height="0.9rem" $radius="10px" />
            <SkeletonBlock $width={index % 2 === 0 ? "30%" : "42%"} $height="0.75rem" $radius="10px" />
          </div>
          <SkeletonBlock $width="84px" $height="0.95rem" $radius="10px" />
        </div>
      ))}
    </WidgetBodySkeleton>
  );
}

export function TopListBodySkeleton() {
  return (
    <WidgetBodySkeleton>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
              <SkeletonBlock $width="24px" $height="24px" $radius="6px" />
              <SkeletonBlock $width={index % 2 === 0 ? "48%" : "62%"} $height="0.9rem" $radius="10px" />
            </div>
            <SkeletonBlock $width="78px" $height="0.95rem" $radius="10px" />
          </div>
          <SkeletonBlock
            $width={index % 2 === 0 ? "76%" : "58%"}
            $height="8px"
            $radius="999px"
          />
        </div>
      ))}
    </WidgetBodySkeleton>
  );
}

export function PieWidgetBodySkeleton() {
  return (
    <WidgetBodySkeleton>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 1fr) minmax(170px, 0.9fr)",
          gap: "1.25rem",
          alignItems: "center",
          height: "100%",
          minHeight: "260px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <SkeletonBlock $width="220px" $height="220px" $radius="999px" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <SkeletonBlock $width="10px" $height="10px" $radius="999px" />
              <SkeletonBlock $width={index % 2 === 0 ? "100%" : "86%"} $height="0.9rem" $radius="10px" />
            </div>
          ))}
        </div>
      </div>
    </WidgetBodySkeleton>
  );
}

export function TrendWidgetBodySkeleton() {
  return (
    <WidgetBodySkeleton>
      <div
        style={{
          position: "relative",
          height: "100%",
          minHeight: "240px",
          borderRadius: "16px",
          overflow: "hidden",
          background: "var(--color-bg-page)",
          border: "1px solid var(--color-border)",
          padding: "16px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "22px", height: "100%" }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} $width="100%" $height="1px" $radius="999px" />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: "16px",
            right: "16px",
            bottom: "28px",
            display: "flex",
            alignItems: "flex-end",
            gap: "10px",
            height: "54%",
          }}
        >
          {["28%", "52%", "46%", "74%", "58%", "82%", "64%", "90%"].map(
            (height, index) => (
              <SkeletonBlock
                key={`${height}-${index}`}
                $width="100%"
                $height={height}
                $radius="12px"
              />
            ),
          )}
        </div>
      </div>
    </WidgetBodySkeleton>
  );
}

export function DetailPageSkeleton() {
  return (
    <PageSkeletonContainer>
      <DetailHeaderWrap>
        <SkeletonBlock $width="120px" $height="36px" $radius="10px" />
        <SkeletonBlock $width="260px" $height="2rem" $radius="12px" />
      </DetailHeaderWrap>

      <DetailGrid>
        <DetailCard>
          <SkeletonBlock $height="220px" $radius="18px" />
          <SkeletonBlock $width="58%" />
          <SkeletonBlock $width="42%" />
          <SkeletonBlock $width="74%" />
        </DetailCard>

        <DetailCard>
          <SkeletonBlock $width="46%" />
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} $height="52px" $radius="12px" />
          ))}
        </DetailCard>
      </DetailGrid>

      <DetailCard>
        <SkeletonBlock $width="32%" />
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <SkeletonBlock $width="38px" $height="38px" $radius="12px" />
            <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: "0.5rem" }}>
              <SkeletonBlock $width="58%" />
              <SkeletonBlock $width="38%" $height="0.8rem" />
            </div>
            <SkeletonBlock $width="88px" />
          </div>
        ))}
      </DetailCard>
    </PageSkeletonContainer>
  );
}

export function AccountDetailsSkeleton() {
  return (
    <PageSkeletonContainer>
      <ToolbarTopRow>
        <SkeletonBlock $width="52px" $height="40px" $radius="10px" />
        <ToolbarActionsGroup>
          <SkeletonBlock $width="120px" $height="40px" $radius="10px" />
          <SkeletonBlock $width="120px" $height="40px" $radius="10px" />
          <SkeletonBlock $width="120px" $height="40px" $radius="10px" />
        </ToolbarActionsGroup>
      </ToolbarTopRow>

      <StatsSkeletonRow>
        {Array.from({ length: 3 }).map((_, index) => (
          <DetailCard key={index}>
            <SkeletonBlock $width="42%" $height="0.8rem" />
            <SkeletonBlock $width="72%" $height="1.6rem" $radius="12px" />
          </DetailCard>
        ))}
      </StatsSkeletonRow>

      <DetailGrid>
        <DetailCard>
          <SkeletonBlock $height="220px" $radius="20px" />
          <SkeletonBlock $width="44%" />
          <SkeletonBlock $width="62%" />
        </DetailCard>

        <DetailCard>
          <SkeletonBlock $width="38%" />
          <SkeletonBlock $height="84px" $radius="14px" />
          <SkeletonBlock $height="10px" $width="82%" />
        </DetailCard>
      </DetailGrid>

      <DetailCard>
        <SkeletonBlock $width="32%" />
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <SkeletonBlock $width="42px" $height="42px" $radius="12px" />
            <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: "0.5rem" }}>
              <SkeletonBlock $width="58%" />
              <SkeletonBlock $width="34%" $height="0.8rem" />
            </div>
            <SkeletonBlock $width="88px" />
          </div>
        ))}
      </DetailCard>
    </PageSkeletonContainer>
  );
}

export function TransactionDetailsSkeleton() {
  return (
    <PageSkeletonContainer>
      <ToolbarTopRow>
        <SkeletonBlock $width="120px" $height="40px" $radius="10px" />
        <ToolbarActionsGroup>
          <SkeletonBlock $width="96px" $height="38px" $radius="10px" />
          <SkeletonBlock $width="96px" $height="38px" $radius="10px" />
        </ToolbarActionsGroup>
      </ToolbarTopRow>

      <DetailCard style={{ width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", minWidth: 0, width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.4rem", paddingBottom: "1rem", borderBottom: "1px dashed var(--color-border)", width: "100%" }}>
            <SkeletonBlock $width="80px" $height="18px" $radius="4px" />
            <SkeletonBlock $width="200px" $height="2.2rem" $radius="8px" />
            <SkeletonBlock $width="140px" $height="0.85rem" $radius="4px" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", background: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", overflow: "hidden", width: "100%" }}>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0.75rem", borderBottom: index < 2 ? "1px solid var(--color-border)" : "none", width: "100%" }}>
                  <SkeletonBlock $width="32px" $height="32px" $radius="8px" />
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "4px" }}>
                    <SkeletonBlock $width="60px" $height="0.75rem" $radius="4px" />
                    <SkeletonBlock $width="140px" $height="0.9rem" $radius="4px" />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "1rem", paddingTop: "0.8rem", display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
              <SkeletonBlock $width="80px" $height="0.9rem" $radius="4px" />
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <SkeletonBlock $width="24px" $height="24px" $radius="50%" />
                <SkeletonBlock $width="100px" $height="0.9rem" $radius="4px" />
              </div>
            </div>
          </div>
        </div>
      </DetailCard>
    </PageSkeletonContainer>
  );
}

export function ImportPreviewSkeleton() {
  return (
    <ImportModalSkeletonWrap>
      <SkeletonBlock $width="38%" $height="36px" $radius="12px" />
      <SkeletonBlock $width="100%" $height="44px" $radius="12px" />

      <TableShell>
        <TableHeaderRow>
          <SkeletonBlock $height="0.9rem" />
          <SkeletonBlock $height="0.9rem" />
          <SkeletonBlock $height="0.9rem" />
          <SkeletonBlock $height="0.9rem" />
          <SkeletonBlock $height="0.9rem" />
          <SkeletonBlock $height="0.9rem" />
        </TableHeaderRow>

        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <TableCardRow key={rowIndex}>
            <SkeletonBlock $width="24px" $height="24px" $radius="8px" />
            <SkeletonBlock />
            <SkeletonBlock />
            <SkeletonBlock />
            <SkeletonBlock />
          </TableCardRow>
        ))}
      </TableShell>
    </ImportModalSkeletonWrap>
  );
}

export function SettingsListSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.5rem 0",
            borderBottom: index < 4 ? "1px solid var(--color-border)" : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <SkeletonBlock $width="40px" $height="40px" $radius="12px" />
            <SkeletonBlock $width="140px" $height="1rem" $radius="8px" />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <SkeletonBlock $width="32px" $height="32px" $radius="8px" />
            <SkeletonBlock $width="32px" $height="32px" $radius="8px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MobileDashboardSkeleton() {
  return (
    <PageSkeletonContainer>
      <DetailCard>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
            <SkeletonBlock $width="42%" $height="0.75rem" />
            <SkeletonBlock $width="68%" $height="2rem" />
          </div>
          <SkeletonBlock $width="92px" $height="42px" $radius="12px" />
        </div>
      </DetailCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <MobileSectionCard>
          <SkeletonBlock $width="24px" $height="24px" $radius="8px" />
          <SkeletonBlock $width="46%" $height="0.75rem" />
          <SkeletonBlock $width="74%" $height="1.2rem" />
        </MobileSectionCard>
        <MobileSectionCard>
          <SkeletonBlock $width="24px" $height="24px" $radius="8px" />
          <SkeletonBlock $width="46%" $height="0.75rem" />
          <SkeletonBlock $width="74%" $height="1.2rem" />
        </MobileSectionCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}
          >
            <SkeletonBlock $width="44px" $height="44px" $radius="12px" />
            <SkeletonBlock $width="100%" $height="0.7rem" />
          </div>
        ))}
      </div>

      <MobileSectionCard>
        <SkeletonBlock $width="34%" />
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <SkeletonBlock $width="36px" $height="36px" $radius="12px" />
            <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: "0.45rem" }}>
              <SkeletonBlock $width="54%" />
              <SkeletonBlock $width="32%" $height="0.75rem" />
            </div>
          </div>
        ))}
      </MobileSectionCard>

      <MobileSectionCard>
        <SkeletonBlock $width="38%" />
        <SkeletonBlock $height="180px" $radius="16px" />
      </MobileSectionCard>
    </PageSkeletonContainer>
  );
}
