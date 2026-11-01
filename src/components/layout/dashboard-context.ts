
import type { DashboardData } from "@/types/dashboard";

export interface DashboardContext {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refreshDashboard: () => void;
  openTransactionModal: () => void;
}
