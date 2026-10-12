import type { Invoice, InvoiceInput, Payment, PaymentInput } from "@/types";
import { apiRequest } from "./client";

export function listInvoices(): Promise<Invoice[]> {
  return apiRequest<Invoice[]>("/api/invoices");
}

export function getInvoice(id: bigint): Promise<Invoice | null> {
  return apiRequest<Invoice | null>(`/api/invoices/${id}`);
}

export function createInvoice(input: InvoiceInput): Promise<Invoice> {
  return apiRequest<Invoice>("/api/invoices", { method: "POST", body: input });
}

export function updateInvoice(
  id: bigint,
  input: InvoiceInput,
): Promise<Invoice> {
  return apiRequest<Invoice>(`/api/invoices/${id}`, {
    method: "PUT",
    body: input,
  });
}

export function deleteInvoice(id: bigint): Promise<void> {
  return apiRequest<void>(`/api/invoices/${id}`, { method: "DELETE" });
}

export function listPayments(invoiceId: bigint): Promise<Payment[]> {
  return apiRequest<Payment[]>(`/api/invoices/${invoiceId}/payments`);
}

export function recordPayment(input: PaymentInput): Promise<Payment> {
  return apiRequest<Payment>("/api/payments", { method: "POST", body: input });
}
