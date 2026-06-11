import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const TeamContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
  background-color: transparent;
`;

export const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

export const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin: 0;
`;

export const SectionDescription = styled.p`
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0;
`;

export const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

export const CodeDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  background-color: var(--color-bg-page);
  border: 2px dashed var(--color-brand-500);
  border-radius: var(--border-radius-md);
  animation: ${fadeIn} 0.2s ease-out;
  margin-top: 1rem;
`;

export const CodeText = styled.span`
  font-family: var(--font-mono, monospace);
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  color: var(--color-brand-600);
`;

export const TimerText = styled.span<{ $isUrgent: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: var(--font-mono, monospace);
  color: ${(props) => (props.$isUrgent ? "var(--color-red-600)" : "var(--color-text-secondary)")};
  background-color: var(--color-bg-surface);
  padding: 0.4rem 0.8rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid ${(props) => (props.$isUrgent ? "var(--color-red-200)" : "var(--color-border)")};
`;

// --- OTP STYLES ---

export const OtpContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin: 1rem 0;
`;

export const OtpBox = styled.input`
  width: 3.5rem;
  height: 4rem;
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  font-family: var(--font-mono, monospace);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background-color: var(--color-bg-surface);
  color: var(--color-text-main);
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
    background-color: var(--color-brand-50);
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }

  &::placeholder {
    color: var(--color-text-tertiary);
  }
`;

// --- ADD MEMBER PLACEHOLDER CARD ---

export const AddMemberCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem; /* Match UserCard padding */
  background-color: transparent;
  border: 2px dashed var(--color-border);
  border-radius: 12px; /* Match UserCard border-radius */
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%; /* Ensure it stretches to grid row height */
  min-height: 160px; /* Sensible minimum that aligns with UserCard */

  @media (max-width: 1300px) {
    padding: 1rem;
  }

  &:hover {
    border-color: var(--color-brand-500);
    background-color: var(--color-brand-50);
    transform: translateY(-2px); /* Match UserCard hover lift */

    & svg {
      color: var(--color-brand-600);
      transform: scale(1.1);
    }

    & span {
      color: var(--color-brand-700);
    }
  }

  & svg {
    width: 2.5rem;
    height: 2.5rem;
    color: var(--color-text-tertiary);
    transition: all 0.3s;
  }

  & span {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    transition: all 0.3s;
  }
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);

  @media (max-width: 1300px) {
    padding-bottom: 0.5rem;
  }
`;

export const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  align-items: stretch; /* Ensure all items in a row have same height */

  @media (max-width: 1300px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }
`;

export const ModalContent = styled.div`
  width: 900px;
  max-width: 95vw;
`;

export const ModalTitle = styled.h3`
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: var(--color-text-main);
`;
