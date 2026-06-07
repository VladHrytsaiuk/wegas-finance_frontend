import { HiOutlineUserPlus, HiOutlineUserGroup } from "react-icons/hi2";

import Modal from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import { CenteredSpinner } from "../../components/ui/CenteredSpinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { UserCard } from "../../components/users/UserCard";
import { UserForm } from "../../components/users/UserForms";

import { useUsers } from "../../hooks/Settings/useUsers";
import * as S from "./Users.styles";

function Users() {
  const { state, actions, t } = useUsers();
  const { users, isLoading, isAdding, isUpdating, isDeleting, canManageTeam } =
    state;

  return (
    <Modal>
      <S.HeaderRow>
        <S.SectionTitle>{t("settings:usersPage.title")}</S.SectionTitle>
        {canManageTeam && (
          <Modal.Open opens="add-user">
            <Button icon={<HiOutlineUserPlus size="medium" />}>
              {t("settings:usersPage.button_add_user")}
            </Button>
          </Modal.Open>
        )}
      </S.HeaderRow>

      {isLoading && <CenteredSpinner />}

      {!isLoading && users.length === 0 && (
        <EmptyState
          isFullPage={false}
          icon={<HiOutlineUserGroup />}
          title={t("settings:usersPage.status_empty", "Команда порожня")}
        />
      )}

      <S.UserGrid>
        {users.map((user: any) => (
          <div key={user.id}>
            <UserCard user={user} canManage={canManageTeam} />

            {/* Edit User Modal */}
            <Modal.Window name={`edit-user-${user.id}`}>
              <S.ModalContent>
                <S.ModalTitle>{t("settings:usersPage.modal_edit_title")}</S.ModalTitle>
                <UserForm
                  initialData={user}
                  onSubmit={(data) => actions.handleUpdate(user.id, data)}
                  isLoading={isUpdating}
                />
              </S.ModalContent>
            </Modal.Window>

            {/* Delete User Modal */}
            <Modal.Window name={`delete-user-${user.id}`}>
              <ConfirmDelete
                resourceName={`${t("settings:usersPage.resource_user")} ${user.name}`}
                onConfirm={() => actions.handleDelete(user.id)}
                disabled={isDeleting}
              />
            </Modal.Window>
          </div>
        ))}
      </S.UserGrid>

      {/* Add User Modal */}
      <Modal.Window name="add-user">
        <S.ModalContent>
          <S.ModalTitle>{t("settings:usersPage.modal_add_title")}</S.ModalTitle>
          <UserForm onSubmit={actions.addUser} isLoading={isAdding} />
        </S.ModalContent>
      </Modal.Window>
    </Modal>
  );
}

export default Users;
