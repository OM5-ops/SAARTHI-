import type { OrderInput, OrderStatus, PurchaseOrder } from "@/types";
import { apiRequest } from "./client";

export function listOrders(): Promise<PurchaseOrder[]> {
  return apiRequest<PurchaseOrder[]>("/api/orders");
}

export function createOrder(input: OrderInput): Promise<PurchaseOrder> {
  return apiRequest<PurchaseOrder>("/api/orders", {
    method: "POST",
    body: input,
  });
}

export function updateOrder(
  id: bigint,
  input: OrderInput,
): Promise<PurchaseOrder> {
  return apiRequest<PurchaseOrder>(`/api/orders/${id}`, {
    method: "PUT",
    body: input,
  });
}

export function setOrderStatus(
  id: bigint,
  status: OrderStatus,
): Promise<PurchaseOrder> {
  return apiRequest<PurchaseOrder>(`/api/orders/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function deleteOrder(id: bigint): Promise<void> {
  return apiRequest<void>(`/api/orders/${id}`, { method: "DELETE" });
}
