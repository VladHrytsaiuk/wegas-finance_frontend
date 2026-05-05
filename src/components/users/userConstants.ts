import {
  HiOutlineBriefcase,
  HiOutlineRocketLaunch,
  HiOutlineStar,
} from "react-icons/hi2";

export const FUN_ROLES = [
  {
    id: "admin",
    label: "CEO Сім'ї",
    icon: HiOutlineStar,
    desc: "Повний контроль, право вето.",
    color: "#f59f00",
  },
  {
    id: "member",
    label: "Акціонер",
    icon: HiOutlineBriefcase,
    desc: "Партнер з правом голосу.",
    color: "#10b981",
  },
  {
    id: "child",
    label: "Стартапер",
    icon: HiOutlineRocketLaunch,
    desc: "Вчиться керувати бюджетом.",
    color: "#3b82f6",
  },
];

export const getRoleConfig = (roleId: string) => {
  return FUN_ROLES.find((r) => r.id === roleId) || FUN_ROLES[1];
};
