import { HiPlus } from "react-icons/hi2";

import Modal from "../../components/ui/Modal";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import { Button } from "../../components/ui/Button";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";
import AssetForm from "./AssetForm";
import AssetsTable from "../../components/assets/AssetsTable";
import { ReceiptViewer } from "../../components/transactions/ReceiptViewer";
import { CenteredSpinner } from "../../components/ui/CenteredSpinner";

import { useAssets } from "../../hooks/Assets/useAssets";
import { useAssetsFilter } from "../../hooks/Assets/useAssetsFilter";
import * as S from "./Assets.styles";

export default function Assets() {
  const { state, actions, helpers, t } = useAssets();
  const { assets, isLoading, isDeleting } = state;

  const {
    searchQuery,
    setSearchQuery,
    filters,
    filtersConfig,
    sortBy,
    setSortBy,
    filteredAssets,
    sortOptions,
    handleFilterChange,
    handleClearAll,
  } = useAssetsFilter(assets);

  if (isLoading) return <CenteredSpinner />;

  return (
    <S.PageContainer>
      <Modal>
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={t(
            "assets:assetsPage.search_placeholder",
            "Пошук активів...",
          )}
          searchPosition="top"
          filtersConfig={filtersConfig}
          filterValues={filters}
          onFilterChange={handleFilterChange}
          sortOptions={sortOptions}
          sortValue={sortBy}
          onSortChange={setSortBy}
          onClearAll={handleClearAll}
        >
          <Modal.Open opens="create-asset">
            <Button variation="primary" size="medium" icon={<HiPlus />}>
              {t("assets:assetsPage.button_add")}
            </Button>
          </Modal.Open>
        </TableToolbar>

        {/* Винесена таблиця */}
        <AssetsTable
          assets={filteredAssets}
          helpers={helpers}
          actions={actions}
          t={t}
        />

        {/* --- MODAL WINDOWS --- */}
        <Modal.Window name="create-asset" padding="0">
          <AssetForm />
        </Modal.Window>

        {assets?.map((item) => {
          const images = helpers.getAssetImages(item);
          return (
            <div key={item.id}>
              <Modal.Window name={`delete-asset-${item.id}`}>
                <ConfirmDelete
                  resourceName={t("assets:assetsPage.resource_name", {
                    name: item.name,
                  })}
                  onConfirm={() => actions.handleDelete(item.id)}
                  disabled={isDeleting}
                />
              </Modal.Window>

              <Modal.Window name={`edit-asset-${item.id}`} padding="0">
                <AssetForm assetToEdit={item} />
              </Modal.Window>

              {images.length > 0 && (
                <Modal.Window name={`view-photo-${item.id}`}>
                  <ReceiptViewer imageUrls={images} />
                </Modal.Window>
              )}
            </div>
          );
        })}
      </Modal>
    </S.PageContainer>
  );
}
