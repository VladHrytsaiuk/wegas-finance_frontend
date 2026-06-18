import { HiPlus, HiTag } from "react-icons/hi2";

import Modal, { useModal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { CenteredSpinner } from "../../components/ui/CenteredSpinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";
import { TagForm } from "../../components/tags/TagForm";
import { TagItem } from "../../components/tags/TagItem";
import { FAB } from "../../components/ui/FAB";

import { useTags } from "../../hooks/Settings/useTags";
import { useIsMobile } from "../../hooks/useIsMobile";
import MobilePageHeader from "../../components/mobile/MobilePageHeader";
import * as S from "./Tags.styles";

function Tags() {
  return (
    <Modal>
      <TagsContent />
    </Modal>
  );
}

function TagsContent() {
  const { state, actions, config, t } = useTags();
  const { tags, isLoading, isCreating, isDeleting, searchQuery, sortBy } =
    state;
  const isMobile = useIsMobile();
  const { open } = useModal();

  return (
    <>
      {isMobile && <MobilePageHeader title={t("settings:tagsPage.title")} />}
      <div style={{ padding: isMobile ? "0" : undefined }}>
        {/* HEADER */}
        {!isMobile && (
          <S.HeaderRow>
            <S.SectionTitle>{t("settings:tagsPage.title")}</S.SectionTitle>
            <Modal.Open opens="create-tag">
              <Button icon={<HiPlus />} size="medium">
                {t("settings:tagsPage.button_create_tag")}
              </Button>
            </Modal.Open>
          </S.HeaderRow>
        )}

        {/* TOOLBAR */}
        <S.ControlsRow style={{ padding: isMobile ? "12px 16px" : undefined }}>
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={actions.setSearchQuery}
            searchPlaceholder={t("settings:tagsPage.search_placeholder")}
            searchPosition="top"
            filtersConfig={[]} // Теги поки не мають складних фільтрів
            filterValues={{}}
            onFilterChange={() => {}}
            sortOptions={config.sortOptions}
            sortValue={sortBy}
            onSortChange={actions.setSortBy}
            onClearAll={actions.handleClearAll}
          />
        </S.ControlsRow>

        {/* CONTENT LIST */}
        <div style={{ padding: isMobile ? "0 16px 80px 16px" : undefined }}>
          {isLoading ? (
            <CenteredSpinner />
          ) : (
            <S.TagList>
              {tags.length === 0 ? (
                <EmptyState
                  isFullPage={false}
                  icon={<HiTag />}
                  title={t("settings:tagsPage.status_empty")}
                />
              ) : (
                tags.map((tag: any) => (
                  <TagItem
                    key={tag.id}
                    tag={tag}
                    onDelete={actions.remove}
                    isDeleting={isDeleting}
                  />
                ))
              )}
            </S.TagList>
          )}
        </div>

        {isMobile && (
          <FAB onClick={() => open("create-tag")} />
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal.Window name="create-tag" mobileBottomSheet>
        <S.ModalContent>
          <S.ModalTitle>{t("settings:tagsPage.modal_create_title")}</S.ModalTitle>
          <TagForm onSubmit={actions.create} isLoading={isCreating} />
        </S.ModalContent>
      </Modal.Window>
    </>
  );
}

export default Tags;
