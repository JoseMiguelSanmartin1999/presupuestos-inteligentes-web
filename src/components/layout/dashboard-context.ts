import type { DashboardData } from "@/types/dashboard";

export interface DashboardContext {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refreshKey: number;
  refreshDashboard: () => void;
  openTransactionModal: () => void;
}