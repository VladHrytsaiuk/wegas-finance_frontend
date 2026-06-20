import React, { useState } from "react";
import { createPortal } from "react-dom";
import { HiOutlineUserPlus, HiOutlineUserGroup, HiOutlineLink, HiXMark } from "react-icons/hi2";

import Modal, {
  Overlay,
  StyledModal,
  ModalCloseButton,
  BottomSheetPanel,
  DragHandle,
  BottomSheetContent,
} from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import { CenteredSpinner } from "../../components/ui/CenteredSpinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { UserCard } from "../../components/users/UserCard";
import { UserForm } from "../../components/users/UserForms";

import { useUsers } from "../../hooks/Settings/useUsers";
import { useFamilySettings } from "../../hooks/Settings/useFamilySettings";
import { useIsMobile } from "../../hooks/useIsMobile";
import MobilePageHeader from "../../components/mobile/MobilePageHeader";
import { GenerateInviteCodeSection } from "./GenerateInviteCodeSection";
import { JoinFamilySection } from "./JoinFamilySection";
import { AddMemberChoiceModal } from "./AddMemberChoiceModal";
import { FAB } from "../../components/ui/FAB";

import * as S from "./FamilySettings.styles";

// Helper component for local modals to ensure visual consistency
const LocalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  padding?: string;
}> = ({ isOpen, onClose, children, padding }) => {
  const isMobile = useIsMobile();
  if (!isOpen) return null;

  if (isMobile) {
    return createPortal(
      <Overlay $isBottomSheet onClick={onClose}>
        <BottomSheetPanel onClick={(e) => e.stopPropagation()}>
          <DragHandle />
          <ModalCloseButton onClick={onClose}>
            <HiXMark />
          </ModalCloseButton>
          <BottomSheetContent $padding={padding}>
            {children}
          </BottomSheetContent>
        </BottomSheetPanel>
      </Overlay>,
      document.body
    );
  }

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

function FamilySettings() {
  // Explicit boolean states for addition-related modals
  const [isChoiceOpen, setIsChoiceOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);

  const { state: usersState, actions: usersActions, t } = useUsers();
  const { state: teamState, actions: teamActions } = useFamilySettings({
    onMemberJoined: () => setIsInviteOpen(false),
  });

  const { users, isLoading, isAdding, isUpdating, isDeleting, canManageTeam } = usersState;
  const isMobile = useIsMobile();

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
      {isMobile ? (
        <MobilePageHeader 
          title={t("settings:usersPage.team_list_title", "Учасники родини")} 
          rightAction={
            <Button 
              variation="secondary" 
              size="small" 
              onClick={() => setIsJoinOpen(true)}
              style={{ border: 'none', boxShadow: 'none', background: 'transparent', padding: '8px' }}
            >
              <HiOutlineLink size={24} style={{ color: 'var(--color-brand-600)' }} />
            </Button>
          }
        />
      ) : (
        <S.FamilyContainer style={{ paddingBottom: 0 }}>
          <S.HeaderRow style={{ borderBottom: "none", marginBottom: 0 }}>
            <S.SectionTitle>{t("settings:usersPage.team_list_title", "Учасники родини")}</S.SectionTitle>
            
            <Button 
              variation="secondary" 
              icon={<HiOutlineLink size="medium" />}
              onClick={() => setIsJoinOpen(true)}
            >
              {t("settings:usersPage.btn_join", "Приєднатися до родини")}
            </Button>
          </S.HeaderRow>
        </S.FamilyContainer>
      )}

      <S.FamilyContainer style={{ padding: isMobile ? "0" : undefined }}>

        <section style={{ padding: isMobile ? "16px" : undefined }}>
          {isLoading && <CenteredSpinner />}

          {!isLoading && users.length === 0 && (
            <EmptyState
              isFullPage={false}
              icon={<HiOutlineUserGroup />}
              title={t("settings:usersPage.status_empty", "Родина порожня")}
            />
          )}

          <S.UserGrid>
            {users.map((user: any) => (
              <div key={user.id} style={{ display: "flex", flexDirection: "column" }}>
                <UserCard user={user} canManage={canManageTeam} />

                {/* Edit & Delete modals still use the string-based Modal system from parent/Layout */}
                <Modal.Window name={`edit-user-${user.id}`} mobileBottomSheet>
                  <S.ModalContent style={{ width: isMobile ? "100%" : "900px" }}>
                    <S.ModalTitle>{t("settings:usersPage.modal_edit_title")}</S.ModalTitle>
                    <UserForm
                      initialData={user}
                      onSubmit={(data) => usersActions.handleUpdate(user.id, data)}
                      isLoading={isUpdating}
                    />
                  </S.ModalContent>
                </Modal.Window>

                <Modal.Window name={`delete-user-${user.id}`} mobileBottomSheet>
                  <ConfirmDelete
                    resourceName={`${t("settings:usersPage.resource_user")} ${user.name}`}
                    onConfirm={() => usersActions.handleDelete(user.id)}
                    disabled={isDeleting}
                  />
                </Modal.Window>
              </div>
            ))}

            {canManageTeam && !isMobile && (
              <S.AddMemberCard onClick={() => setIsChoiceOpen(true)}>
                <HiOutlineUserPlus />
                <span>{t("settings:usersPage.btn_add_user")}</span>
              </S.AddMemberCard>
            )}
          </S.UserGrid>

          {isMobile && canManageTeam && (
            <FAB onClick={() => setIsChoiceOpen(true)} icon={<HiOutlineUserPlus />} />
          )}
        </section>

        {/* --- EXPLICIT MODALS --- */}

        {/* Choice Modal */}
        <LocalModal isOpen={isChoiceOpen} onClose={() => setIsChoiceOpen(false)}>
          <S.ModalContent style={{ width: isMobile ? "100%" : "450px" }}>
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
          <S.ModalContent style={{ width: isMobile ? "100%" : "500px" }}>
            <GenerateInviteCodeSection
              inviteCode={teamState.inviteCode}
              timeLeft={teamState.timeLeft}
              formattedTime={teamState.formattedTime}
              isGenerating={teamState.isGenerating}
              onGenerate={(roleID) => teamActions.generateInviteCode(roleID)}
              t={t}
            />
          </S.ModalContent>
        </LocalModal>

        {/* Join Family Modal */}
        <LocalModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)}>
          <S.ModalContent style={{ width: isMobile ? "100%" : "500px" }}>
            <JoinFamilySection
              isJoining={teamState.isJoining}
              onJoin={async (code) => {
                const success = await teamActions.joinFamily(code);
                if (success) setIsJoinOpen(false);
              }}
              t={t}
            />
          </S.ModalContent>
        </LocalModal>

        {/* Manual Add User Modal */}
        <LocalModal isOpen={isManualAddOpen} onClose={() => setIsManualAddOpen(false)}>
          <S.ModalContent style={{ width: isMobile ? "100%" : "900px" }}>
            <S.ModalTitle>{t("settings:usersPage.modal_add_title")}</S.ModalTitle>
            <UserForm 
              onSubmit={async (data) => {
                const success = await usersActions.addUser(data);
                if (success !== false) setIsManualAddOpen(false);
              }} 
              onCloseModal={() => setIsManualAddOpen(false)}
              isLoading={isAdding} 
            />
          </S.ModalContent>
        </LocalModal>

      </S.FamilyContainer>
    </Modal>
  );
}


export default FamilySettings;
;
