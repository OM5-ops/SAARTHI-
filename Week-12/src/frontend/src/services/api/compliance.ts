import type { BuyerRisk, ChecklistItem, ComplianceSummary } from "@/types";
import { apiRequest } from "./client";

export function getComplianceSummary(): Promise<ComplianceSummary> {
  return apiRequest<ComplianceSummary>("/api/compliance/summary");
}

export function listChecklistItems(): Promise<ChecklistItem[]> {
  return apiRequest<ChecklistItem[]>("/api/compliance/checklist");
}

export function saveChecklistItems(
  items: ChecklistItem[],
): Promise<ChecklistItem[]> {
  return apiRequest<ChecklistItem[]>("/api/compliance/checklist", {
    method: "PUT",
    body: items,
  });
}

export function listBuyerRisks(): Promise<BuyerRisk[]> {
  return apiRequest<BuyerRisk[]>("/api/compliance/buyer-risks");
}
