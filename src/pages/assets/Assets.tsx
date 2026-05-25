import { HiPlus } from "react-icons/hi2";

import Modal from "../../components/ui/Modal";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import { Button } from "../../components/ui/Button";
import AssetForm from "./AssetForm";
import AssetsTable from "../../components/assets/AssetsTable";
import { ReceiptViewer } from "../../components/transactions/ReceiptViewer";

import { useAssets } from "../../hooks/Assets/useAssets";
import * as S from "./Assets.styles";

export default function Assets() {
  const { state, actions, helpers, t } = useAssets();
  const { assets, isLoading, isDeleting } = state;

  if (isLoading) return <p>{t("common:shared.loading")}</p>;

  return (
    <S.PageContainer>
      <Modal>
        <S.ActionsBar>
          <Modal.Open opens="create-asset">
            <Button>
              <HiPlus />
              <span>{t("assets:assetsPage.button_add")}</span>
            </Button>
          </Modal.Open>
        </S.ActionsBar>

        {/* Винесена таблиця */}
        <AssetsTable
          assets={assets}
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
