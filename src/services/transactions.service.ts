
import { apiRequest } from "@/services/api";

export type TransactionType = "INCOME" | "EXPENSE";

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  createdAt?: string;
  userId?: string;
}

export interface CreateCategoryDto {
  name: string;
  type: TransactionType;
  color: string;
}

export interface CreateTransactionDto {
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  categoryId: string;
}

/** Campos que se pueden modificar individualmente mediante PATCH. */
export interface UpdateTransactionDto {
  amount?: number;
  type?: TransactionType;
  description?: string;
  date?: string;
  categoryId?: string | null;
}

/** Transacción tal como la devuelve la API. */
export interface ApiTransaction {
  id: string;
  amount: string | number;
  type: TransactionType;
  description: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  categoryId: string | null;
  category?: Category | null;
}

/** Filtros admitidos por GET /transactions. */
export interface TransactionFilters {
  from?: string;
  to?: string;
  type?: TransactionType;
  categoryId?: string;
  page?: number;
  limit?: number;
}

/** Metadatos de paginación de la API. */
export interface TransactionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedTransactionsResponse {
  data: ApiTransaction[];
  pagination: TransactionPagination;
}

export interface DeleteTransactionResponse {
  message: string;
}

export async function getCategories(): Promise<Category[]> {
  const response = await apiRequest<Category[]>("/categories");

  if (!Array.isArray(response)) {
    throw new Error(
      "La API devolvió un formato de categorías inesperado.",
    );
  }

  return response;
}

export async function createCategory(
  category: CreateCategoryDto,
): Promise<Category> {
  return apiRequest<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(category),
  });
}

/** Crear una transacción. */
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
 * Los parámetros vacíos se omiten de la URL.
 */
export async function getTransactions(
  filters: TransactionFilters = {},
): Promise<PaginatedTransactionsResponse> {
  const params = new URLSearchParams();

  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.type) params.set("type", filters.type);
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

/** Actualizar únicamente los campos enviados. */
export async function updateTransaction(
  id: string,
  changes: UpdateTransactionDto,
): Promise<ApiTransaction> {
  if (!id.trim()) {
    throw new Error("El ID de la transacción es obligatorio.");
  }

  return apiRequest<ApiTransaction>(
    `/transactions/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(changes),
    },
  );
}

/** Eliminar una transacción por su ID. */
export async function deleteTransaction(
  id: string,
): Promise<DeleteTransactionResponse> {
  if (!id.trim()) {
    throw new Error("El ID de la transacción es obligatorio.");
  }

  return apiRequest<DeleteTransactionResponse>(
    `/transactions/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}
