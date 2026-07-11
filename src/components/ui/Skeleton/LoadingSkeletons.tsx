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

const ToolbarSkeleton = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const ToolbarLeft = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex: 1;
  min-width: 260px;
`;

const ToolbarRight = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
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
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-bg-surface);
`;

const TableSkeletonWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
`;

const TableRow = styled.div`
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

export function PageToolbarSkeleton() {
  return (
    <ToolbarSkeleton>
      <ToolbarLeft>
        <SkeletonBlock $height="44px" $radius="12px" />
        <SkeletonBlock $width="140px" $height="44px" $radius="12px" />
      </ToolbarLeft>
      <ToolbarRight>
        <SkeletonBlock $width="110px" $height="40px" $radius="10px" />
        <SkeletonBlock $width="140px" $height="40px" $radius="10px" />
      </ToolbarRight>
    </ToolbarSkeleton>
  );
}

export function AccountsPageSkeleton() {
  return (
    <PageSkeletonContainer>
      <PageToolbarSkeleton />
      <CardGrid>
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index}>
            <SkeletonBlock $width="48px" $height="48px" $radius="14px" />
            <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: "0.5rem" }}>
              <SkeletonBlock $width="58%" />
              <SkeletonBlock $width="36%" $height="0.875rem" />
            </div>
            <SkeletonBlock $width="92px" $height="1.1rem" />
          </CardSkeleton>
        ))}
      </CardGrid>
    </PageSkeletonContainer>
  );
}

export function TransactionsPageSkeleton() {
  return (
    <PageSkeletonContainer>
      <PageToolbarSkeleton />
      <TableSkeletonWrap>
        <SkeletonBlock $width="180px" $height="34px" $radius="10px" />
        {Array.from({ length: 8 }).map((_, index) => (
          <TableRow key={index}>
            <SkeletonBlock />
            <SkeletonBlock />
            <SkeletonBlock />
            <SkeletonBlock />
            <SkeletonBlock $height="36px" $radius="10px" />
          </TableRow>
        ))}
        <SkeletonBlock $width="220px" $height="34px" $radius="10px" />
      </TableSkeletonWrap>
    </PageSkeletonContainer>
  );
}

export function DashboardSummaryCardSkeleton() {
  return (
    <SummaryCardSkeletonWrap>
      <SkeletonBlock $width="42%" $height="0.9rem" />
      <SkeletonBlock $width="68%" $height="2rem" $radius="10px" />
    </SummaryCardSkeletonWrap>
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
