import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import styled from "styled-components";

import { updateMobileAccountsOrderApi, type Account } from "../../../services/apiAccounts";
import { AccountTile } from "../../../mobile/accountTile";
import { Group } from "../../../mobile/ui/Group";
import { Sheet, SheetTextButton } from "../../../mobile/ui/Sheet";

// Свій порядок рахунків: стрілки вгору/вниз, «Готово» зберігає (як було в старому «Порядку»).

const Line = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  padding: 6px 8px 6px 16px;

  & + &::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    left: 64px;
    height: 0.5px;
    background: var(--m-separator);
  }
`;

const Name = styled.span`
  flex: 1;
  min-width: 0;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Arrow = styled.button`
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: var(--m-accent);
  cursor: pointer;

  &:disabled {
    color: var(--m-label-3);
    cursor: default;
  }
`;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
}

export function AccountsOrderSheet({ open, onOpenChange, accounts }: Props) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(accounts);

  const save = useMutation({
    mutationFn: updateMobileAccountsOrderApi,
    onSuccess: (_, ids) => {
      queryClient.setQueryData(["me"], (current: { mobile_accounts_order?: string } | undefined) =>
        current ? { ...current, mobile_accounts_order: JSON.stringify(ids) } : current,
      );
      toast.success("Порядок рахунків збережено");
      onOpenChange(false);
    },
    onError: () => toast.error("Не вдалося зберегти порядок рахунків"),
  });

  const move = (index: number, delta: number) => {
    const next = [...draft];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setDraft(next);
  };
  const dirty = draft.some((a, i) => a.id !== accounts[i]?.id);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Порядок рахунків"
      trailing={
        <SheetTextButton type="button" $bold disabled={!dirty || save.isPending} onClick={() => save.mutate(draft.map((a) => a.id))}>
          Готово
        </SheetTextButton>
      }
    >
      <Group>
        {draft.map((account, index) => (
          <Line key={account.id}>
            <AccountTile account={account} size={32} />
            <Name>{account.name}</Name>
            <Arrow type="button" aria-label={`Вище: ${account.name}`} disabled={index === 0} onClick={() => move(index, -1)}>
              <HiChevronUp size={22} />
            </Arrow>
            <Arrow type="button" aria-label={`Нижче: ${account.name}`} disabled={index === draft.length - 1} onClick={() => move(index, 1)}>
              <HiChevronDown size={22} />
            </Arrow>
          </Line>
        ))}
      </Group>
    </Sheet>
  );
}
