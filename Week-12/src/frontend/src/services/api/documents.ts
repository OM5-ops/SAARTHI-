import type { Document, DocumentInput } from "@/types";
import { apiRequest } from "./client";

export function listDocuments(): Promise<Document[]> {
  return apiRequest<Document[]>("/api/documents");
}

export function createDocument(input: DocumentInput): Promise<Document> {
  return apiRequest<Document>("/api/documents", {
    method: "POST",
    body: input,
  });
}

export function deleteDocument(id: bigint): Promise<void> {
  return apiRequest<void>(`/api/documents/${id}`, { method: "DELETE" });
}
