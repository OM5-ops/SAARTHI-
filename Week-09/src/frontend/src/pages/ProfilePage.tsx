import { Disclaimer } from "@/components/Disclaimer";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBusinessProfile, useSaveBusinessProfile } from "@/hooks/useQueries";
import type { BusinessProfile } from "@/types";
import { Building2, Pencil, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const STAFF_ROLES = [
  {
    name: "Ananya Sharma",
    role: "Owner / Admin",
    email: "ananya@sarrthi-demo.in",
  },
  { name: "Rahul Mehta", role: "Accounts", email: "rahul@sarrthi-demo.in" },
  { name: "Priya Nair", role: "Compliance", email: "priya@sarrthi-demo.in" },
];

export function ProfilePage() {
  const { data, isLoading, isError, refetch } = useBusinessProfile();
  const saveProfile = useSaveBusinessProfile();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<BusinessProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  function handleEdit() {
    setForm(data ?? null);
    setError(null);
    setEditing(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    if (!form.companyName.trim() || !form.ownerName.trim()) {
      setError("Enter your company and owner name.");
      return;
    }
    setError(null);
    saveProfile.mutate(form, {
      onSuccess: () => {
        toast.success("Business profile saved", {
          description: form.companyName,
        });
        setEditing(false);
      },
      onError: () => {
        toast.error("Could not save business profile", {
          description: "The request failed. Please try again.",
        });
      },
    });
  }

  return (
    <div data-ocid="profile.page" className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Business Profile"
        description="Keep your Udyam, GSTIN, PAN and contact details current."
        actions={
          !editing && data ? (
            <Button
              type="button"
              variant="outline"
              data-ocid="profile.edit_button"
              onClick={handleEdit}
            >
              <Pencil className="size-4" aria-hidden="true" />
              Edit profile
            </Button>
          ) : null
        }
      />

      <Disclaimer />

      {isLoading ? (
        <LoadingState rows={5} label="Loading business profile" />
      ) : isError ? (
        <ErrorState
          description="We could not load your business profile. Check your connection and try again."
          onRetry={() => void refetch()}
        />
      ) : !data || !form ? (
        <EmptyState
          title="No business profile"
          description="Your business profile has not been set up yet."
          icon={Building2}
        />
      ) : editing ? (
        <Card className="shadow-subtle">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              Edit business profile
            </CardTitle>
            <CardDescription>
              All fields are illustrative demo data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profile-company">Company name</Label>
                  <Input
                    id="profile-company"
                    value={form.companyName}
                    onChange={(event) =>
                      setForm({ ...form, companyName: event.target.value })
                    }
                    data-ocid="profile.company_input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-owner">Owner name</Label>
                  <Input
                    id="profile-owner"
                    value={form.ownerName}
                    onChange={(event) =>
                      setForm({ ...form, ownerName: event.target.value })
                    }
                    data-ocid="profile.owner_input"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="profile-udyam">Udyam number</Label>
                  <Input
                    id="profile-udyam"
                    value={form.udyamNumber}
                    onChange={(event) =>
                      setForm({ ...form, udyamNumber: event.target.value })
                    }
                    data-ocid="profile.udyam_input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-gstin">GSTIN</Label>
                  <Input
                    id="profile-gstin"
                    value={form.gstin}
                    onChange={(event) =>
                      setForm({ ...form, gstin: event.target.value })
                    }
                    data-ocid="profile.gstin_input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-pan">PAN</Label>
                  <Input
                    id="profile-pan"
                    value={form.pan}
                    onChange={(event) =>
                      setForm({ ...form, pan: event.target.value })
                    }
                    data-ocid="profile.pan_input"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profile-category">Category</Label>
                  <Input
                    id="profile-category"
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    data-ocid="profile.category_input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-capacity">Monthly capacity</Label>
                  <Input
                    id="profile-capacity"
                    value={form.monthlyCapacity}
                    onChange={(event) =>
                      setForm({ ...form, monthlyCapacity: event.target.value })
                    }
                    data-ocid="profile.capacity_input"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profile-email">Contact email</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={form.contactEmail}
                    onChange={(event) =>
                      setForm({ ...form, contactEmail: event.target.value })
                    }
                    data-ocid="profile.email_input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-phone">Contact phone</Label>
                  <Input
                    id="profile-phone"
                    value={form.contactPhone}
                    onChange={(event) =>
                      setForm({ ...form, contactPhone: event.target.value })
                    }
                    data-ocid="profile.phone_input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-address">Address</Label>
                <Textarea
                  id="profile-address"
                  value={form.address}
                  onChange={(event) =>
                    setForm({ ...form, address: event.target.value })
                  }
                  data-ocid="profile.address_input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-products">
                  Products (comma separated)
                </Label>
                <Input
                  id="profile-products"
                  value={form.products.join(", ")}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      products: event.target.value
                        .split(",")
                        .map((value) => value.trim())
                        .filter(Boolean),
                    })
                  }
                  data-ocid="profile.products_input"
                />
              </div>
              {error ? (
                <p
                  data-ocid="profile.error_state"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {error}
                </p>
              ) : null}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  data-ocid="profile.save_button"
                  disabled={saveProfile.isPending}
                >
                  {saveProfile.isPending ? "Saving…" : "Save profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="profile.cancel_button"
                  onClick={() => setEditing(false)}
                  disabled={saveProfile.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="shadow-subtle">
            <CardHeader>
              <CardTitle className="font-display text-xl">
                {data.companyName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Owner
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {data.ownerName}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Category
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {data.category}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Udyam Number
                  </dt>
                  <dd className="font-mono text-sm font-medium text-foreground">
                    {data.udyamNumber}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    GSTIN
                  </dt>
                  <dd className="font-mono text-sm font-medium text-foreground">
                    {data.gstin}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    PAN
                  </dt>
                  <dd className="font-mono text-sm font-medium text-foreground">
                    {data.pan}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Monthly Capacity
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {data.monthlyCapacity}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Email
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {data.contactEmail}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Phone
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {data.contactPhone}
                  </dd>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Address
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {data.address}
                  </dd>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Products
                  </dt>
                  <dd className="flex flex-wrap gap-2">
                    {data.products.map((product) => (
                      <span
                        key={product}
                        className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground"
                      >
                        {product}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="shadow-subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="size-5 text-primary" aria-hidden="true" />
                Staff Roles
              </CardTitle>
              <CardDescription>
                Illustrative team members for this demo workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {STAFF_ROLES.map((member, index) => (
                  <li
                    key={member.email}
                    data-ocid={`profile.staff_role.${index + 1}`}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {member.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-primary">
                      {member.role}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
