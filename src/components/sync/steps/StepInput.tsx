import { useTranslation } from "react-i18next";
import { HiExclamationCircle } from "react-icons/hi2";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import Spinner from "../../ui/Spinner";
import * as S from "../MonobankModal.styles";

export default function StepInput({ state, actions, onClose }: any) {
  const { t } = useTranslation();
  const { token, isPending, error } = state;

  return (
    <S.ContentWrapper>
      <S.HeaderRow>
        <S.Title>
          <img
            src="https://api.monobank.ua/favicon.ico"
            alt="Monobank"
            style={{ width: "28px", height: "28px", borderRadius: "50%" }}
          />
          {t("settings:profilePage.mono_title", "Синхронізація з Monobank")}
        </S.Title>
      </S.HeaderRow>

      <div style={{ flex: 1 }}>
        <S.Description>
          Для підключення перейдіть на{" "}
          <a
            href="https://api.monobank.ua/"
            target="_blank"
            rel="noreferrer"
            style={{
              color: "var(--color-brand-600)",
              textDecoration: "underline",
            }}
          >
            api.monobank.ua
          </a>
          , скопіюйте токен та вставте його нижче.
        </S.Description>

        <div style={{ marginTop: "1.5rem" }}>
          <Input
            placeholder="Вставте X-Token сюди"
            value={token}
            onChange={(e) => actions.setToken(e.target.value)}
            disabled={isPending}
            type="password"
            style={error ? { borderColor: "var(--color-error)" } : {}}
          />
          {error && (
            <S.ErrorMessage>
              <HiExclamationCircle /> {error}
            </S.ErrorMessage>
          )}
        </div>
      </div>
      <S.FooterRow>
        <Button type="button" $variation="secondary" onClick={onClose}>
          Скасувати
        </Button>
        <Button
          onClick={() => actions.handleConnect()}
          disabled={!token || isPending}
        >
          {isPending ? <Spinner size="sm" /> : "Підключити"}
        </Button>
      </S.FooterRow>
    </S.ContentWrapper>
  );
}
