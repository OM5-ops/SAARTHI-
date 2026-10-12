import { Disclaimer } from "@/components/Disclaimer";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateOrder,
  useDeleteOrder,
  useOrders,
  useSetOrderStatus,
} from "@/hooks/useQueries";
import { ORDER_STATUS_META, OrderStatus } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { Link } from "@tanstack/react-router";
import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.placed,
  OrderStatus.dispatched,
  OrderStatus.delivered,
  OrderStatus.accepted,
  OrderStatus.disputed,
];

interface OrderFormState {
  orderNumber: string;
  buyer: string;
  description: string;
  value: string;
  quantity: string;
  unit: string;
  orderDate: string;
  deliveryDeadline: string;
  status: OrderStatus;
}

function emptyForm(): OrderFormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    orderNumber: "",
    buyer: "",
    description: "",
    value: "",
    quantity: "",
    unit: "",
    orderDate: today,
    deliveryDeadline: today,
    status: OrderStatus.placed,
  };
}

export function OrdersPage() {
  const { data, isLoading, isError, refetch } = useOrders();
  const createOrder = useCreateOrder();
  const setStatus = useSetOrderStatus();
  const deleteOrder = useDeleteOrder();

  const [query, setQuery] = useState("");
  const [status, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<OrderFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    id: bigint;
    status: OrderStatus;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: bigint;
    orderNumber: string;
  } | null>(null);

  const orders = data ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (status !== "all" && order.status !== status) return false;
      if (!q) return true;
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        order.buyer.toLowerCase().includes(q) ||
        order.description.toLowerCase().includes(q)
      );
    });
  }, [orders, query, status]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(form.value);
    const quantity = Number(form.quantity);
    if (
      !form.orderNumber.trim() ||
      !form.buyer.trim() ||
      !form.description.trim() ||
      !Number.isFinite(value) ||
      value <= 0 ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !form.unit.trim()
    ) {
      setFormError(
        "Enter an order number, buyer, description, a positive value and quantity, and a unit.",
      );
      return;
    }
    setFormError(null);
    createOrder.mutate(
      {
        orderNumber: form.orderNumber.trim(),
        buyer: form.buyer.trim(),
        description: form.description.trim(),
        value: BigInt(Math.round(value)),
        quantity: BigInt(Math.round(quantity)),
        unit: form.unit.trim(),
        orderDate: form.orderDate,
        deliveryDeadline: form.deliveryDeadline,
        status: form.status,
      },
      {
        onSuccess: () => {
          toast.success("Purchase order created", {
            description: form.orderNumber.trim(),
          });
          setFormOpen(false);
          setForm(emptyForm());
        },
        onError: () => {
          toast.error("Could not create purchase order", {
            description: "The request failed. Please try again.",
          });
        },
      },
    );
  }

  function handleStatusConfirm() {
    if (!statusTarget) return;
    setStatus.mutate(statusTarget, {
      onSuccess: () => {
        toast.success("Order status updated", {
          description: ORDER_STATUS_META[statusTarget.status].label,
        });
        setStatusTarget(null);
      },
      onError: () => {
        toast.error("Could not update order status", {
          description: "The request failed. Please try again.",
        });
      },
    });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteOrder.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Purchase order deleted", {
          description: deleteTarget.orderNumber,
        });
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error("Could not delete purchase order", {
          description: "The request failed. Please try again.",
        });
      },
    });
  }

  return (
    <div data-ocid="orders.page" className="space-y-6">
      <PageHeader
        eyebrow="Fulfilment"
        title="Purchase Orders"
        description="Manage purchase orders, dispatch, delivery and buyer acceptance in one ledger."
        actions={
          <Button
            type="button"
            data-ocid="orders.add_button"
            onClick={() => {
              setForm(emptyForm());
              setFormError(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add Order
          </Button>
        }
      />

      <Disclaimer />

      <Card className="shadow-subtle">
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by order number, buyer or description"
                aria-label="Search orders"
                data-ocid="orders.search_input"
                className="pl-9"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatusFilter(value as OrderStatus | "all")
              }
            >
              <SelectTrigger
                className="w-full sm:w-52"
                aria-label="Filter by status"
                data-ocid="orders.status.select"
              >
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {ORDER_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {ORDER_STATUS_META[value].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <LoadingState rows={6} label="Loading orders" />
          ) : isError ? (
            <ErrorState
              description="We could not load your purchase orders. Check your connection and try again."
              onRetry={() => void refetch()}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No purchase orders found"
              description="No orders match your current filters. Clear the search to see the full ledger."
              icon={Package}
              action={
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="orders.clear_filters_button"
                  onClick={() => {
                    setQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table data-ocid="orders.table">
                <TableHeader className="sticky top-0 bg-muted/60">
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Delivery Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((order, index) => {
                    const meta = ORDER_STATUS_META[order.status];
                    return (
                      <TableRow
                        key={order.id.toString()}
                        data-ocid={`orders.row.${index + 1}`}
                      >
                        <TableCell>
                          <Link
                            to="/orders/$orderId"
                            params={{ orderId: order.id.toString() }}
                            data-ocid={`orders.link.${index + 1}`}
                            className="font-medium text-foreground hover:text-primary hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                          <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">
                            {order.description}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-[12rem] truncate">
                          {order.buyer}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatCurrency(order.value)}
                        </TableCell>
                        <TableCell>
                          {formatDate(order.deliveryDeadline)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge label={meta.label} tone={meta.tone} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Update status for ${order.orderNumber}`}
                              data-ocid={`orders.edit_button.${index + 1}`}
                              onClick={() =>
                                setStatusTarget({
                                  id: order.id,
                                  status: order.status,
                                })
                              }
                            >
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Delete ${order.orderNumber}`}
                              data-ocid={`orders.delete_button.${index + 1}`}
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                setDeleteTarget({
                                  id: order.id,
                                  orderNumber: order.orderNumber,
                                })
                              }
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          data-ocid="orders.form_dialog"
          className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle>Add purchase order</DialogTitle>
            <DialogDescription>
              Record a new purchase order in your ledger.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="order-number">Order number</Label>
                <Input
                  id="order-number"
                  value={form.orderNumber}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      orderNumber: event.target.value,
                    }))
                  }
                  placeholder="PO/BHEL/2026/0731"
                  data-ocid="orders.form.order_number_input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-buyer">Buyer</Label>
                <Input
                  id="order-buyer"
                  value={form.buyer}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, buyer: event.target.value }))
                  }
                  placeholder="Bharat Heavy Electricals Ltd"
                  data-ocid="orders.form.buyer_input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-description">Description</Label>
              <Textarea
                id="order-description"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Supply of 40 LT distribution panels"
                data-ocid="orders.form.description_input"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="order-value">Value (₹)</Label>
                <Input
                  id="order-value"
                  type="number"
                  min="1"
                  value={form.value}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, value: event.target.value }))
                  }
                  placeholder="1250000"
                  data-ocid="orders.form.value_input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-quantity">Quantity</Label>
                <Input
                  id="order-quantity"
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      quantity: event.target.value,
                    }))
                  }
                  placeholder="40"
                  data-ocid="orders.form.quantity_input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-unit">Unit</Label>
                <Input
                  id="order-unit"
                  value={form.unit}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, unit: event.target.value }))
                  }
                  placeholder="panels"
                  data-ocid="orders.form.unit_input"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="order-date">Order date</Label>
                <Input
                  id="order-date"
                  type="date"
                  value={form.orderDate}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      orderDate: event.target.value,
                    }))
                  }
                  data-ocid="orders.form.order_date_input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-deadline">Delivery deadline</Label>
                <Input
                  id="order-deadline"
                  type="date"
                  value={form.deliveryDeadline}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      deliveryDeadline: event.target.value,
                    }))
                  }
                  data-ocid="orders.form.deadline_input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      status: value as OrderStatus,
                    }))
                  }
                >
                  <SelectTrigger
                    id="order-status"
                    className="w-full"
                    aria-label="Order status"
                    data-ocid="orders.form.status_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {ORDER_STATUS_META[value].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formError ? (
              <p
                data-ocid="orders.form.error_state"
                role="alert"
                className="text-sm text-destructive"
              >
                {formError}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="orders.form.cancel_button"
                onClick={() => setFormOpen(false)}
                disabled={createOrder.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="orders.form.submit_button"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? "Creating…" : "Create order"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={statusTarget !== null}
        onOpenChange={(open) => {
          if (!open) setStatusTarget(null);
        }}
      >
        <DialogContent data-ocid="orders.status_dialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update order status</DialogTitle>
            <DialogDescription>
              Choose the new fulfilment stage for this order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="status-update">Status</Label>
            <Select
              value={statusTarget?.status ?? OrderStatus.placed}
              onValueChange={(value) =>
                setStatusTarget((prev) =>
                  prev ? { ...prev, status: value as OrderStatus } : prev,
                )
              }
            >
              <SelectTrigger
                id="status-update"
                className="w-full"
                aria-label="New order status"
                data-ocid="orders.status_dialog.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {ORDER_STATUS_META[value].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="orders.status_dialog.cancel_button"
              onClick={() => setStatusTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="orders.status_dialog.confirm_button"
              onClick={handleStatusConfirm}
              disabled={setStatus.isPending}
            >
              {setStatus.isPending ? "Saving…" : "Save status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent data-ocid="orders.delete_dialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete purchase order</DialogTitle>
            <DialogDescription>
              This permanently removes{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.orderNumber}
              </span>{" "}
              from your ledger. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="orders.delete_dialog.cancel_button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteOrder.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              data-ocid="orders.delete_dialog.confirm_button"
              onClick={handleDeleteConfirm}
              disabled={deleteOrder.isPending}
            >
              {deleteOrder.isPending ? "Deleting…" : "Delete order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
