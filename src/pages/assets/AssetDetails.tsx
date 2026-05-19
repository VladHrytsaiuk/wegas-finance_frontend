import {
  HiArrowLeft,
  HiCurrencyDollar,
  HiShieldCheck,
  HiPhoto,
  HiOutlineCube,
  HiOutlineArrowTrendingUp,
  HiOutlineReceiptPercent,
  HiCalendarDays,
  HiPencil,
  HiTrash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationCircle,
  HiOutlineWrenchScrewdriver,
  HiArrowsPointingOut,
  HiMapPin,
  HiFingerPrint,
  HiTruck,
  HiHome,
  HiSquare2Stack,
  HiIdentification,
  HiDocumentText,
  HiOutlineArrowDownTray,
} from "react-icons/hi2";

import { Button } from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import { TransactionItem } from "../../components/transactions/TransactionItem";
import { ReceiptViewer } from "../../components/transactions/ReceiptViewer";
import AssetForm from "./AssetForm";

import { useAssetDetails } from "../../hooks/Assets/useAssetDetails";
import * as S from "./AssetDetails.styles";

import { getUploadedFileUrl } from "../../utils/helpers"; // Не забудь додати імпорт

const ReceiptViewerWrapper = ({
  imageUrls,
  onCloseModal,
}: {
  imageUrls: string[];
  onCloseModal?: () => void;
}) => (
  <S.ViewerWrapper
    ref={(node) => {
      if (node && node.parentElement) {
        Array.from(node.parentElement.children).forEach((child) => {
          if (child.tagName === "BUTTON") {
            (child as HTMLElement).style.display = "none";
          }
        });
      }
    }}
  >
    <ReceiptViewer imageUrls={imageUrls} onClose={onCloseModal} />
  </S.ViewerWrapper>
);

