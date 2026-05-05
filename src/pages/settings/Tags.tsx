import { HiPlus } from "react-icons/hi2";

import Modal from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";
import { TagForm } from "../../components/tags/TagForm";
import { TagItem } from "../../components/tags/TagItem";

import { useTags } from "../../hooks/Settings/useTags";
import * as S from "./Tags.styles";

function Tags() {
  const { state, actions, config, t } = useTags();
  const { tags, isLoading, isCreating, isDeleting, searchQuery, sortBy } =
    state;

  return (
    <Modal>
      {/* HEADER */}
      <S.HeaderRow>
        <S.SectionTitle>{t("tagsPage.title")}</S.SectionTitle>
        <Modal.Open opens="create-tag">
          <Button icon={<HiPlus />} size="medium">
            {t("tagsPage.button_create_tag")}
          </Button>
        </Modal.Open>
      </S.HeaderRow>

      {/* TOOLBAR */}
      <S.ControlsRow>
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={actions.setSearchQuery}
          searchPlaceholder={t("tagsPage.search_placeholder")}
          searchPosition="inline"
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
      {isLoading ? (
        <S.SpinnerContainer>
          <Spinner />
        </S.SpinnerContainer>
      ) : (
        <S.TagList>
          {tags.length === 0 ? (
            <S.EmptyState>{t("tagsPage.status_empty")}</S.EmptyState>
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

      {/* CREATE MODAL */}
      <Modal.Window name="create-tag">
        <S.ModalContent>
          <S.ModalTitle>{t("tagsPage.modal_create_title")}</S.ModalTitle>
          <TagForm onSubmit={actions.create} isLoading={isCreating} />
        </S.ModalContent>
      </Modal.Window>
    </Modal>
  );
}

export default Tags;
