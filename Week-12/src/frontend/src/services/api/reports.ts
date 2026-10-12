import type {
  ActivityEntry,
  BuyerDelayReport,
  DashboardMetrics,
  MonthlyFinancial,
  WorkingCapitalEstimate,
} from "@/types";
import { apiRequest } from "./client";

export function getDashboardMetrics(): Promise<DashboardMetrics> {
  return apiRequest<DashboardMetrics>("/api/dashboard/metrics");
}

export function getMonthlyFinancials(): Promise<MonthlyFinancial[]> {
  return apiRequest<MonthlyFinancial[]>("/api/dashboard/monthly");
}

export function getBuyerDelayReport(): Promise<BuyerDelayReport[]> {
  return apiRequest<BuyerDelayReport[]>("/api/dashboard/buyer-delays");
}

export function listActivity(): Promise<ActivityEntry[]> {
  return apiRequest<ActivityEntry[]>("/api/activity");
}

export function getWorkingCapitalEstimate(
  enteredExpenses: bigint,
): Promise<WorkingCapitalEstimate> {
  return apiRequest<WorkingCapitalEstimate>(
    `/api/reports/working-capital?expenses=${enteredExpenses}`,
  );
}
