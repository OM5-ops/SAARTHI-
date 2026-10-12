import type { Tender } from "@/types";
import { apiRequest } from "./client";

export function listTenders(): Promise<Tender[]> {
  return apiRequest<Tender[]>("/api/tenders");
}

export function saveTender(tender: Tender): Promise<Tender> {
  return apiRequest<Tender>(`/api/tenders/${tender.id}`, {
    method: "PUT",
    body: tender,
  });
}

export function setTenderSaved(id: bigint, saved: boolean): Promise<Tender> {
  return apiRequest<Tender>(`/api/tenders/${id}/saved`, {
    method: "PATCH",
    body: { saved },
  });
}
