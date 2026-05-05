import api from "./Axios"; // Твій налаштований axios instance

export interface ImportPreviewTransaction {
  date: number;
  amount: number;
  description: string;
  counterparty_name: string;
  type: "income" | "expense" | "transfer";
  predicted_category: string;
  is_duplicate: boolean;
  // 👇 ОБОВ'ЯЗКОВО ДОДАЙ ЦІ ДВА РЯДКИ
  is_potential_duplicate?: boolean;
  match_reason?: string;
  existing_transaction?: ExistingTransactionDB;
}
export interface ImportPreviewResponse {
  transactions: ImportPreviewTransaction[];
}

export interface ExistingTransactionDB {
  id: string;
  date: number;
  amount: number;
  note: string;
  category?: { name: string };
  counterparty?: { name: string };
  type: string;
}

export const uploadBankStatementApi = async (
  accountId: string,
  bankType: string,
  file: File,
) => {
  // ДЕБАГ: Перевір у консолі браузера, що це саме File і він має розмір
  console.log(
    "Uploading file:",
    file.name,
    "Size:",
    file.size,
    "Type:",
    file.type,
  );

  const formData = new FormData();
  formData.append("file", file);
  formData.append("account_id", accountId);
  formData.append("bank_type", bankType);

  const response = await api.post<ImportPreviewResponse>(
    "/import/upload",
    formData,
    {
      headers: {
        // Явно вказуємо undefined, щоб Axios сам згенерував multipart boundary
        "Content-Type": undefined,
      },
    },
  );
  return response.data;
};
