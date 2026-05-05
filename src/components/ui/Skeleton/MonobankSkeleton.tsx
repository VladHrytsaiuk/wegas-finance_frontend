import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const SkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const SkeletonItem = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-secondary);
`;

const ShimmerBlock = styled.div<{ width?: string; height?: string }>`
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 25%,
    var(--color-border) 50%,
    var(--color-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height || "1rem"};
`;

export function MonobankSkeleton() {
  return (
    <SkeletonContainer>
      {/* Генеруємо 3 фейкові картки */}
      {[1, 2, 3].map((i) => (
        <SkeletonItem key={i}>
          {/* Чекбокс */}
          <ShimmerBlock width="18px" height="18px" />

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {/* Назва картки */}
            <ShimmerBlock width="40%" height="1rem" />
            {/* Опис балансу */}
            <ShimmerBlock width="25%" height="0.8rem" />
          </div>
        </SkeletonItem>
      ))}
    </SkeletonContainer>
  );
}