export default function AssetDetails() {
  const { state, actions, helpers, t } = useAssetDetails();
  const {
    asset,
    isLoading,
    transactions,
    categories,
    stats,
    warrantyInfo,
    baseCurrency,
    language,
    images,
    mainPhotoUrl,
  } = state;

  if (isLoading) return <Spinner />;

  if (!asset) {
    return (
      <S.NotFoundState>
        <HiOutlineCube size={64} color="var(--color-text-tertiary)" />
        <h2>{t("assets:assetDetails.not_found")}</h2>
        <Button
          variation="secondary"
          onClick={() => actions.navigate("/assets")}
        >
          {t("legacy:transactionPage.back_to_list")}
        </Button>
      </S.NotFoundState>
    );
  }

  const isCar = asset.type === "car";
  const isRealEstate = ["real_estate", "apartment", "house"].includes(
    asset.type,
  );
  const showWarranty = asset.warranty_end && asset.warranty_end > 0;

  // Перевіряємо чи є документи
  const hasDocuments = asset.documents && asset.documents.length > 0;

  return (
    <S.PageContainer>
      <Modal>
        <S.HeaderSection>
          <S.HeaderLeft>
            <S.BackButton onClick={() => actions.navigate("/assets")}>
              <HiArrowLeft size={18} />
              <span>{t("assets:assetDetails.back_to_list")}</span>
            </S.BackButton>
            <S.AssetTitleBlock>
              <h1>{asset.name}</h1>
              <S.AssetTypeBadge>
                {t(`assetForm.type_${asset.type}`, asset.type)}
              </S.AssetTypeBadge>
            </S.AssetTitleBlock>
          </S.HeaderLeft>

          <S.HeaderActions>
            <Modal.Open opens="edit-asset">
              <Button variation="secondary">
                <HiPencil /> {t("assets:assetDetails.edit_asset")}
              </Button>
            </Modal.Open>
            <Modal.Open opens="delete-asset">
              <Button variation="danger">
                <HiTrash /> {t("assets:assetDetails.delete_asset")}
              </Button>
            </Modal.Open>
          </S.HeaderActions>
        </S.HeaderSection>

        <S.TopGrid>
          {/* --- ФІНАНСОВА КАРТКА --- */}
          <S.StyledCard>
            <S.CardHeader>
              <HiCurrencyDollar size={24} />
              <h3>{t("assets:assetDetails.financial_info")}</h3>
            </S.CardHeader>
            <S.MainValueBlock>
              <span className="label">{t("assets:assetDetails.current_value")}</span>
              <span className="value">
                {helpers.formatPrice(
                  asset.current_price || asset.price,
                  asset.currency,
                )}
              </span>
            </S.MainValueBlock>
            <S.MetaDataGrid>
              <S.MetaItem>
                <div className="icon-label">
                  <HiCalendarDays /> {t("assets:assetsPage.table_date")}
                </div>
                <div className="data">
                  {helpers.formatDate(asset.purchase_date)}
                </div>
              </S.MetaItem>
              <S.MetaItem>
                <div className="icon-label">
                  <HiOutlineReceiptPercent /> {t("assets:assetDetails.purchase_price")}
                </div>
                <div className="data">
                  {helpers.formatPrice(asset.price, asset.currency)}
                </div>
              </S.MetaItem>

              {!isCar && !isRealEstate && (
                <S.MetaItem $fullWidth>
                  <div className="icon-label">
                    # {t("assets:assetDetails.serial_number")}
                  </div>
                  <S.MonoData className="data">
                    {asset.serial_number || "—"}
                  </S.MonoData>
                </S.MetaItem>
              )}
            </S.MetaDataGrid>
          </S.StyledCard>

          {/* --- ФОТО --- */}
          <S.StyledCard $noPadding>
            <S.PhotoContainer>
              {mainPhotoUrl ? (
                <>
                  {/* 🔥 Показуємо бейдж, якщо фотографій більше ніж 1 */}
                  {images.length > 1 && (
                    <S.PhotoCountBadge>
                      <HiPhoto size={16} /> +{images.length - 1}{" "}
                      {t("assets:assetDetails.photo_plural", {
                        count: images.length - 1,
                      })}
                    </S.PhotoCountBadge>
                  )}

                  <Modal.Open opens="view-photo">
                    <img
                      src={mainPhotoUrl}
                      alt={asset.name}
                      style={{ cursor: "pointer" }}
                    />
                  </Modal.Open>

                  <S.PhotoOverlayBtn>
                    <Modal.Open opens="view-photo">
                      <Button size="small" variation="secondary">
                        <HiArrowsPointingOut />{" "}
                        <span>{t("assets:assetDetails.open_gallery")}</span>
                      </Button>
                    </Modal.Open>
                  </S.PhotoOverlayBtn>
                </>
              ) : (
                <S.PhotoPlaceholder>
                  <div className="icon-box">
                    <HiPhoto />
                  </div>
                  <span>{t("assets:assetDetails.photo_missing")}</span>
                </S.PhotoPlaceholder>
              )}
            </S.PhotoContainer>
          </S.StyledCard>
        </S.TopGrid>

        {/* --- СПЕЦИФІКАЦІЇ --- */}
        {(isCar || isRealEstate) && (
          <S.StyledCard>
            <S.CardHeader>
              {isCar ? <HiTruck size={24} /> : <HiHome size={24} />}
              <h3>{t("assets:assetDetails.specifications_title")}</h3>
            </S.CardHeader>
            <S.MetaDataGrid>
              {isCar && (
                <>
                  <S.MetaItem>
                    <div className="icon-label">
                      <HiIdentification /> {t("assets:assetDetails.mileage")}
                    </div>
                    <div className="data">
                      {asset.mileage
                        ? `${asset.mileage.toLocaleString()} km`
                        : "—"}
                    </div>
                  </S.MetaItem>
                  <S.MetaItem>
                    <div className="icon-label">
                      <HiFingerPrint /> VIN Code
                    </div>
                    <S.MonoData className="data">
                      {asset.vin_code || "—"}
                    </S.MonoData>
                  </S.MetaItem>
                  <S.MetaItem>
                    <div className="icon-label">
                      <HiShieldCheck /> {t("assets:assetDetails.insurance_expiry")}
                    </div>
                    <div className="data">
                      {helpers.formatDate(asset.insurance_expiry)}
                    </div>
                  </S.MetaItem>
                  <S.MetaItem>
                    <div className="icon-label">
                      <HiOutlineWrenchScrewdriver />{" "}
                      {t("assets:assetDetails.last_service")}
                    </div>
                    <div className="data">
                      {helpers.formatDate(asset.last_service_date)}
                    </div>
                  </S.MetaItem>
                </>
              )}
              {isRealEstate && (
                <>
                  <S.MetaItem $fullWidth>
                    <div className="icon-label">
                      <HiMapPin /> {t("assets:assetDetails.address")}
                    </div>
                    <div className="data">{asset.address || "—"}</div>
                  </S.MetaItem>
                  <S.MetaItem>
                    <div className="icon-label">
                      <HiSquare2Stack /> {t("assets:assetDetails.area")}
                    </div>
                    <div className="data">
                      {asset.area ? `${asset.area} m²` : "—"}
                    </div>
                  </S.MetaItem>
                  <S.MetaItem>
                    <div className="icon-label">
                      <HiFingerPrint /> {t("assets:assetDetails.cadastral_num")}
                    </div>
                    <S.MonoData className="data">
                      {asset.cadastral_num || "—"}
                    </S.MonoData>
                  </S.MetaItem>
                </>
              )}
            </S.MetaDataGrid>
          </S.StyledCard>
        )}

        <S.MetricsGrid>
          {/* --- ВАРТІСТЬ ВОЛОДІННЯ (TCO) --- */}
          <S.StyledCard>
            <S.CardHeader>
              <HiOutlineCube size={24} />
              <h3>{t("assets:assetDetails.tco_title")}</h3>
            </S.CardHeader>

            <S.TCOWrapper>
              <S.TCOBreakdown>
                <S.TCORow>
                  <div className="label-group">
                    <span>{t("assets:assetDetails.tco_purchase")}</span>
                  </div>
                  <span className="value">
                    {helpers.formatPrice(stats.purchase, asset.currency)}
                  </span>
                </S.TCORow>
                <S.TCORow>
                  <div className="label-group">
                    <span>{t("assets:assetDetails.tco_maintenance")}</span>
                  </div>
                  <span className="value expense">
                    + {helpers.formatPrice(stats.maintenance, asset.currency)}
                  </span>
                </S.TCORow>
              </S.TCOBreakdown>

              <S.TCOTotal>
                <span className="label">{t("assets:assetDetails.tco_total")}</span>
                <span className="value">
                  {helpers.formatPrice(stats.tco, asset.currency)}
                </span>
              </S.TCOTotal>
            </S.TCOWrapper>
          </S.StyledCard>

          {/* --- ГАРАНТІЯ --- */}
          <S.StyledCard $isInactive={!showWarranty || !warrantyInfo}>
            <S.CardHeader>
              <HiShieldCheck size={24} />
              <h3>{t("assets:assetDetails.warranty_title", "Гарантія")}</h3>
            </S.CardHeader>

            {showWarranty && warrantyInfo ? (
              <S.WarrantyContainer>
                <S.WarrantyInfo>
                  <S.WarrantyMainDate>
                    <div className="label">
                      {t("assets:assetDetails.warranty_end_date_label")}
                    </div>
                    <div className="value">
                      {helpers.formatDate(asset.warranty_end)}
                    </div>
                  </S.WarrantyMainDate>
                  <S.WarrantyStatusBadge $color={warrantyInfo.statusColor}>
                    {warrantyInfo.isExpired ? (
                      <>
                        <HiOutlineXCircle size={18} />{" "}
                        {t("assets:assetDetails.warranty_expired")}
                      </>
                    ) : warrantyInfo.percent > 85 ? (
                      <>
                        <HiOutlineExclamationCircle size={18} />{" "}
                        {t("assets:assetDetails.warranty_expiring")}
                      </>
                    ) : (
                      <>
                        <HiOutlineCheckCircle size={18} />{" "}
                        {t("assets:assetDetails.warranty_active_label")} (
                        {warrantyInfo.daysLeft} {t("assets:assetDetails.days_suffix", "дн.")})
                      </>
                    )}
                  </S.WarrantyStatusBadge>
                </S.WarrantyInfo>

                <S.WarrantyProgressBlock>
                  <S.ProgressBar>
                    <S.ProgressFill
                      $percent={warrantyInfo.percent}
                      $color={warrantyInfo.statusColor}
                    />
                  </S.ProgressBar>
                  <S.ProgressLabels>
                    <span>{helpers.formatDate(asset.purchase_date)}</span>
                    <span>{Math.round(warrantyInfo.percent)}%</span>
                    <span>{helpers.formatDate(asset.warranty_end)}</span>
                  </S.ProgressLabels>
                </S.WarrantyProgressBlock>
              </S.WarrantyContainer>
            ) : (
              <S.InactiveMessage>
                {t(
                  "assetDetails.warranty_not_applicable",
                  "Гарантія не вказана",
                )}
              </S.InactiveMessage>
            )}
          </S.StyledCard>
        </S.MetricsGrid>

        {/* --- 🔥 ДОКУМЕНТИ (Окрема секція на всю ширину) --- */}
        {hasDocuments && (
          <S.StyledCard>
            <S.CardHeader>
              <HiDocumentText size={24} />
              <h3>
                {t("assets:assetDetails.documents_title", "Прикріплені документи")}
              </h3>
            </S.CardHeader>

            <S.DocumentsGrid>
              {asset.documents!.map((doc) => {
                const fileUrl = getUploadedFileUrl(doc.path); // Все стає в один рядок!

                return (
                  <S.DocumentItem key={doc.id}>
                    <div className="doc-info">
                      <HiDocumentText size={24} />
                      <S.DocName title={doc.name}>{doc.name}</S.DocName>
                    </div>
                    <div className="doc-actions">
                      <Button
                        size="small"
                        variation="secondary"
                        onClick={() => window.open(fileUrl, "_blank")}
                      >
                        <HiOutlineArrowDownTray size={16} />{" "}
                        {t("assets:assetsPage.viewer_download")}
                      </Button>
                    </div>
                  </S.DocumentItem>
                );
              })}
            </S.DocumentsGrid>
          </S.StyledCard>
        )}

        <S.StyledCard $noPadding>
          <S.CardHeaderPadded>
            <S.CardHeader>
              <HiOutlineArrowTrendingUp size={24} />
              <h3>{t("assets:assetDetails.history_title")}</h3>
            </S.CardHeader>
          </S.CardHeaderPadded>

          {transactions.length > 0 ? (
            <div>
              {transactions.map((tx: any) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  categories={categories}
                  currency={baseCurrency}
                  language={language}
                  hideAccountColumn={true}
                  onClick={() => actions.navigate(`/transactions/${tx.id}`)}
                />
              ))}
            </div>
          ) : (
            <S.EmptyHistoryState>
              <HiOutlineWrenchScrewdriver size={48} />
              <span>{t("assets:assetDetails.history_empty")}</span>
            </S.EmptyHistoryState>
          )}
        </S.StyledCard>

        {/* --- MODALS --- */}
        <Modal.Window name="edit-asset">
          <AssetForm assetToEdit={asset} />
        </Modal.Window>

        <Modal.Window name="delete-asset">
          <ConfirmDelete
            resourceName={t("assets:assetsPage.resource_name", { name: asset.name })}
            onConfirm={() => actions.handleDelete(asset.id)}
            disabled={state.isDeleting}
          />
        </Modal.Window>

        <Modal.Window name="view-photo">
          <ReceiptViewerWrapper imageUrls={images} />
        </Modal.Window>
      </Modal>
    </S.PageContainer>
  );
}
