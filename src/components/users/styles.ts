import styled from "styled-components";

// === Styled Components ===
export const Card = styled.div<{ $roleColor: string }>`
  background-color: var(--color-bg-page);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, border-color 0.2s;

  &:hover {
    border-color: ${(props) => props.$roleColor};
    transform: translateY(-2px);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background-color: ${(props) => props.$roleColor};
  }
`;

export const UserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const Avatar = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--color-text-secondary);

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const UserName = styled.span`
  font-weight: 600;
  color: var(--color-text-main);
`;

export const UserEmail = styled.span`
  font-size: 0.85rem;
  color: var(--color-text-secondary);
`;

export const RoleBadge = styled.div<{ $color: string }>`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  background-color: ${(props) => props.$color}15;
  color: ${(props) => props.$color};
`;

export const ActionButtons = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-light);
  padding: 0.2rem;
  transition: color 0.2s;

  &:hover {
    color: var(--color-brand-600);
  }

  &.delete:hover {
    color: var(--color-red-700);
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

// === Styles for Role Selection ===
export const RoleLabel = styled.label<{ $isActive: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  border: ${(props) =>
    props.$isActive
      ? `2px solid ${props.$color}`
      : "1px solid var(--color-border)"};
  background-color: ${(props) =>
    props.$isActive ? `${props.$color}10` : "transparent"};
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-bg-page);
  }
`;

export const FormLayout = styled.form`
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 2rem;
  align-items: stretch;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem; /* Space between field blocks */
  height: 100%;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* Consistent gap between Label and Input/Group */
`;

export const Label = styled.label`
  display: block;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
`;

export const RoleSelectionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Increased gap between role cards */
  height: 100%;
`;

export const ButtonRow = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
`;
