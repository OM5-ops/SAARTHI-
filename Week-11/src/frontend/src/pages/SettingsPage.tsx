import { Disclaimer } from "@/components/Disclaimer";
import { PageHeader } from "@/components/PageHeader";
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
import { Switch } from "@/components/ui/switch";
import { isDemoMode, setDemoMode } from "@/services/dataSource";
import {
  Bell,
  CreditCard,
  Database,
  HelpCircle,
  Lock,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface NotificationPrefs {
  overdueInvoices: boolean;
  tenderDeadlines: boolean;
  paymentReceived: boolean;
  weeklyDigest: boolean;
}

interface BankingPrefs {
  accountName: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
}

interface PrivacyPrefs {
  analytics: boolean;
  marketing: boolean;
  shareAnonymised: boolean;
}

export function SettingsPage() {
  const [demo, setDemo] = useState(isDemoMode);
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    overdueInvoices: true,
    tenderDeadlines: true,
    paymentReceived: true,
    weeklyDigest: false,
  });
  const [banking, setBanking] = useState<BankingPrefs>({
    accountName: "Sarrthi Precision Components",
    accountNumber: "•••• •••• 4821",
    ifsc: "HDFC0000123",
    upiId: "sarrthi@hdfcbank",
  });
  const [privacy, setPrivacy] = useState<PrivacyPrefs>({
    analytics: true,
    marketing: false,
    shareAnonymised: true,
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  function handleDemoChange(enabled: boolean) {
    setDemo(enabled);
    setDemoMode(enabled);
    toast.success(enabled ? "Demo mode enabled" : "Demo mode disabled", {
      description: enabled
        ? "Requests use persisted sample data."
        : "Requests go to VITE_API_BASE_URL.",
    });
  }

  function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) {
      setPasswordError("Use a password of at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setPasswordError(null);
    setPassword("");
    setConfirmPassword("");
    toast.success("Password updated", {
      description: "Your password was changed for this demo session.",
    });
  }

  return (
    <div data-ocid="settings.page" className="space-y-6">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Configure demo mode, notifications, payments, security and privacy."
      />

      <Disclaimer />

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="size-5 text-primary" aria-hidden="true" />
            Demo Mode
          </CardTitle>
          <CardDescription>
            Demo mode uses realistic sample data persisted in your browser's
            local storage. Turn it off to route requests to the configured API
            base URL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="demo-mode" className="text-sm font-medium">
                Use demo data
              </Label>
              <p className="text-xs text-muted-foreground">
                {demo
                  ? "Demo mode is on. No live backend requests are made."
                  : "Demo mode is off. Requests go to VITE_API_BASE_URL."}
              </p>
            </div>
            <Switch
              id="demo-mode"
              checked={demo}
              onCheckedChange={handleDemoChange}
              data-ocid="settings.demo_switch"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="size-5 text-primary" aria-hidden="true" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose which alerts appear in your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(
            [
              ["overdueInvoices", "Overdue invoice alerts"],
              ["tenderDeadlines", "Tender deadline reminders"],
              ["paymentReceived", "Payment received notices"],
              ["weeklyDigest", "Weekly summary digest"],
            ] as Array<[keyof NotificationPrefs, string]>
          ).map(([key, label]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3"
            >
              <Label htmlFor={`notify-${key}`} className="text-sm font-medium">
                {label}
              </Label>
              <Switch
                id={`notify-${key}`}
                checked={notifications[key]}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, [key]: checked }))
                }
                data-ocid={`settings.notification.${key}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="size-5 text-primary" aria-hidden="true" />
            Payment & Banking Preferences
          </CardTitle>
          <CardDescription>
            Illustrative details used for demo payment records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bank-account-name">Account name</Label>
              <Input
                id="bank-account-name"
                value={banking.accountName}
                onChange={(event) =>
                  setBanking((prev) => ({
                    ...prev,
                    accountName: event.target.value,
                  }))
                }
                data-ocid="settings.banking.account_name_input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-account-number">Account number</Label>
              <Input
                id="bank-account-number"
                value={banking.accountNumber}
                onChange={(event) =>
                  setBanking((prev) => ({
                    ...prev,
                    accountNumber: event.target.value,
                  }))
                }
                data-ocid="settings.banking.account_number_input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-ifsc">IFSC</Label>
              <Input
                id="bank-ifsc"
                value={banking.ifsc}
                onChange={(event) =>
                  setBanking((prev) => ({ ...prev, ifsc: event.target.value }))
                }
                data-ocid="settings.banking.ifsc_input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-upi">UPI ID</Label>
              <Input
                id="bank-upi"
                value={banking.upiId}
                onChange={(event) =>
                  setBanking((prev) => ({ ...prev, upiId: event.target.value }))
                }
                data-ocid="settings.banking.upi_input"
              />
            </div>
          </div>
          <Button
            type="button"
            className="mt-4"
            data-ocid="settings.banking.save_button"
            onClick={() =>
              toast.success("Banking preferences saved", {
                description: "Stored for this demo session.",
              })
            }
          >
            Save banking preferences
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="size-5 text-primary" aria-hidden="true" />
            Security & Password
          </CardTitle>
          <CardDescription>
            Update the password for this demo workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  data-ocid="settings.password_input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat password"
                  data-ocid="settings.confirm_password_input"
                />
              </div>
            </div>
            {passwordError ? (
              <p
                data-ocid="settings.password_error_state"
                role="alert"
                className="text-sm text-destructive"
              >
                {passwordError}
              </p>
            ) : null}
            <Button type="submit" data-ocid="settings.password_submit_button">
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
            Privacy & Consent
          </CardTitle>
          <CardDescription>Control how your demo data is used.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(
            [
              ["analytics", "Allow usage analytics"],
              ["marketing", "Receive product updates"],
              ["shareAnonymised", "Share anonymised data"],
            ] as Array<[keyof PrivacyPrefs, string]>
          ).map(([key, label]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3"
            >
              <Label htmlFor={`privacy-${key}`} className="text-sm font-medium">
                {label}
              </Label>
              <Switch
                id={`privacy-${key}`}
                checked={privacy[key]}
                onCheckedChange={(checked) =>
                  setPrivacy((prev) => ({ ...prev, [key]: checked }))
                }
                data-ocid={`settings.privacy.${key}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <HelpCircle className="size-5 text-primary" aria-hidden="true" />
            Help & Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            SARRTHI is an academic project. For questions about this demo,
            contact the project team at support@sarrthi-demo.in.
          </p>
          <p className="text-sm text-muted-foreground">
            This portal is not affiliated with any government body and does not
            submit official filings.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldAlert
              className="size-5 text-accent-foreground"
              aria-hidden="true"
            />
            Academic Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            SARRTHI is an academic project. It is not an official government
            portal and has no government affiliation. All sample data is
            illustrative.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
