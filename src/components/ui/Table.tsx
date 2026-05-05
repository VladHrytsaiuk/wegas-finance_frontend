import { ReactNode, createContext } from "react";
import styled from "styled-components";

// --- STYLES ---

const StyledTableWrapper = styled.div`
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);

  /* Плавний скрол на мобільних пристроях */
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
`;

const StyledTable = styled.table`
  width: 100%; /* Замість max-content, щоб таблиця була гнучкою */
  min-width: 400px; /* Запобігає надмірному злипанню контенту */
  border-collapse: collapse;
  font-size: 0.95rem;
`;

const StyledHeader = styled.thead`
  background-color: var(--color-bg-page);
  border-bottom: 1px solid var(--color-border);

  & tr th {
    text-align: left;
    padding: 1rem 1.2rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;

    /* Адаптивні відступи для мобільних */
    @media (max-width: 768px) {
      padding: 0.8rem 0.6rem;
    }
  }
`;

const StyledBody = styled.tbody``;

const StyledRow = styled.tr<{ $isClickable?: boolean }>`
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.2s;
  cursor: ${(p) => (p.$isClickable ? "pointer" : "default")};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--color-bg-page);
  }
`;

const StyledCell = styled.td`
  padding: 0.8rem 1.2rem;
  color: var(--color-text-main);
  vertical-align: middle;

  /* Адаптивні відступи для мобільних */
  @media (max-width: 768px) {
    padding: 0.6rem 0.6rem;
  }

  /* Якщо в клітинці тільки іконка/кнопка, центруємо її по висоті */
  & svg {
    display: block;
  }
`;

const StyledEmpty = styled.div`
  padding: 2.4rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
`;

// --- COMPONENT LOGIC ---

const TableContext = createContext({});

function Table({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <TableContext.Provider value={{}}>
      <StyledTableWrapper className={className}>
        <StyledTable role="table">{children}</StyledTable>
      </StyledTableWrapper>
    </TableContext.Provider>
  );
}

function Header({ children }: { children: ReactNode }) {
  return <StyledHeader>{children}</StyledHeader>;
}

function Body({ children }: { children: ReactNode }) {
  return <StyledBody>{children}</StyledBody>;
}

function Row({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <StyledRow onClick={onClick} $isClickable={!!onClick} className={className}>
      {children}
    </StyledRow>
  );
}

function Cell({
  children,
  className,
  colSpan,
  style,
}: {
  children: ReactNode;
  className?: string;
  colSpan?: number;
  style?: React.CSSProperties;
}) {
  return (
    <StyledCell className={className} colSpan={colSpan} style={style}>
      {children}
    </StyledCell>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <StyledBody>
      <StyledRow>
        <StyledCell colSpan={100}>
          <StyledEmpty>{children}</StyledEmpty>
        </StyledCell>
      </StyledRow>
    </StyledBody>
  );
}

Table.Header = Header;
Table.Body = Body;
Table.Row = Row;
Table.Cell = Cell;
Table.Empty = Empty;

export default Table;
