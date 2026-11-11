import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import styled from "styled-components";

import api from "../../../services/Axios";
import { Footnote } from "../../../mobile/ui/Field";
import { Section } from "../../../mobile/ui/Group";
import { PrimaryButton, Sheet } from "../../../mobile/ui/Sheet";
import { errorText } from "./family";

// Приєднатися до родини за 6-значним кодом від адміна.

const CodeInput = styled.input`
  width: 100%;
  padding: 16px 0;
  border: none;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
  outline: none;
  font: inherit;
  font-size: 34px;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-align: center;
  font-variant-numeric: tabular-nums;
  color: var(--m-label);
  box-sizing: border-box;

  &::placeholder {
    color: var(--m-label-3);
  }
`;

interface JoinSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinSheet({ open, onOpenChange }: JoinSheetProps) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");

  const join = useMutation({
    mutationFn: () => api.post("/families/join", { code }),
    onSuccess: () => {
      toast.success("Ви приєдналися до родини");
      // Дані користувача перейшли до нової родини — перечитуємо все.
      queryClient.invalidateQueries();
      setCode("");
      onOpenChange(false);
    },
    onError: (err) => toast.error(errorText(err, "Не вдалося приєднатися")),
  });

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Приєднатися до родини"
      footer={
        <PrimaryButton type="button" disabled={code.length !== 6 || join.isPending} onClick={() => join.mutate()}>
          Приєднатися
        </PrimaryButton>
      }
    >
      <Section>
        <CodeInput
          aria-label="Код запрошення"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />
        <Footnote>
          Введіть 6 цифр, які дав адмін родини. Ваші рахунки й операції перейдуть до тієї родини. Це можливо,
          лише поки ви єдиний учасник своєї родини.
        </Footnote>
      </Section>
    </Sheet>
  );
}
