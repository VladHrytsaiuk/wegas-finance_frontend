import { useState, useEffect, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import {
  HiPaperAirplane,
  HiXMark,
  HiCheckCircle,
  HiPhoto,
  HiExclamationTriangle,
  HiLightBulb,
  HiInformationCircle,
} from "react-icons/hi2";
import { sendFeedback } from "../../services/apiFeedback";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useEscapeKey } from "../../hooks/useEscapeKey";

// --- 1. АНІМАЦІЇ ---

const springIn = keyframes`
  0% { opacity: 0; transform: translateY(12px) scale(0.96); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

const springOut = keyframes`
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(12px) scale(0.96); pointer-events: none; }
`;

const popCheck = keyframes`
  0% { transform: scale(0) rotate(-45deg); opacity: 0; }
  70% { transform: scale(1.2) rotate(0deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
`;

// --- 2. СТИЛІ ---

const WidgetContainer = styled.div<{
  $collapsed: boolean;
  $isClosing: boolean;
  $isDragging: boolean;
}>`
  position: absolute;
  bottom: 100px;
  left: ${(p) => (p.$collapsed ? "60px" : "10px")};
  width: 340px;

  background-color: var(--color-bg-surface);
  backdrop-filter: blur(12px);
  border: 2px solid
    ${(p) => (p.$isDragging ? "var(--color-brand-600)" : "var(--color-border)")};
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.12);
  padding: 1.5rem;
  z-index: 2000;
  overflow: hidden;

  animation: ${(p) => (p.$isClosing ? springOut : springIn)} 0.3s
    cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: border-color 0.2s;

  &::after {
    content: "";
    position: absolute;
    bottom: -9px;
    left: ${(p) => (p.$collapsed ? "10px" : "24px")};
    width: 14px;
    height: 14px;
    background: inherit;
    border-bottom: 1px solid
      ${(p) =>
        p.$isDragging ? "var(--color-brand-600)" : "var(--color-border)"};
    border-right: 1px solid
      ${(p) =>
        p.$isDragging ? "var(--color-brand-600)" : "var(--color-border)"};
    transform: rotate(45deg);
    border-radius: 0 0 4px 0;
  }
`;

const DragOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  @media (prefers-color-scheme: dark) {
    background: rgba(30, 30, 30, 0.9);
  }
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-brand-600);
  font-weight: 600;
  pointer-events: none;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h4 {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--color-text-main);
    margin: 0;
  }
`;

const SubText = styled.p`
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
  margin: -0.8rem 0 1rem 0;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  &:hover {
    background-color: var(--color-bg-page);
    color: var(--color-text-main);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

// --- Стилі для пріоритетів ---

const PriorityContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
`;

type PriorityLevel = "low" | "medium" | "high";

const PriorityChip = styled.button<{
  $active: boolean;
  $level: PriorityLevel;
}>`
  flex: 1;
  padding: 8px 4px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-page);
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--color-bg-surface);
    border-color: var(--color-text-secondary);
  }

  ${(p) =>
    p.$active &&
    p.$level === "low" &&
    css`
      background-color: rgba(16, 185, 129, 0.1);
      border-color: #10b981;
      color: #10b981;
    `}

  ${(p) =>
    p.$active &&
    p.$level === "medium" &&
    css`
      background-color: rgba(59, 130, 246, 0.1);
      border-color: #3b82f6;
      color: #3b82f6;
    `}

  ${(p) =>
    p.$active &&
    p.$level === "high" &&
    css`
      background-color: rgba(239, 68, 68, 0.1);
      border-color: #ef4444;
      color: #ef4444;
    `}
`;

// --- Загальні стилі полів ---

const fieldStyles = css`
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-page);
  color: var(--color-text-main);
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  &::placeholder {
    color: var(--color-text-tertiary);
  }
  &:hover {
    border-color: var(--color-text-secondary);
  }
  &:focus {
    outline: none;
    border-color: var(--color-brand-600);
    background-color: var(--color-bg-surface);
  }
`;

const TextArea = styled.textarea`
  ${fieldStyles}
  height: 90px;
  padding: 0.8rem;
  resize: none;
`;

const Input = styled.input`
  ${fieldStyles}
  padding: 0.7rem 0.8rem;
`;

// --- Attachments Styles ---

const AttachmentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-brand-600);
  cursor: pointer;
  width: fit-content;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
  input {
    display: none;
  }
`;

const PreviewsRow = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
  }
`;

const ThumbnailWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  &:hover {
    background: var(--color-red-500);
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.2rem;
  background-color: var(--color-brand-600);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  &:hover {
    background-color: var(--color-brand-700);
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(1px);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    background-color: var(--color-text-tertiary);
  }
`;

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  text-align: center;
`;

const SuccessIconBox = styled.div`
  color: #10b981;
  font-size: 3.5rem;
  margin-bottom: 0.5rem;
  animation: ${popCheck} 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
`;

const SuccessTitle = styled.h4`
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
`;

const SuccessMessage = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0;
`;

// --- 3. КОМПОНЕНТ ---

interface Props {
  onClose: () => void;
  isCollapsed: boolean;
}

export default function FeedbackWidget({ onClose, isCollapsed }: Props) {
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("medium"); // Default priority
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => onClose(), 280);
  }, [isClosing, onClose]);

  const ref = useOutsideClick(handleClose);
  useEscapeKey(handleClose);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isClosing) {
        document.getElementById("feedback-message")?.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isClosing]);

  const processFiles = (newFiles: File[]) => {
    const validImages = newFiles.filter((file) =>
      file.type.startsWith("image/"),
    );

    if (validImages.length === 0) return;

    const availableSlots = 5 - images.length;
    if (availableSlots <= 0) {
      alert("Максимум 5 зображень");
      return;
    }

    const filesToAdd = validImages.slice(0, availableSlots);
    if (validImages.length > availableSlots) {
      alert(`Додано лише ${availableSlots} файл(ів). Максимум 5.`);
    }

    setImages((prev) => [...prev, ...filesToAdd]);
    const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (e.clipboardData.items) {
        const items = Array.from(e.clipboardData.items);
        const files: File[] = [];

        for (const item of items) {
          if (item.type.indexOf("image") !== -1) {
            const file = item.getAsFile();
            if (file) files.push(file);
          }
        }

        if (files.length > 0) {
          e.preventDefault();
          processFiles(files);
        }
      }
    },
    [images],
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const userName = localStorage.getItem("user_name") || "User";
      const formData = new FormData();
      formData.append("name", userName);
      formData.append("contact", contact);
      formData.append("message", message);
      // Додаємо пріоритет до форми
      formData.append("priority", priority);

      images.forEach((file) => {
        formData.append("images", file);
      });

      await sendFeedback(formData);

      setIsSent(true);
      setTimeout(() => handleClose(), 2500);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WidgetContainer
      ref={ref}
      $collapsed={isCollapsed}
      $isClosing={isClosing}
      $isDragging={isDragging}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onPaste={handlePaste}
    >
      {isDragging && !isSent && (
        <DragOverlay>
          <HiPhoto size={48} style={{ marginBottom: 10 }} />
          <span>Відпустіть файл, щоб додати</span>
        </DragOverlay>
      )}

      {!isSent && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 10,
          }}
        >
          <CloseButton onClick={handleClose}>
            <HiXMark size={20} />
          </CloseButton>
        </div>
      )}

      {isSent ? (
        <SuccessContainer>
          <SuccessIconBox>
            <HiCheckCircle />
          </SuccessIconBox>
          <SuccessTitle>Відправлено!</SuccessTitle>
          <SuccessMessage>Дякуємо за твій фідбек.</SuccessMessage>
        </SuccessContainer>
      ) : (
        <>
          <Header>
            <div>
              <h4>Фідбек / Баг</h4>
            </div>
          </Header>
          <SubText>
            Знайшов помилку чи маєш ідею? Напиши нам. <br />
            <span style={{ opacity: 0.7, fontSize: "0.75rem" }}>
              (Можна вставити Ctrl+V або перетягнути фото)
            </span>
          </SubText>

          <Form onSubmit={handleSubmit}>
            {/* Секція пріоритетів */}
            <PriorityContainer>
              <PriorityChip
                type="button"
                $level="low"
                $active={priority === "low"}
                onClick={() => setPriority("low")}
              >
                <HiLightBulb size={16} />
                Idea
              </PriorityChip>
              <PriorityChip
                type="button"
                $level="medium"
                $active={priority === "medium"}
                onClick={() => setPriority("medium")}
              >
                <HiInformationCircle size={16} />
                Normal
              </PriorityChip>
              <PriorityChip
                type="button"
                $level="high"
                $active={priority === "high"}
                onClick={() => setPriority("high")}
              >
                <HiExclamationTriangle size={16} />
                Critical
              </PriorityChip>
            </PriorityContainer>

            <TextArea
              id="feedback-message"
              placeholder="Опиши проблему або ідею..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <AttachmentsContainer>
              {previews.length > 0 && (
                <PreviewsRow>
                  {previews.map((src, idx) => (
                    <ThumbnailWrapper key={idx}>
                      <img src={src} alt={`preview-${idx}`} />
                      <RemoveImageButton
                        type="button"
                        onClick={() => removeImage(idx)}
                      >
                        <HiXMark size={12} />
                      </RemoveImageButton>
                    </ThumbnailWrapper>
                  ))}
                </PreviewsRow>
              )}

              {images.length < 5 && (
                <FileInputLabel>
                  <HiPhoto size={18} />
                  <span>
                    Додати скріншот{" "}
                    {images.length > 0 && `(${images.length}/5)`}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                </FileInputLabel>
              )}
            </AttachmentsContainer>

            <Input
              type="text"
              placeholder="Твій Telegram або Email (необов'язково)"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />

            <SubmitButton type="submit" disabled={isLoading || !message.trim()}>
              {isLoading ? (
                "Відправка..."
              ) : (
                <>
                  Відправити{" "}
                  <HiPaperAirplane
                    size={16}
                    style={{ transform: "rotate(90deg) translateX(-2px)" }}
                  />
                </>
              )}
            </SubmitButton>
          </Form>
        </>
      )}
    </WidgetContainer>
  );
}
