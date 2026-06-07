import { useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineHome,
  HiOutlineCog6Tooth,
  HiOutlineBanknotes,
  HiOutlineWallet,
  HiOutlineChartBar,
  HiOutlineComputerDesktop,
  HiOutlineHeart,
  HiOutlineBolt,
  HiChevronDown,
  HiOutlineArrowsRightLeft,
  HiOutlinePresentationChartLine,
  HiOutlineScale,
  HiOutlineBriefcase,
  HiOutlineTrophy,
  HiOutlineShoppingCart,
  HiOutlineGift, // Іконка для майбутнього Вішліста
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { useWorkspace } from "../context/WorkspaceContext";

// --- Styled Components (КОМПАКТНІША ВЕРСІЯ) ---

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 1px; /* Мінімальний відступ між пунктами */
`;

const StyledNavLink = styled(NavLink)<{ $collapsed: boolean }>`
  user-select: none;
  -webkit-user-select: none; /* Для Safari */
  &:link,
  &:visited {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    width: ${(p) => (p.$collapsed ? "34px" : "100%")}; /* Трохи вужче */
    height: 32px; /* 👈 Зменшено з 38px до 32px */
    padding: 0;
    color: var(--color-text-secondary);
    font-size: 0.85rem; /* 👈 Трохи менший шрифт */
    font-weight: 500;

    @media (max-width: 1300px) {
      font-size: 0.7rem;
      gap: 0.1rem;
    }
    border-radius: 6px; /* Менший радіус */
    transition: all 0.2s;
    margin: 0 auto;
    white-space: nowrap;
    overflow: hidden;
    text-decoration: none;
  }

  &:hover:not(.active) {
    background-color: var(--color-bg-page);
    color: var(--color-text-main);
  }

  &.active {
    color: var(--color-brand-700);
    background-color: var(--color-brand-50);
    font-weight: 600;
  }
`;

const IconBox = styled.div`
  min-width: 34px; /* Узгоджено з шириною посилання */
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  & svg {
    width: 1.1rem; /* 👈 Трохи менші іконки */
    height: 1.1rem;
    color: var(--color-text-light);
  }

  ${StyledNavLink}.active & svg {
    color: var(--color-brand-600);
  }
`;

const Label = styled.span<{ $collapsed: boolean }>`
  opacity: ${(p) => (p.$collapsed ? "0" : "1")};
  transition: opacity 0.3s;
  white-space: nowrap;
`;

const SectionHeader = styled.div<{ $collapsed: boolean }>`
  user-select: none;
  -webkit-user-select: none;
  display: ${(p) => (p.$collapsed ? "none" : "flex")};
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  // 👇 Дуже компактні відступи заголовків
  margin: 0.8rem 0.5rem 0.2rem 0.5rem;
  padding: 2px 4px;
  border-radius: 4px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
`;

const SectionTitle = styled.span`
  font-size: 0.65rem; /* Менший шрифт заголовка */
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  font-weight: 700;
  letter-spacing: 0.05em;
`;

const ChevronIcon = styled(HiChevronDown)<{ $isOpen: boolean }>`
  width: 12px;
  height: 12px;
  transition: transform 0.3s ease;
  transform: ${(p) => (p.$isOpen ? "rotate(0deg)" : "rotate(-90deg)")};
`;

const GroupContent = styled.div<{ $isOpen: boolean; $collapsed: boolean }>`
  display: ${(p) => (p.$collapsed || p.$isOpen ? "block" : "none")};
`;

// --- Component ---

interface MainNavProps {
  isCollapsed: boolean;
  onFeedbackClick?: () => void; // 👈 Додаємо проп для кліку по фідбеку
}

function MainNav({ isCollapsed, onFeedbackClick }: MainNavProps) {
  const { t } = useTranslation();
  const { mode } = useWorkspace();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    analytics: true,
    finance: true,
    planning: true, // Нова група відкрита за замовчуванням
    resources: false, // Ресурси можна згорнути, якщо вони рідко використовуються
    system: true,
    portfolio: true,
    market: true,
  });

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const financeGroups = [
    {
      id: "analytics",
      title: t("navigation:navGroups.analytics"),
      items: [
        {
          to: "/dashboard",
          icon: <HiOutlineHome />,
          label: t("navigation:general.dashboard"),
        },
        {
          to: "/statistics",
          icon: <HiOutlineChartBar />,
          label: t("navigation:general.statistics"),
        },
      ],
    },
    {
      id: "finance",
      title: t("navigation:navGroups.finance"),
      items: [
        {
          to: "/transactions",
          icon: <HiOutlineBanknotes />,
          label: t("navigation:general.transactions"),
        },
        {
          to: "/accounts",
          icon: <HiOutlineWallet />,
          label: t("navigation:general.accounts"),
        },
        {
          to: "/debts",
          icon: <HiOutlineArrowsRightLeft />,
          label: t("navigation:general.debts"),
        },
      ],
    },
    // 👇 НОВА ГРУПА: ПЛАНУВАННЯ
    {
      id: "planning",
      title: t("navigation:navGroups.planning", "Планування"), // Переклад: Planning
      items: [
        {
          to: "/shopping",
          icon: <HiOutlineShoppingCart />,
          label: t("navigation:general.shoppingList", "Список покупок"), // Переклад: Shopping List
        },
        { to: "/goals", icon: <HiOutlineTrophy />, label: t("navigation:general.goals") },
        {
          to: "/wishlist",
          icon: <HiOutlineGift />,
          label: t("navigation:general.wishlist", "Вішліст"),
        },
      ],
    },
    {
      id: "resources",
      title: t("navigation:navGroups.resources"),
      items: [
        {
          to: "/assets",
          icon: <HiOutlineComputerDesktop />,
          label: t("navigation:general.assets"),
        },
        {
          to: "/medical",
          icon: <HiOutlineHeart />,
          label: t("navigation:general.medical"),
        },
        {
          to: "/utility",
          icon: <HiOutlineBolt />,
          label: t("navigation:general.utility"),
        },
      ],
    },
  ];

  const investmentGroups = [
    {
      id: "portfolio",
      title: t("navigation:navGroups.portfolio", "Портфель"),
      items: [
        {
          to: "/investments/dashboard",
          icon: <HiOutlinePresentationChartLine />,
          label: t("navigation:general.overview", "Огляд"),
        },
        {
          to: "/investments/portfolio",
          icon: <HiOutlineBriefcase />,
          label: t("navigation:general.holdings", "Активи"),
        },
      ],
    },
    {
      id: "market",
      title: t("navigation:navGroups.tools", "Інструменти"),
      items: [
        {
          to: "/investments/rebalance",
          icon: <HiOutlineScale />,
          label: t("navigation:general.rebalance", "Ребаланс"),
        },
      ],
    },
  ];

  // СИСТЕМА + ФІДБЕК ТУТ
  const systemGroup = {
    id: "system",
    title: t("navigation:navGroups.system"),
    items: [
      {
        to: "/settings",
        icon: <HiOutlineCog6Tooth />,
        label: t("navigation:general.settings"),
      },
    ],
  };

  const groupsToRender =
    mode === "finance"
      ? [...financeGroups, systemGroup]
      : [...investmentGroups, systemGroup];

  return (
    <nav>
      {groupsToRender.map((group) => {
        const isOpen = openGroups[group.id];
        return (
          <div
            key={group.id}
            style={{ marginBottom: isCollapsed ? "0" : "0.2rem" }}
          >
            <SectionHeader
              $collapsed={isCollapsed}
              onClick={() => toggleGroup(group.id)}
            >
              <SectionTitle>{group.title}</SectionTitle>
              <ChevronIcon $isOpen={isOpen} />
            </SectionHeader>

            <GroupContent $collapsed={isCollapsed} $isOpen={isOpen}>
              <NavList>
                {group.items.map((item) => (
                  <li key={item.to}>
                    <StyledNavLink
                      to={item.to}
                      $collapsed={isCollapsed}
                      onClick={(item as any).onClick} // Обробка кліку для фідбеку
                      end={
                        item.to === "/dashboard" ||
                        item.to === "/investments/dashboard"
                      }
                    >
                      <IconBox>{item.icon}</IconBox>
                      <Label $collapsed={isCollapsed}>{item.label}</Label>
                    </StyledNavLink>
                  </li>
                ))}
              </NavList>
            </GroupContent>
          </div>
        );
      })}
    </nav>
  );
}

export default MainNav;
