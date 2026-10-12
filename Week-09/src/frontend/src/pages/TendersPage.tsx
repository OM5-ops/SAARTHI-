import type { Tender, TenderStatus } from "@/backend";
import { Disclaimer } from "@/components/Disclaimer";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { StatusBadge, TenderStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useSetTenderSaved, useTenders } from "@/hooks/useTenders";
import { cn } from "@/lib/utils";
import { daysUntil, formatCurrencyCompact, formatDate } from "@/utils/format";
import { Link, getRouteApi } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Bookmark,
  BookmarkCheck,
  FileText,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type SortField = "submissionDeadline" | "estimatedValue" | "title";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 8;

const tendersRouteApi = getRouteApi("/tenders");

function deadlineTone(tender: Tender): {
  label: string;
  tone: "destructive" | "warning" | "info" | "neutral";
} {
  const days = daysUntil(tender.submissionDeadline);
  if (tender.status === "awarded") return { label: "Awarded", tone: "neutral" };
  if (tender.status === "closed") return { label: "Closed", tone: "neutral" };
  if (days === null) return { label: "No deadline", tone: "neutral" };
  if (days < 0)
    return { label: `${Math.abs(days)}d overdue`, tone: "destructive" };
  if (days <= 7) return { label: `${days}d left`, tone: "warning" };
  return { label: `${days}d left`, tone: "info" };
}

