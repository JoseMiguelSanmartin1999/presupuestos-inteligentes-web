
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

export interface UpdateTransactionDto {
  amount?: number;
  type?: TransactionType;
  description?: string;
  date?: string;
  categoryId?: string | null;
}

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

export interface TransactionFilters {
  from?: string;
  to?: string;
  type?: TransactionType;
  categoryId?: string;
  page?: number;
  limit?: number;
}

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
