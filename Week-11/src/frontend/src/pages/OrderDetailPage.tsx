import { Disclaimer } from "@/components/Disclaimer";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOrder } from "@/hooks/useQueries";
import { ORDER_STATUS_META } from "@/types";
import { formatCurrency, formatDateLong } from "@/utils/format";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  IndianRupee,
  Package,
} from "lucide-react";

export function OrderDetailPage() {
  const { orderId } = useParams({ from: "/orders/$orderId" });
  const id = orderId ? BigInt(orderId) : null;
  const { data, isLoading, isError, refetch } = useOrder(id);

  if (isLoading) {
    return (
      <div data-ocid="order_detail.page" className="space-y-6">
        <LoadingState rows={6} label="Loading order details" />
      </div>
    );
  }

  if (isError) {
    return (
      <div data-ocid="order_detail.page" className="space-y-6">
        <ErrorState
          description="We could not load this purchase order. The request failed."
          onRetry={() => void refetch()}
        />
        <Button type="button" variant="outline" asChild>
          <Link to="/orders" data-ocid="order_detail.back_link">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Orders
          </Link>
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div data-ocid="order_detail.page" className="space-y-6">
        <EmptyState
          title="Purchase order not found"
          description="This order is no longer available in the ledger."
          icon={Package}
          action={
            <Button type="button" variant="outline" asChild>
              <Link to="/orders" data-ocid="order_detail.back_link">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back to Orders
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const order = data;
  const meta = ORDER_STATUS_META[order.status];

  return (
    <div data-ocid="order_detail.page" className="space-y-6">
      <Button type="button" variant="outline" size="sm" asChild>
        <Link to="/orders" data-ocid="order_detail.back_link">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Orders
        </Link>
      </Button>

      <Disclaimer />

      <Card className="shadow-subtle">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={meta.label} tone={meta.tone} />
          </div>
          <CardTitle className="mt-2 font-display text-2xl">
            {order.orderNumber}
          </CardTitle>
          <CardDescription>{order.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Building2 className="size-3.5" aria-hidden="true" />
                Buyer
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {order.buyer}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <IndianRupee className="size-3.5" aria-hidden="true" />
                Order Value
              </dt>
              <dd className="font-mono text-sm font-medium text-foreground">
                {formatCurrency(order.value)}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Package className="size-3.5" aria-hidden="true" />
                Quantity
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {order.quantity.toString()} {order.unit}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <CalendarClock className="size-3.5" aria-hidden="true" />
                Delivery Deadline
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {formatDateLong(order.deliveryDeadline)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="text-lg">Fulfilment Timeline</CardTitle>
          <CardDescription>
            Order placed {formatDateLong(order.orderDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {[
              { label: "Placed", date: order.orderDate },
              { label: "Dispatched", date: order.dispatchedDate },
              { label: "Delivered", date: order.deliveredDate },
              { label: "Accepted", date: order.acceptedDate },
            ].map((step, index) => {
              const done = Boolean(step.date);
              return (
                <li
                  key={step.label}
                  data-ocid={`order_detail.stage.${index + 1}`}
                  className="flex items-center gap-3"
                >
                  <span
                    className={
                      done
                        ? "flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                        : "flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground"
                    }
                  >
                    {index + 1}
                  </span>
                  <span
                    className={
                      done
                        ? "text-sm font-medium text-foreground"
                        : "text-sm text-muted-foreground"
                    }
                  >
                    {step.label}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {step.date ? formatDateLong(step.date) : "Pending"}
                  </span>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
