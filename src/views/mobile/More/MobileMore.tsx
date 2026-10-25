import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineChartBar,
  HiOutlineFlag,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineGift,
  HiOutlineCube,
  HiOutlineBolt,
  HiOutlineCog6Tooth,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

import { usePageTitle } from "../../../hooks/usePageTitle";
import { useUserRole } from "../../../hooks/useUserRole";
import { useSettings } from "../../../context/SettingsContext";
import { formatMoney } from "../../../utils/helpers";
import { getGoalsApi } from "../../../services/apiGoals";
import { getShoppingListsApi } from "../../../services/apiShopping";
import { getCounterpartiesApi } from "../../../services/apiCounterparties";
import { Screen, LargeTitle } from "../../../mobile/ui/Screen";
import { Section, Group, Row, Meta } from "../../../mobile/ui/Group";
import { Tile } from "../../../mobile/ui/Tile";

interface Item {
  to: string;
  label: string;
  icon: ReactNode;
  detail?: string;
}

const icon = (node: ReactNode) => <Tile icon={node} tint="gray" size={30} />;

function MobileMore() {
  usePageTitle("Ще");
  const { user } = useUserRole();
  const { currency, language } = useSettings();

  const { data: goals = [] } = useQuery({ queryKey: ["goals"], queryFn: getGoalsApi });
  const { data: lists = [] } = useQuery({ queryKey: ["shopping-lists"], queryFn: getShoppingListsApi });
  const { data: counterparties = [] } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
  });

  const activeGoals = goals.filter((g) => g.status === "active").length;
  const itemsLeft = lists.reduce(
    (sum, list) => sum + (list.items || []).filter((i) => !i.is_bought).length,
    0,
  );
  const owedToUs = counterparties.reduce(
    (sum, cp) =>
      sum +
      (cp.balances || [])
        .filter((b) => b.currency === currency && b.balance > 0)
        .reduce((s, b) => s + b.balance, 0),
    0,
  );

  const sections: { caption?: string; items: Item[] }[] = [
    {
      items: [{ to: "/statistics", label: "Статистика", icon: <HiOutlineChartBar size={18} /> }],
    },
    {
      caption: "Сімʼя",
      items: [
        {
          to: "/goals",
          label: "Цілі",
          icon: <HiOutlineFlag size={18} />,
          detail: activeGoals > 0 ? `${activeGoals} активн${activeGoals === 1 ? "а" : "і"}` : undefined,
        },
        {
          to: "/debts",
          label: "Борги",
          icon: <HiOutlineUsers size={18} />,
          detail: owedToUs > 0 ? `вам винні ${formatMoney(owedToUs, currency, language, false)}` : undefined,
        },
        {
          to: "/shopping",
          label: "Покупки",
          icon: <HiOutlineCheckCircle size={18} />,
          detail: itemsLeft > 0 ? String(itemsLeft) : undefined,
        },
        { to: "/wishlist", label: "Вішліст", icon: <HiOutlineGift size={18} /> },
      ],
    },
    {
      caption: "Дім",
      items: [
        { to: "/assets", label: "Активи", icon: <HiOutlineCube size={18} /> },
        { to: "/utility", label: "Комуналка", icon: <HiOutlineBolt size={18} /> },
      ],
    },
    {
      items: [
        { to: "/settings", label: "Налаштування", icon: <HiOutlineCog6Tooth size={18} /> },
        ...((user as { is_platform_admin?: boolean } | undefined)?.is_platform_admin
          ? [{ to: "/admin", label: "Адмін-панель", icon: <HiOutlineShieldCheck size={18} /> }]
          : []),
      ],
    },
  ];

  return (
    <Screen>
      <LargeTitle title="Ще" />
      {sections.map((section, index) => (
        <Section key={index} caption={section.caption}>
          <Group>
            {section.items.map((item) => (
              <Row
                key={item.to}
                to={item.to}
                leading={icon(item.icon)}
                title={item.label}
                trailing={item.detail && <Meta>{item.detail}</Meta>}
                inset={58}
                chevron
              />
            ))}
          </Group>
        </Section>
      ))}
    </Screen>
  );
}

export default MobileMore;
