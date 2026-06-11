import React, { useState } from "react";
import { createPortal } from "react-dom";
import { HiOutlineUserPlus, HiOutlineUserGroup, HiOutlineLink, HiXMark } from "react-icons/hi2";

import { Overlay, StyledModal, ModalCloseButton } from "../../components/ui/Modal";
import Modal from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import { CenteredSpinner } from "../../components/ui/CenteredSpinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { UserCard } from "../../components/users/UserCard";
import { UserForm } from "../../components/users/UserForms";

import { useUsers } from "../../hooks/Settings/useUsers";
import { useTeamSettings } from "../../hooks/Settings/useTeamSettings";
import { GenerateInviteCodeSection } from "./GenerateInviteCodeSection";
import { JoinFamilySection } from "./JoinFamilySection";
import { AddMemberChoiceModal } from "./AddMemberChoiceModal";

import * as S from "./TeamSettings.styles";

// Helper component for local modals to ensure visual consistency
const LocalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  padding?: string;
}> = ({ isOpen, onClose, children, padding }) => {
  if (!isOpen) return null;

  return createPortal(
    <Overlay onClick={onClose}>
      <StyledModal $padding={padding} onClick={(e) => e.stopPropagation()}>
        <ModalCloseButton onClick={onClose}>
          <HiXMark />
        </ModalCloseButton>
        {children}
      </StyledModal>
    </Overlay>,
    document.body
  );
};

function TeamSettings() {
  const { state: usersState, actions: usersActions, t } = useUsers();
  const { state: teamState, actions: teamActions } = useTeamSettings();

  // Explicit boolean states for addition-related modals
  const [isChoiceOpen, setIsChoiceOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);

  const { users, isLoading, isAdding, isUpdating, isDeleting, canManageTeam } = usersState;

  const handleOpenInvite = () => {
    setIsChoiceOpen(false);
    setIsInviteOpen(true);
  };

  const handleOpenManual = () => {
    setIsChoiceOpen(false);
    setIsManualAddOpen(true);
  };

  return (
    <Modal>
      <S.TeamContainer>
        <S.HeaderRow style={{ borderBottom: "none", marginBottom: 0 }}>
          <S.SectionTitle>{t("settings:usersPage.team_list_title", "Склад команди")}</S.SectionTitle>
          
          <Button 
            variation="secondary" 
            icon={<HiOutlineLink size="medium" />}
            onClick={() => setIsJoinOpen(true)}
          >
            {t("settings:usersPage.btn_join", "Приєднатися до сім'ї")}
          </Button>
        </S.HeaderRow>

        <section>
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
              <div key={user.id} style={{ display: "flex", flexDirection: "column" }}>
                <UserCard user={user} canManage={canManageTeam} />

                {/* Edit & Delete modals still use the string-based Modal system from parent/Layout */}
                <Modal.Window name={`edit-user-${user.id}`}>
                  <S.ModalContent>
                    <S.ModalTitle>{t("settings:usersPage.modal_edit_title")}</S.ModalTitle>
                    <UserForm
                      initialData={user}
                      onSubmit={(data) => usersActions.handleUpdate(user.id, data)}
                      isLoading={isUpdating}
                    />
                  </S.ModalContent>
                </Modal.Window>

                <Modal.Window name={`delete-user-${user.id}`}>
                  <ConfirmDelete
                    resourceName={`${t("settings:usersPage.resource_user")} ${user.name}`}
                    onConfirm={() => usersActions.handleDelete(user.id)}
                    disabled={isDeleting}
                  />
                </Modal.Window>
              </div>
            ))}

            {canManageTeam && (
              <S.AddMemberCard onClick={() => setIsChoiceOpen(true)}>
                <HiOutlineUserPlus />
                <span>{t("settings:usersPage.btn_add_user", "Додати учасника")}</span>
              </S.AddMemberCard>
            )}
          </S.UserGrid>
        </section>

        {/* --- EXPLICIT MODALS --- */}

        {/* Choice Modal */}
        <LocalModal isOpen={isChoiceOpen} onClose={() => setIsChoiceOpen(false)}>
          <S.ModalContent style={{ width: "450px" }}>
            <S.ModalTitle>{t("settings:usersPage.modal_add_title", "Додати учасника")}</S.ModalTitle>
            <AddMemberChoiceModal
              onInviteViaCode={handleOpenInvite}
              onCreateManually={handleOpenManual}
              t={t}
            />
          </S.ModalContent>
        </LocalModal>

        {/* Generate Code Modal */}
        <LocalModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)}>
          <S.ModalContent>
            <GenerateInviteCodeSection
              inviteCode={teamState.inviteCode}
              timeLeft={teamState.timeLeft}
              formattedTime={teamState.formattedTime}
              isGenerating={teamState.isGenerating}
              onGenerate={teamActions.generateInviteCode}
              t={t}
            />
          </S.ModalContent>
        </LocalModal>

        {/* Join Family Modal */}
        <LocalModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)}>
          <S.ModalContent>
            <JoinFamilySection
              isJoining={teamState.isJoining}
              onJoin={(code) => {
                teamActions.joinFamily(code);
                // Optionally close on success, but JoinFamilySection usually stays open until it handles error/success
              }}
              t={t}
            />
          </S.ModalContent>
        </LocalModal>

        {/* Manual Add User Modal */}
        <LocalModal isOpen={isManualAddOpen} onClose={() => setIsManualAddOpen(false)}>
          <S.ModalContent>
            <S.ModalTitle>{t("settings:usersPage.modal_add_title")}</S.ModalTitle>
            <UserForm 
              onSubmit={async (data) => {
                await usersActions.addUser(data);
                setIsManualAddOpen(false);
              }} 
              isLoading={isAdding} 
            />
          </S.ModalContent>
        </LocalModal>

      </S.TeamContainer>
    </Modal>
  );
}


export default TeamSettings;
