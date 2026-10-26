import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { addMonths, format } from "date-fns";
import { HiOutlinePhoto, HiOutlineTrash, HiXMark } from "react-icons/hi2";
import styled from "styled-components";

import type { Goal } from "../../../types";
import { useCreateGoal } from "../../../hooks/Goals/useCreateGoal";
import { useUserRole } from "../../../hooks/useUserRole";
import { getAccountsApi } from "../../../services/apiAccounts";
import { getUsersApi } from "../../../services/apiUsers";
import { useSettings } from "../../../context/SettingsContext";
import { compressImage } from "../../../utils/compressor";
import { CURRENCY_SYMBOLS } from "../../../utils/currency";
import { getUploadedFileUrl } from "../../../utils/helpers";
import { Section, Group, Row, Meta } from "../../../mobile/ui/Group";
import { Segmented } from "../../../mobile/ui/Segmented";
import { PrimaryButton, Sheet } from "../../../mobile/ui/Sheet";
import { Tile } from "../../../mobile/ui/Tile";
import { AppearancePicker } from "../../../mobile/ui/AppearancePicker";
import { AccountPicker } from "../AddSheet/Pickers";

// Створення й редагування цілі: усі поля старої CreateGoalModal. Збереження —
// через той самий useCreateGoal (фото, нова скарбничка або наявний рахунок).

const CURRENCIES = ["UAH", "USD", "EUR"] as const;

const Field = styled.input<{ $align?: "left" | "right" }>`
  flex: 1;
  width: 100%;
  min-width: 0;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 17px;
  color: var(--m-label);
  text-align: ${(p) => p.$align ?? "right"};

  &::placeholder {
    color: var(--m-label-3);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 72px;
  padding: 12px 16px;
  border: none;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
  outline: none;
  resize: vertical;
  font: inherit;
  font-size: 16px;
  color: var(--m-label);
  box-sizing: border-box;

  &::placeholder {
    color: var(--m-label-3);
  }
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button<{ $active: boolean }>`
  height: 34px;
  padding: 0 14px;
  border: none;
  border-radius: 17px;
  font: inherit;
  font-size: 15px;
  cursor: pointer;
  color: ${(p) => (p.$active ? "var(--m-on-accent)" : "var(--m-label)")};
  background: ${(p) => (p.$active ? "var(--m-accent)" : "var(--m-surface)")};
`;

const PhotoPreview = styled.img`
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  border-radius: var(--m-radius-group);
`;

const DeadlineBox = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ClearButton = styled.button`
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 12px;
  background: var(--m-fill);
  color: var(--m-label-2);
  cursor: pointer;
`;

const AddDeadline = styled.button`
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 15px;
  color: var(--m-accent);
  cursor: pointer;
`;

const Error = styled.p`
  margin: -12px 4px 0;
  font-size: 13px;
  color: #ff3b30;
