import styled from "styled-components";
import {
  HiChevronLeft,
  HiChevronRight,
  HiChevronDoubleLeft,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  /* Прибираємо margin-top і border-top звідси, 
     щоб компонент був універсальним (і для верху, і для низу).
     Відступи краще задавати у батьківському компоненті або через пропси. 
  */
  padding: 0.5rem 0;
  width: 100%;
`;

const PageInfo = styled.span`
  font-size: 0.9rem;
  color: var(--color-text-secondary);

  strong {
    font-weight: 600;
    color: var(--color-text-main);
  }
`;

const PageButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-main);
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--color-bg-page);
    border-color: var(--color-text-secondary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--color-bg-page);
    color: var(--color-text-light);
  }
`;

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string; // Додаємо можливість передати стилі ззовні
}

export const Pagination = ({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  isLoading = false,
  className,
}: PaginationProps) => {
  const { t } = useTranslation();

  const pageCount = Math.ceil(totalCount / pageSize);

  if (pageCount <= 1) return null;

  const handleFirst = () => {
    if (currentPage > 1) onPageChange(1);
  };

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < pageCount) onPageChange(currentPage + 1);
  };

  return (
    <PaginationContainer className={className}>
      <PageInfo>
        {t("pagination.page_info", { current: currentPage, total: pageCount })}
        <span style={{ marginLeft: "8px", opacity: 0.7 }}>
          {t("pagination.total_count_info", { count: totalCount })}
        </span>
      </PageInfo>

      <PageButtons>
        {/* Кнопка "На першу сторінку" */}
        <PaginationButton
          onClick={handleFirst}
          disabled={currentPage === 1 || isLoading}
          title={t("pagination.tooltip_first")}
        >
          <HiChevronDoubleLeft size={20} />
        </PaginationButton>

        <PaginationButton
          onClick={handlePrev}
          disabled={currentPage === 1 || isLoading}
          title={t("pagination.tooltip_prev")}
        >
          <HiChevronLeft size={20} />
        </PaginationButton>

        <PaginationButton
          onClick={handleNext}
          disabled={currentPage === pageCount || isLoading}
          title={t("pagination.tooltip_next")}
        >
          <HiChevronRight size={20} />
        </PaginationButton>
      </PageButtons>
    </PaginationContainer>
  );
};
