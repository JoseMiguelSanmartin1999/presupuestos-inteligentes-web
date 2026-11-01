
import { apiRequest } from "@/services/api";

import type {
  Category,
  CreateCategoryDto,
  CreateTransactionDto,
  UpdateTransactionDto,
  ApiTransaction,
  TransactionFilters,
  PaginatedTransactionsResponse,
  DeleteTransactionResponse,
} from "../types/transaction.types";

// Compatibilidad con componentes que importan
// los tipos directamente desde el servicio.
export type {
  TransactionType,
  Category,
  CreateCategoryDto,
  CreateTransactionDto,
  UpdateTransactionDto,
  ApiTransaction,
  TransactionFilters,
  TransactionPagination,
  PaginatedTransactionsResponse,
  DeleteTransactionResponse,
} from "../types/transaction.types";

/**
 * Obtener categorías disponibles.
 */
export async function getCategories(): Promise<Category[]> {
  const response = await apiRequest<Category[]>("/categories");

  if (!Array.isArray(response)) {
    throw new Error(
      "La API devolvió un formato de categorías inesperado.",
    );
  }

  return response;
}

/**
 * Crear una categoría.
 */
export async function createCategory(
  category: CreateCategoryDto,
): Promise<Category> {
  return apiRequest<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(category),
  });
}

/**
 * Crear una transacción.
 */
export async function createTransaction(
  transaction: CreateTransactionDto,
): Promise<ApiTransaction> {
  return apiRequest<ApiTransaction>("/transactions", {
    method: "POST",
    body: JSON.stringify(transaction),
  });
}

/**
 * Obtener transacciones con filtros y paginación.
 */
export async function getTransactions(
  filters: TransactionFilters = {},
): Promise<PaginatedTransactionsResponse> {
  const params = new URLSearchParams();

  if (filters.from) {
    params.set("from", filters.from);
  }

  if (filters.to) {
    params.set("to", filters.to);
  }

  if (filters.type) {
    params.set("type", filters.type);
  }

  if (filters.categoryId) {
    params.set("categoryId", filters.categoryId);
  }

  if (filters.page !== undefined) {
    params.set("page", String(filters.page));
  }

  if (filters.limit !== undefined) {
    params.set("limit", String(filters.limit));
  }

  const query = params.toString();

  const path = query
    ? `/transactions?${query}`
    : "/transactions";

  const response =
    await apiRequest<PaginatedTransactionsResponse>(path);

  if (
    !response ||
    !Array.isArray(response.data) ||
    !response.pagination
  ) {
    throw new Error(
      "La API devolvió un formato de transacciones inesperado.",
    );
  }

  return response;
}

/**
 * Actualizar una transacción.
 */
export async function updateTransaction(
  id: string,
  changes: UpdateTransactionDto,
): Promise<ApiTransaction> {
  if (!id.trim()) {
    throw new Error(
      "El ID de la transacción es obligatorio.",
    );
  }

  return apiRequest<ApiTransaction>(
    `/transactions/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(changes),
    },
  );
}

/**
 * Eliminar una transacción.
 */
export async function deleteTransaction(
  id: string,
): Promise<DeleteTransactionResponse> {
  if (!id.trim()) {
    throw new Error(
      "El ID de la transacción es obligatorio.",
    );
  }

  return apiRequest<DeleteTransactionResponse>(
    `/transactions/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}
