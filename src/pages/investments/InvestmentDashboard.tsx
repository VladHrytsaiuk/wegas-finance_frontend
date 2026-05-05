import styled from "styled-components";

const Container = styled.div`
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: var(--shadow-sm);
  text-align: center;
`;

const Title = styled.h2`
  color: var(--color-brand-700);
  margin-bottom: 1rem;
`;

function InvestmentDashboard() {
  return (
    <Container>
      <Title>📈 Інвестиційний Дашборд</Title>
      <p>Тут будуть графіки акцій, облігацій та крипти.</p>
    </Container>
  );
}

export default InvestmentDashboard;
