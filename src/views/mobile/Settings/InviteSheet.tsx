import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { HiOutlineClock } from "react-icons/hi2";
import styled from "styled-components";

import api from "../../../services/Axios";
import { Footnote } from "../../../mobile/ui/Field";
import { Segmented } from "../../../mobile/ui/Segmented";
import { PrimaryButton, Sheet } from "../../../mobile/ui/Sheet";
import { Section } from "../../../mobile/ui/Group";
import { ROLES, errorText } from "./family";

// Запросити за кодом: роль → 6 цифр на 2 хвилини. Закривається, коли хтось приєднався.

const TTL = 120;

const Code = styled.button<{ $dead: boolean }>`
  display: block;
  width: 100%;
  padding: 20px 0 8px;
  border: none;
  background: none;
  font: inherit;
  font-size: 44px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-align: center;
  font-variant-numeric: tabular-nums;
  color: var(--m-label);
  opacity: ${(p) => (p.$dead ? 0.35 : 1)};
  text-decoration: ${(p) => (p.$dead ? "line-through" : "none")};
  cursor: pointer;
`;

const Timer = styled.p<{ $urgent: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  color: ${(p) => (p.$urgent ? "#ff3b30" : "var(--m-label-2)")};
`;

const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

interface InviteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyId?: string;
}

export function InviteSheet({ open, onOpenChange, familyId }: InviteSheetProps) {
  const [role, setRole] = useState("member");
  const [code, setCode] = useState<string | null>(null);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (left <= 0) return;
    const timer = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [left]);

  const generate = useMutation({
    mutationFn: async () => (await api.post<{ code: string }>(`/families/${familyId}/generate-code`, { role_id: role })).data.code,
    onSuccess: (value) => {
      setCode(value);
      setLeft(TTL);
    },
    onError: (err) => toast.error(errorText(err, "Не вдалося створити код")),
  });

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Код скопійовано");
    } catch {
      /* буфер недоступний — код видно на екрані */
    }
  };

  const expired = !!code && left <= 0;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Запросити за кодом"
      footer={
        <PrimaryButton type="button" disabled={generate.isPending || (!!code && left > 0) || !familyId} onClick={() => generate.mutate()}>
          {code ? "Згенерувати новий" : "Згенерувати код"}
        </PrimaryButton>
      }
    >
      {!code ? (
        <Section caption="Роль нового учасника">
          <Segmented
            label="Роль нового учасника"
            options={ROLES.map((r) => ({ value: r.id, label: r.label }))}
            value={role}
            onChange={setRole}
          />
          <Footnote>{ROLES.find((r) => r.id === role)?.desc} Код дійсний 2 хвилини.</Footnote>
        </Section>
      ) : (
        <Section>
          <Code type="button" $dead={expired} aria-label="Код запрошення" onClick={copy}>
            {code}
          </Code>
          <Timer $urgent={left > 0 && left < 30}>
            <HiOutlineClock size={18} aria-hidden="true" />
            {expired ? "Час вийшов" : clock(left)}
          </Timer>
          <Footnote style={{ textAlign: "center" }}>
            Торкніться коду, щоб скопіювати. Людина вводить його в «Приєднатися до родини».
          </Footnote>
        </Section>
      )}
    </Sheet>
  );
}
