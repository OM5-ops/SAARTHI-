import { ConfirmDialog } from "@/components/ConfirmDialog";
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
  useCreateDocument,
  useDeleteDocument,
  useDocuments,
} from "@/hooks/useQueries";
import { DOCUMENT_CATEGORY_LABELS, DocumentCategory } from "@/types";
import { formatDateTime } from "@/utils/format";
import { Download, FileText, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const CATEGORIES: DocumentCategory[] = [
  DocumentCategory.invoice,
  DocumentCategory.purchaseOrder,
  DocumentCategory.deliveryChallan,
  DocumentCategory.acceptanceRecord,
  DocumentCategory.correspondence,
  DocumentCategory.other,
];

interface DocumentFormState {
  name: string;
  category: DocumentCategory;
  notes: string;
  mimeType: string;
  sizeBytes: string;
}

function emptyDocumentForm(): DocumentFormState {
  return {
    name: "",
    category: DocumentCategory.invoice,
    notes: "",
    mimeType: "application/pdf",
    sizeBytes: "0",
  };
}

export function DocumentsPage() {
  const { data, isLoading, isError, refetch } = useDocuments();
  const createDocument = useCreateDocument();
  const deleteDocument = useDeleteDocument();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DocumentCategory | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<DocumentFormState>(emptyDocumentForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);

  const documents = data ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents.filter((document) => {
      if (category !== "all" && document.category !== category) return false;
      if (!q) return true;
      return (
        document.name.toLowerCase().includes(q) ||
        document.notes.toLowerCase().includes(q)
      );
    });
  }, [documents, query, category]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      setFormError("Enter a document name.");
      return;
    }
    setFormError(null);
    const size = Number(form.sizeBytes);
    createDocument.mutate(
      {
        name: form.name.trim(),
        category: form.category,
        notes: form.notes.trim(),
        mimeType: form.mimeType.trim() || "application/octet-stream",
        sizeBytes: BigInt(
          Number.isFinite(size) && size > 0 ? Math.round(size) : 0,
        ),
      },
      {
        onSuccess: () => {
          toast.success("Document added", {
            description: form.name.trim(),
          });
          setFormOpen(false);
          setForm(emptyDocumentForm());
        },
        onError: () => {
          toast.error("Could not add document", {
            description: "The request failed. Please try again.",
          });
        },
      },
    );
  }

  function handleDelete() {
    if (deleteTarget === null) return;
    deleteDocument.mutate(deleteTarget, {
      onSuccess: () => {
        toast.success("Document deleted");
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error("Could not delete document", {
          description: "The request failed. Please try again.",
        });
      },
    });
  }

  return (
    <div data-ocid="documents.page" className="space-y-6">
      <PageHeader
        eyebrow="Records"
        title="Documents"
        description="Store delivery challans, acceptance records and correspondence linked to your orders and invoices."
        actions={
          <Button
            type="button"
            data-ocid="documents.add_button"
            onClick={() => {
              setForm(emptyDocumentForm());
              setFormError(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add Document
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
                placeholder="Search by name or notes"
                aria-label="Search documents"
                data-ocid="documents.search_input"
                className="pl-9"
              />
            </div>
            <Select
              value={category}
              onValueChange={(value) =>
                setCategory(value as DocumentCategory | "all")
              }
            >
              <SelectTrigger
                className="w-full sm:w-56"
                aria-label="Filter by category"
                data-ocid="documents.category.select"
              >
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {DOCUMENT_CATEGORY_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <LoadingState rows={6} label="Loading documents" />
          ) : isError ? (
            <ErrorState
              description="We could not load your documents. Check your connection and try again."
              onRetry={() => void refetch()}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No documents stored"
              description="Documents you attach to orders and invoices will appear here."
              icon={FileText}
              action={
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="documents.clear_filters_button"
                  onClick={() => {
                    setQuery("");
                    setCategory("all");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table data-ocid="documents.table">
                <TableHeader className="sticky top-0 bg-muted/60">
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((document, index) => (
                    <TableRow
                      key={document.id.toString()}
                      data-ocid={`documents.row.${index + 1}`}
                    >
                      <TableCell className="font-medium text-foreground">
                        {document.name}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={DOCUMENT_CATEGORY_LABELS[document.category]}
                          tone="neutral"
                        />
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {document.notes}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(
                          new Date(
                            Number(document.uploadedAt / 1_000_000n),
                          ).toISOString(),
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Download ${document.name}`}
                            data-ocid={`documents.download_button.${index + 1}`}
                            onClick={() =>
                              toast.info("Preview unavailable", {
                                description:
                                  "This demo stores document metadata only.",
                              })
                            }
                          >
                            <Download className="size-4" aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${document.name}`}
                            data-ocid={`documents.delete_button.${index + 1}`}
                            onClick={() => setDeleteTarget(document.id)}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          data-ocid="documents.form_dialog"
          className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle>Add document</DialogTitle>
            <DialogDescription>
              Record a document in your evidence library.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="document-name">Document name</Label>
              <Input
                id="document-name"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Delivery Challan — PO/BHEL/2026/0731.pdf"
                data-ocid="documents.form.name_input"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="document-category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      category: value as DocumentCategory,
                    }))
                  }
                >
                  <SelectTrigger
                    id="document-category"
                    className="w-full"
                    aria-label="Document category"
                    data-ocid="documents.form.category_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {DOCUMENT_CATEGORY_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="document-mime">File type</Label>
                <Input
                  id="document-mime"
                  value={form.mimeType}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      mimeType: event.target.value,
                    }))
                  }
                  placeholder="application/pdf"
                  data-ocid="documents.form.mime_input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="document-notes">Notes</Label>
              <Textarea
                id="document-notes"
                value={form.notes}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, notes: event.target.value }))
                }
                placeholder="Signed delivery challan for the BHEL panel order."
                data-ocid="documents.form.notes_input"
              />
            </div>
            {formError ? (
              <p
                data-ocid="documents.form.error_state"
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
                data-ocid="documents.form.cancel_button"
                onClick={() => setFormOpen(false)}
                disabled={createDocument.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="documents.form.submit_button"
                disabled={createDocument.isPending}
              >
                {createDocument.isPending ? "Adding…" : "Add document"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete document"
        description="This removes the document from your evidence library. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        pending={deleteDocument.isPending}
      />
    </div>
  );
}
