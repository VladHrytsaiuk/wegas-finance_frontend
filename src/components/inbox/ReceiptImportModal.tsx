import { useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import toast from "react-hot-toast";
import { BottomSheetPanel, DragHandle, Overlay, StyledModal } from "../ui/Modal";
import { useIsMobile } from "../../hooks/useIsMobile";
import { ingestReceiptUrlApi, ingestReceiptXmlApi } from "../../services/apiInbox";

const Content = styled.div`
  min-height: 264px;
  box-sizing: border-box;
  padding: 1.1rem;
  display: grid;
  grid-template-rows: auto auto auto minmax(48px, 1fr) auto;
  gap: 0.8rem;
`;
const Title = styled.h2`margin: 0; font-size: 1.1rem; color: var(--color-text-main);`;
const Text = styled.p`margin: 0; color: var(--color-text-secondary); font-size: 0.88rem; line-height: 1.4;`;
const Tabs = styled.div`display: flex; gap: 0.45rem;`;
const Tab = styled.button<{ $active: boolean }>`padding: 0.5rem 0.75rem; border-radius: 9px; border: 1px solid var(--color-border); background: ${({ $active }) => $active ? "var(--color-brand-50)" : "var(--color-bg-surface)"}; color: ${({ $active }) => $active ? "var(--color-brand-700)" : "var(--color-text-secondary)"}; font-weight: 700; cursor: pointer;`;
const Input = styled.input`width: 100%; box-sizing: border-box; padding: 0.7rem; border: 1px solid var(--color-border); border-radius: 10px; background: var(--color-bg-page); color: var(--color-text-main);`;
const Actions = styled.div`display: flex; justify-content: flex-end; gap: 0.55rem;`;
const Button = styled.button<{ $primary?: boolean }>`padding: 0.6rem 0.85rem; border-radius: 10px; border: 1px solid ${({ $primary }) => $primary ? "var(--color-brand-600)" : "var(--color-border)"}; background: ${({ $primary }) => $primary ? "var(--color-brand-600)" : "var(--color-bg-surface)"}; color: ${({ $primary }) => $primary ? "white" : "var(--color-text-main)"}; font-weight: 700; cursor: pointer;`;

export function ReceiptImportModal({ onClose }: { onClose: () => void }) {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"xml" | "url">("xml");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const mutation = useMutation({
    mutationFn: () => mode === "xml" ? ingestReceiptXmlApi(file!) : ingestReceiptUrlApi(url.trim()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["inbox"] }); queryClient.invalidateQueries({ queryKey: ["inbox", "pending-count"] }); toast.success("Чек додано до Inbox"); onClose(); },
    onError: () => toast.error("Не вдалося обробити чек"),
  });
  const canSubmit = mode === "xml" ? Boolean(file) : /^https?:\/\//.test(url.trim());
  const body = <Content><Title>Додати електронний чек</Title><Text>Додайте XML-файл або посилання на доступний чек. Він з'явиться у Inbox для перевірки.</Text><Tabs><Tab $active={mode === "xml"} onClick={() => setMode("xml")}>XML-файл</Tab><Tab $active={mode === "url"} onClick={() => setMode("url")}>Посилання</Tab></Tabs>{mode === "xml" ? <Input type="file" accept=".xml,text/xml,application/xml" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /> : <Input type="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />}<Actions><Button onClick={onClose}>Скасувати</Button><Button $primary disabled={!canSubmit || mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? "Обробка..." : "Додати"}</Button></Actions></Content>;
  return createPortal(<Overlay $isBottomSheet={isMobile} onClick={onClose}>{isMobile ? <BottomSheetPanel onClick={(e) => e.stopPropagation()}><DragHandle />{body}</BottomSheetPanel> : <StyledModal onClick={(e) => e.stopPropagation()} style={{ width: "min(28rem, calc(100vw - 2rem))" }}>{body}</StyledModal>}</Overlay>, document.body);
}