export function TendersPage() {
  const { data, isLoading, isError, refetch } = useTenders();
  const setSaved = useSetTenderSaved();
  const { q: searchParam } = tendersRouteApi.useSearch();

  const [query, setQuery] = useState(searchParam ?? "");
  const [status, setStatus] = useState<TenderStatus | "all">("all");
  const [msmeOnly, setMsmeOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>("submissionDeadline");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (searchParam !== undefined) {
      setQuery(searchParam);
      setPage(1);
    }
  }, [searchParam]);

  const tenders = data ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = tenders.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (msmeOnly && !t.msmeEligible) return false;
      if (savedOnly && !t.saved) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.buyer.toLowerCase().includes(q) ||
        t.referenceNumber.toLowerCase().includes(q)
      );
    });
    rows.sort((a, b) => {
      let cmp = 0;
      if (sortField === "title") cmp = a.title.localeCompare(b.title);
      else if (sortField === "estimatedValue")
        cmp = Number(a.estimatedValue - b.estimatedValue);
      else cmp = a.submissionDeadline.localeCompare(b.submissionDeadline);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [tenders, query, status, msmeOnly, savedOnly, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const savedCount = tenders.filter((t) => t.saved).length;
  const msmeCount = tenders.filter((t) => t.msmeEligible).length;

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleToggleSaved(tender: Tender) {
    const next = !tender.saved;
    setSaved.mutate(
      { id: tender.id, saved: next },
      {
        onSuccess: () => {
          toast.success(next ? "Tender saved" : "Tender removed from saved", {
            description: tender.title,
          });
        },
        onError: () => {
          toast.error("Could not update saved tender", {
            description: "The request failed. Please try again.",
          });
        },
      },
    );
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field)
      return <ArrowUpDown className="size-3.5 opacity-50" aria-hidden="true" />;
    return sortDir === "asc" ? (
      <ArrowUp className="size-3.5" aria-hidden="true" />
    ) : (
      <ArrowDown className="size-3.5" aria-hidden="true" />
    );
  }

  return (
    <div data-ocid="tenders.page" className="space-y-6">
      <PageHeader
        eyebrow="Procurement"
        title="Tenders & Procurement"
        description="Track government and PSU tenders relevant to your MSME, monitor submission deadlines, and manage your application pipeline."
        actions={
          <Button
            type="button"
            data-ocid="tenders.primary_button"
            onClick={() =>
              toast.info("Add Tender", {
                description:
                  "Tender creation is available in the full procurement module.",
              })
            }
          >
            <FileText className="size-4" aria-hidden="true" />
            Add Tender
          </Button>
        }
      />

      <Disclaimer />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-subtle">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tenders</p>
              <p className="font-display text-2xl font-bold">
                {tenders.length}
              </p>
            </div>
            <FileText className="size-8 text-primary/70" aria-hidden="true" />
          </CardContent>
        </Card>
        <Card className="shadow-subtle">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">MSME Eligible</p>
              <p className="font-display text-2xl font-bold">{msmeCount}</p>
            </div>
            <StatusBadge label="MSME" tone="success" />
          </CardContent>
        </Card>
        <Card className="shadow-subtle">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Saved</p>
              <p className="font-display text-2xl font-bold">{savedCount}</p>
            </div>
            <BookmarkCheck className="size-8 text-accent" aria-hidden="true" />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-subtle">
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by title, buyer, or reference number"
                aria-label="Search tenders"
                data-ocid="tenders.search_input"
                className="pl-9"
              />
            </div>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as TenderStatus | "all");
                setPage(1);
              }}
            >
              <SelectTrigger
                className="w-full lg:w-48"
                aria-label="Filter by status"
                data-ocid="tenders.status.select"
              >
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closingSoon">Closing Soon</SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={msmeOnly ? "default" : "outline"}
                data-ocid="tenders.msme.toggle"
                aria-pressed={msmeOnly}
                onClick={() => {
                  setMsmeOnly((v) => !v);
                  setPage(1);
                }}
              >
                MSME Eligible
              </Button>
              <Button
                type="button"
                variant={savedOnly ? "default" : "outline"}
                data-ocid="tenders.saved.toggle"
                aria-pressed={savedOnly}
                onClick={() => {
                  setSavedOnly((v) => !v);
                  setPage(1);
                }}
              >
                Saved Only
              </Button>
            </div>
          </div>

          {isLoading ? (
            <LoadingState rows={6} label="Loading tenders" />
          ) : isError ? (
            <ErrorState
              description="We could not load the tender list. Check your connection and try again."
              onRetry={() => void refetch()}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No tenders match your filters"
              description="Try clearing the search or filters to see all available sample tenders."
              action={
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="tenders.clear_filters_button"
                  onClick={() => {
                    setQuery("");
                    setStatus("all");
                    setMsmeOnly(false);
                    setSavedOnly(false);
                    setPage(1);
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table data-ocid="tenders.table">
                  <TableHeader className="sticky top-0 bg-muted/60">
                    <TableRow>
                      <TableHead>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 font-medium"
                          onClick={() => toggleSort("title")}
                        >
                          Tender <SortIcon field="title" />
                        </button>
                      </TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 font-medium"
                          onClick={() => toggleSort("estimatedValue")}
                        >
                          Est. Value <SortIcon field="estimatedValue" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 font-medium"
                          onClick={() => toggleSort("submissionDeadline")}
                        >
                          Deadline <SortIcon field="submissionDeadline" />
                        </button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.map((tender, index) => {
                      const tone = deadlineTone(tender);
                      return (
                        <TableRow
                          key={tender.id.toString()}
                          data-ocid={`tenders.row.${index + 1}`}
                        >
                          <TableCell className="max-w-xs whitespace-normal">
                            <Link
                              to="/tenders/$tenderId"
                              params={{ tenderId: tender.id.toString() }}
                              data-ocid={`tenders.link.${index + 1}`}
                              className="font-medium text-foreground hover:text-primary hover:underline"
                            >
                              {tender.title}
                            </Link>
                            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                              {tender.referenceNumber}
                            </p>
                          </TableCell>
                          <TableCell className="max-w-[12rem] truncate">
                            {tender.buyer}
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {formatCurrencyCompact(tender.estimatedValue)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm">
                                {formatDate(tender.submissionDeadline)}
                              </span>
                              <StatusBadge
                                label={tone.label}
                                tone={tone.tone}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-start gap-1">
                              <TenderStatusBadge status={tender.status} />
                              {tender.msmeEligible ? (
                                <StatusBadge label="MSME" tone="success" />
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={
                                tender.saved
                                  ? `Remove ${tender.title} from saved`
                                  : `Save ${tender.title}`
                              }
                              data-ocid={`tenders.save_button.${index + 1}`}
                              disabled={setSaved.isPending}
                              onClick={() => handleToggleSaved(tender)}
                            >
                              {tender.saved ? (
                                <BookmarkCheck
                                  className="size-4 text-accent"
                                  aria-hidden="true"
                                />
                              ) : (
                                <Bookmark
                                  className="size-4"
                                  aria-hidden="true"
                                />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, filtered.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {filtered.length}
                  </span>{" "}
                  tenders
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-ocid="tenders.pagination_prev"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-ocid="tenders.pagination_next"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
