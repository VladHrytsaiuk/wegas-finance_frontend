import { HiOutlineUser, HiPencil, HiTrash } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import Modal from "../ui/Modal";
import { getRoleConfig } from "./userConstants";
import {
  Card,
  UserHeader,
  Avatar,
  UserInfo,
  UserName,
  UserEmail,
  RoleBadge,
  ActionButtons,
  IconButton,
} from "./styles";

interface UserCardProps {
  user: any;
  canManage: boolean;
}

export function UserCard({ user, canManage }: UserCardProps) {
  const { t } = useTranslation();
  const roleConfig = getRoleConfig(user.role_id);
  const RoleIcon = roleConfig.icon;

  return (
    <Card $roleColor={roleConfig.color}>
      <UserHeader>
        <Avatar>
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name || t("userCard.default_name")}
            />
          ) : (
            <HiOutlineUser />
          )}
        </Avatar>
        <UserInfo>
          <UserName>{user.name}</UserName>
          <UserEmail>{user.email}</UserEmail>
        </UserInfo>
      </UserHeader>

      <RoleBadge $color={roleConfig.color}>
        <RoleIcon />
        {/* Перекладаємо назву ролі динамічно на основі її ID */}
        {t(`userRoles.${user.role_id}_label`)}
      </RoleBadge>

      {canManage && (
        <ActionButtons>
          <Modal.Open opens={`edit-user-${user.id}`}>
            <IconButton title={t("userCard.tooltip_edit")}>
              <HiPencil />
            </IconButton>
          </Modal.Open>

          <Modal.Open opens={`delete-user-${user.id}`}>
            <IconButton className="delete" title={t("userCard.tooltip_delete")}>
              <HiTrash />
            </IconButton>
          </Modal.Open>
        </ActionButtons>
      )}
    </Card>
  );
}