`;

// Сума з будь-яким роздільником → число в основних одиницях.
const toAmount = (value: string) => {
  const n = Number.parseFloat(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

interface GoalFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingGoal?: Goal | null;
}

export function GoalFormSheet({
  open,
  onOpenChange,
  editingGoal,
}: GoalFormSheetProps) {
  const { language } = useSettings();
  const { user: me } = useUserRole();
  const photoInput = useRef<HTMLInputElement>(null);
  const isEdit = !!editingGoal;

  const [name, setName] = useState(editingGoal?.name ?? "");
  const [amount, setAmount] = useState(
    editingGoal
      ? String(editingGoal.target_amount / 100).replace(".", ",")
      : "",
  );
  const [currency, setCurrency] = useState<string>(
    editingGoal?.currency ?? "UAH",
  );
  const [deadline, setDeadline] = useState(
    editingGoal?.date_deadline
      ? format(new Date(editingGoal.date_deadline), "yyyy-MM-dd")
      : "",
  );
  const [linkMode, setLinkMode] = useState<"new" | "existing" | "none">("new");
  const [newAccountName, setNewAccountName] = useState("");
  const [existingAccountId, setExistingAccountId] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">(
    editingGoal?.visibility ?? "public",
  );
  const [hiddenFrom, setHiddenFrom] = useState<string[]>(
    editingGoal?.hidden_from
      ? editingGoal.hidden_from.split(",").filter(Boolean)
      : [],
  );
  const [description, setDescription] = useState(
    editingGoal?.description ?? "",
  );
  const [link, setLink] = useState(editingGoal?.external_link ?? "");
  const [color, setColor] = useState(editingGoal?.color || "#10b981");
  const [icon, setIcon] = useState(editingGoal?.icon || "HiStar");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [picker, setPicker] = useState<null | "account" | "appearance">(null);
  const [tried, setTried] = useState(false);

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccountsApi,
    enabled: open,
  });
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsersApi,
    enabled: open,
  });
  // Як у старій формі: до цілі прив'язують скарбнички й готівку, ще не зайняті іншою ціллю.
  const availableAccounts = useMemo(
    () =>
      accounts.filter(
        (a) =>
          !a.is_group &&
          !a.is_archived &&
          (a.type === "piggy_bank" || a.type === "cash") &&
          (!a.goal_id || a.goal_id === editingGoal?.id),
      ),
    [accounts, editingGoal?.id],
  );
  const members = users.filter((u) => u.id !== me?.id);

  const { submit, isLoading } = useCreateGoal(
    () => onOpenChange(false),
    editingGoal,
  );

  const today = format(new Date(), "yyyy-MM-dd");
  const errors = {
    name: !name.trim() ? "Вкажіть назву" : "",
    amount: toAmount(amount) <= 0 ? "Вкажіть суму" : "",
    deadline:
      deadline && deadline < today ? "Дедлайн не може бути в минулому" : "",
    account:
      !isEdit && linkMode === "new" && !newAccountName.trim() && !name.trim()
        ? "Вкажіть назву рахунку"
        : !isEdit && linkMode === "existing" && !existingAccountId
          ? "Оберіть рахунок"
          : "",
  };
  const valid = !Object.values(errors).some(Boolean);

  const save = () => {
    setTried(true);
    if (!valid) return;
    submit({
      name: name.trim(),
      target_amount: toAmount(amount),
      currency,
      date_deadline: deadline,
      color,
      icon,
      photo_file: photoFile,
      remove_photo: photoRemoved && !photoFile,
      external_link: link.trim(),
      description: description.trim(),
      visibility,
      hidden_from: visibility === "public" ? hiddenFrom.join(",") : "",
      link_mode: isEdit ? "none" : linkMode,
      existing_account_id: existingAccountId || undefined,
      new_account_name: newAccountName.trim() || name.trim(),
    });
  };

  const photoUrl = photoFile
    ? URL.createObjectURL(photoFile)
    : !photoRemoved && editingGoal?.photo_url
      ? getUploadedFileUrl(editingGoal.photo_url)
      : "";
  const existing = availableAccounts.find((a) => a.id === existingAccountId);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Редагування цілі" : "Нова ціль"}
      footer={
        <PrimaryButton type="button" disabled={isLoading} onClick={save}>
          {isLoading ? "Збереження…" : isEdit ? "Зберегти" : "Створити ціль"}
        </PrimaryButton>
      }
    >
      <Group>
        <Row
          leading={<Tile iconName={icon} color={color} size={30} />}
          title={
            <Field
              $align="left"
              type="text"
              aria-label="Назва цілі"
              placeholder="Назва, напр. Відпустка"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          }
          inset={58}
        />
        <Row
          title="Сума"
          trailing={
            <Field
              type="text"
              inputMode="decimal"
              aria-label="Сума цілі"
              placeholder={`0 ${CURRENCY_SYMBOLS[currency] || currency}`}
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value.replace(/[^\d.,\s]/g, ""))
              }
            />
          }
        />
        <Row
          title="Дедлайн"
          trailing={
            // Порожнє поле дати Safari малює сьогоднішньою датою — тому окрема кнопка.
            deadline ? (
              <DeadlineBox>
                <Field
                  type="date"
                  aria-label="Дедлайн"
                  min={today}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
                <ClearButton
                  type="button"
                  aria-label="Прибрати дедлайн"
                  onClick={() => setDeadline("")}
                >
                  <HiXMark size={16} />
                </ClearButton>
              </DeadlineBox>
            ) : (
              <AddDeadline
                type="button"
                onClick={() =>
                  setDeadline(format(addMonths(new Date(), 3), "yyyy-MM-dd"))
                }
              >
                Без дедлайну · Додати
              </AddDeadline>
            )
          }
        />
        <Row
          onClick={() => setPicker("appearance")}
          title="Колір та іконка"
          chevron
        />
      </Group>
      {tried && (errors.name || errors.amount || errors.deadline) && (
        <Error>{errors.name || errors.amount || errors.deadline}</Error>
      )}

      <Segmented
        label="Валюта"
        value={currency as (typeof CURRENCIES)[number]}
        onChange={setCurrency}
        options={CURRENCIES.map((c) => ({
          value: c,
          label: `${CURRENCY_SYMBOLS[c] || ""} ${c}`.trim(),
        }))}
      />

      {!isEdit && (
        <Section caption="Куди відкладати">
          <Segmented
            label="Рахунок цілі"
            value={linkMode}
            onChange={setLinkMode}
            options={[
              { value: "new", label: "Скарбничка" },
              { value: "existing", label: "Наявний" },
              { value: "none", label: "Без рахунку" },
            ]}
          />
          {linkMode === "new" && (
            <Group>
              <Row
                title="Назва"
                trailing={
                  <Field
                    type="text"
                    aria-label="Назва нового рахунку"
                    placeholder={name.trim() || "Скарбничка"}
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                  />
                }
              />
            </Group>
          )}
          {linkMode === "existing" && (
            <Group>
              <Row
                onClick={() => setPicker("account")}
                title="Рахунок"
                trailing={
                  <Meta>
                    {existing?.name ??
                      (availableAccounts.length ? "Оберіть" : "Немає вільних")}
                  </Meta>
                }
                chevron
              />
            </Group>
          )}
          {tried && errors.account && <Error>{errors.account}</Error>}
        </Section>
      )}

      <Section caption="Хто бачить">
        <Segmented
          label="Видимість"
          value={visibility}
          onChange={setVisibility}
          options={[
            { value: "public", label: "Уся сім'я" },
            { value: "private", label: "Лише я" },
          ]}
        />
        {visibility === "public" && members.length > 0 && (
          <>
            <Meta>Приховати від:</Meta>
            <ChipRow role="group" aria-label="Приховати від">
              {members.map((u) => {
                const active = hiddenFrom.includes(u.id);
                return (
                  <Chip
                    key={u.id}
                    type="button"
                    $active={active}
                    aria-pressed={active}
                    onClick={() =>
                      setHiddenFrom(
                        active
                          ? hiddenFrom.filter((id) => id !== u.id)
                          : [...hiddenFrom, u.id],
                      )
                    }
                  >
                    {u.name}
                  </Chip>
                );
              })}
            </ChipRow>
          </>
        )}
      </Section>

      <Section caption="Опис">
        <TextArea
          aria-label="Опис цілі"
          placeholder="Навіщо ця ціль, деталі"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Section>

      <Section caption="Фото й посилання">
        {photoUrl && <PhotoPreview src={photoUrl} alt="" />}
        <Group>
          <Row
            onClick={() => photoInput.current?.click()}
            leading={<HiOutlinePhoto size={22} color="var(--m-accent)" />}
            title={photoUrl ? "Змінити фото" : "Додати фото"}
            inset={50}
          />
          {photoUrl && (
            <Row
              onClick={() => {
                setPhotoFile(null);
                setPhotoRemoved(true);
              }}
              leading={<HiOutlineTrash size={22} color="#ff3b30" />}
              title="Прибрати фото"
              inset={50}
            />
          )}
          <Row
            title="Посилання"
            trailing={
              <Field
                type="url"
                inputMode="url"
                aria-label="Посилання"
                placeholder="https://…"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            }
          />
        </Group>
        <input
          ref={photoInput}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) {
              setPhotoFile(await compressImage(file));
              setPhotoRemoved(false);
            }
          }}
        />
      </Section>

      <AppearancePicker
        open={picker === "appearance"}
        onOpenChange={(next) => !next && setPicker(null)}
        color={color}
        icon={icon}
        onChange={(v) => {
          setColor(v.color);
          setIcon(v.icon);
        }}
      />
      <AccountPicker
        open={picker === "account"}
        onOpenChange={(next) => !next && setPicker(null)}
        title="Рахунок цілі"
        accounts={availableAccounts}
        users={users}
        currentUserId={me?.id}
        value={existingAccountId}
        onSelect={setExistingAccountId}
        language={language}
      />
    </Sheet>
  );
}
