import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiCheckCircle, HiOutlinePhoto, HiXMark } from "react-icons/hi2";
import toast from "react-hot-toast";
import styled from "styled-components";

import { sendFeedback } from "../services/apiFeedback";
import { Group, Row } from "./ui/Group";
import { ActivityIndicator } from "./ui/Loader";
import { Segmented } from "./ui/Segmented";
import { PrimaryButton, Sheet } from "./ui/Sheet";

// «Підтримка / Баг» у стилі iOS: те саме, що вміло спливаюче віконце
// FeedbackWidget — опис, важливість, до 5 скріншотів, контакт — але нижньою панеллю.

type Priority = "low" | "medium" | "high";
const MAX_IMAGES = 5;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px 16px;
  border: none;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
  outline: none;
  resize: none;
  font: inherit;
  font-size: 17px;
  line-height: 1.35;
  color: var(--m-label);
  box-sizing: border-box;

  &::placeholder {
    color: var(--m-label-3);
  }
`;

const Field = styled.input`
  flex: 1;
  width: 100%;
  min-width: 0;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 17px;
  color: var(--m-label);

  &::placeholder {
    color: var(--m-label-3);
  }
`;

const Thumbs = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
`;

const Thumb = styled.div`
  position: relative;
  flex: 0 0 auto;
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--m-fill);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  button {
    position: absolute;
    top: 4px;
    right: 4px;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    cursor: pointer;
  }
`;

const Done = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 16px;
  text-align: center;
  color: var(--m-label-2);

  svg {
    color: var(--m-accent);
  }

  strong {
    font-size: 20px;
    color: var(--m-label);
  }
`;

interface FeedbackSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackSheet({ open, onOpenChange }: FeedbackSheetProps) {
  const { t } = useTranslation();
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [images, setImages] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const previews = useMemo(
    () => images.map((file) => URL.createObjectURL(file)),
    [images],
  );
  useEffect(
    () => () => previews.forEach((url) => URL.revokeObjectURL(url)),
    [previews],
  );

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      // Після успіху форму очищаємо; чернетку, що не відправлена, лишаємо.
      if (sent) {
        setMessage("");
        setContact("");
        setImages([]);
        setSent(false);
      }
    }
  };

  const addImages = (files: File[]) => {
    const valid = files.filter((file) => file.type.startsWith("image/"));
    const slots = MAX_IMAGES - images.length;
    if (!valid.length) return;
    if (slots <= 0) {
      toast.error(t("common:feedback_modal.max_images_error"));
      return;
    }
    setImages((prev) => [...prev, ...valid.slice(0, slots)]);
  };

  const submit = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const data = new FormData();
      data.append("name", localStorage.getItem("user_name") || "User");
      data.append("contact", contact);
      data.append("message", message);
      data.append("priority", priority);
      images.forEach((file) => data.append("images", file));
      await sendFeedback(data);
      setSent(true);
    } catch {
      toast.error(t("common:feedback_modal.send_error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={close}
      title={t("common:feedback_modal.title")}
      hideCancel={sent}
      footer={
        sent ? undefined : (
          <PrimaryButton
            type="button"
            disabled={!message.trim() || sending}
            onClick={submit}
          >
            {sending ? (
              <ActivityIndicator
                size={20}
                color="var(--m-on-accent)"
                label={t("common:feedback_modal.sending")}
              />
            ) : (
              t("common:feedback_modal.submit_button")
            )}
          </PrimaryButton>
        )
      }
    >
      {sent ? (
        <Done>
          <HiCheckCircle size={56} />
          <strong>{t("common:feedback.success_title")}</strong>
          {t("common:feedback.success_message")}
        </Done>
      ) : (
        <>
          <Segmented
            label={t("common:feedback_modal.title")}
            value={priority}
            onChange={setPriority}
            options={[
              { value: "low", label: t("common:feedback_modal.type_idea") },
              {
                value: "medium",
                label: t("common:feedback_modal.type_normal"),
              },
              {
                value: "high",
                label: t("common:feedback_modal.type_critical"),
              },
            ]}
          />
          <TextArea
            aria-label={t("common:feedback_modal.placeholder_description")}
            placeholder={t("common:feedback_modal.placeholder_description")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {previews.length > 0 && (
            <Thumbs>
              {previews.map((url, index) => (
                <Thumb key={url}>
                  <img src={url} alt="" />
                  <button
                    type="button"
                    aria-label="×"
                    onClick={() =>
                      setImages((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <HiXMark size={14} />
                  </button>
                </Thumb>
              ))}
            </Thumbs>
          )}
          <Group>
            <Row
              onClick={() => fileInput.current?.click()}
              leading={<HiOutlinePhoto size={22} color="var(--m-accent)" />}
              title={`${t("common:feedback_modal.add_screenshot")}${images.length ? ` · ${images.length}/${MAX_IMAGES}` : ""}`}
              inset={50}
            />
            <Row
              title={
                <Field
                  type="text"
                  aria-label={t("common:feedback_modal.placeholder_contact")}
                  placeholder={t("common:feedback_modal.placeholder_contact")}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              }
            />
          </Group>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              e.target.value = "";
              addImages(files);
            }}
          />
        </>
      )}
    </Sheet>
  );
}
