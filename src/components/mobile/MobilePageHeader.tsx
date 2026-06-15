import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { HiOutlineChevronLeft } from "react-icons/hi2";

const StyledHeader = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-bg-surface);
  padding: 16px 12px;
  padding-top: max(16px, env(safe-area-inset-top));
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: var(--color-brand-600);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;

  &:active {
    background-color: var(--color-bg-hover);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-main);
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface MobilePageHeaderProps {
  title: string;
  onBack?: () => void;
}

function MobilePageHeader({ title, onBack }: MobilePageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <StyledHeader>
      <BackButton onClick={handleBack} aria-label="Назад">
        <HiOutlineChevronLeft strokeWidth={2.5} />
      </BackButton>
      <Title>{title}</Title>
    </StyledHeader>
  );
}

export default MobilePageHeader;
