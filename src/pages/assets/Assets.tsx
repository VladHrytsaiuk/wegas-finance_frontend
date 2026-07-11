import { HiPlus } from "react-icons/hi2";
import { usePageTitle } from "../../hooks/usePageTitle";

import Modal from "../../components/ui/Modal";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import { Button } from "../../components/ui/Button";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";
import AssetForm from "./AssetForm";
import AssetsTable from "../../components/assets/AssetsTable";
import { ReceiptViewer } from "../../components/transactions/ReceiptViewer";
import { CenteredSpinner } from "../../components/ui/CenteredSpinner";
import { ListPageSkeleton } from "../../components/ui/Skeleton/LoadingSkeletons";
import { EmptyState } from "../../components/ui/EmptyState";
import { HiOutlineCube } from "react-icons/hi2";

import { useAssets } from "../../hooks/Assets/useAssets";
import { useAssetsFilter } from "../../hooks/Assets/useAssetsFilter";
import { useIsMobile } from "../../hooks/useIsMobile";
import MobilePageHeader from "../../components/mobile/MobilePageHeader";
import * as S from "./Assets.styles";
import { FAB } from "../../components/ui/FAB";

export default function Assets() {
  const { state, actions, helpers, t } = useAssets();
  const isMobile = useIsMobile();
  usePageTitle(t("navigation:general.assets", "Майно"));
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

  if (isLoading) return <ListPageSkeleton viewMode="table" />;

  return (
    <>
      {isMobile && <MobilePageHeader title={t("navigation:general.assets", "Майно")} />}
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
          {!isMobile && (
            <Modal.Open opens="create-asset">
              <Button variation="primary" size="medium" icon={<HiPlus />}>
                {t("assets:assetsPage.button_add")}
              </Button>
            </Modal.Open>
          )}
        </TableToolbar>

        {/* Винесена таблиця */}
        {filteredAssets.length === 0 ? (
          <EmptyState
            icon={<HiOutlineCube />}
            title={t("assets:assetsPage.status_empty_title")}
            description={
              searchQuery
                ? t("common:common.no_results")
                : t("assets:assetsPage.status_empty_desc")
            }
          />
        ) : (
          <AssetsTable
            assets={filteredAssets}
            helpers={helpers}
            actions={actions}
            t={t}
          />
        )}

        {/* --- MODAL WINDOWS --- */}
        <Modal.Window name="create-asset" padding="0" mobileBottomSheet>
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

              <Modal.Window name={`edit-asset-${item.id}`} padding="0" mobileBottomSheet>
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

        {isMobile && (
          <Modal.Open opens="create-asset">
            <FAB />
          </Modal.Open>
        )}
      </Modal>
    </S.PageContainer>
  </>
  );
}
