import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Banknote,
  Building2,
  Database,
  Download,
  Eye,
  EyeOff,
  Info,
  Key,
  Pencil,
  Receipt,
  Settings,
  Shield,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type EmployeeCredential = {
  id: string;
  name: string;
  employeeId: string;
  username: string;
  password: string;
};

type SalaryConfig = {
  da: number;
  hra: number;
  pf: number;
  esic: number;
};

const DEFAULT_SALARY_CONFIG: SalaryConfig = {
  da: 257,
  hra: 20,
  pf: 12,
  esic: 0.75,
};

function getEmployees() {
  try {
    return JSON.parse(localStorage.getItem("employees") || "[]");
  } catch {
    return [];
  }
}

function getAdminPassword() {
  return localStorage.getItem("sms_admin_password") || "admin123";
}

function getSalaryConfig(): SalaryConfig {
  try {
    const stored = localStorage.getItem("sms_salary_config");
    if (stored) return { ...DEFAULT_SALARY_CONFIG, ...JSON.parse(stored) };
  } catch {}
  return { ...DEFAULT_SALARY_CONFIG };
}

function buildCredential(emp: {
  name: string;
  employeeId: string;
  id: string;
}): EmployeeCredential {
  const username =
    (emp.name || "").toLowerCase().slice(0, 4) +
    (emp.employeeId || emp.id || "");
  return {
    id: emp.id || emp.employeeId,
    name: emp.name,
    employeeId: emp.employeeId || emp.id,
    username,
    password: username,
  };
}

// ─── Section: User & Password Management ─────────────────────────────────────
function UserPasswordSection() {
  const [open, setOpen] = useState(false);
  const employees = getEmployees();
  const credentials: EmployeeCredential[] = employees.map(buildCredential);

  const [editTarget, setEditTarget] = useState<EmployeeCredential | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showPassMap, setShowPassMap] = useState<Record<string, boolean>>({});

  // Admin password change
  const [adminSection, setAdminSection] = useState(false);
  const [currentAdminPwd, setCurrentAdminPwd] = useState("");
  const [newAdminPwd, setNewAdminPwd] = useState("");
  const [confirmAdminPwd, setConfirmAdminPwd] = useState("");
  const [showAdminPwd, setShowAdminPwd] = useState(false);

  function openEdit(cred: EmployeeCredential) {
    setEditTarget(cred);
    setEditUsername(cred.username);
    setEditPassword(cred.password);
  }

  function saveEdit() {
    if (!editTarget) return;
    const stored = getEmployees();
    const updated = stored.map((e: { id: string; employeeId: string }) => {
      if ((e.employeeId || e.id) === editTarget.employeeId) {
        return {
          ...e,
          _customUsername: editUsername,
          _customPassword: editPassword,
        };
      }
      return e;
    });
    localStorage.setItem("employees", JSON.stringify(updated));
    toast.success("Credentials updated.");
    setEditTarget(null);
  }

  function deleteCredential(empId: string) {
    const stored = getEmployees();
    const updated = stored.filter(
      (e: { id: string; employeeId: string }) =>
        (e.employeeId || e.id) !== empId,
    );
    localStorage.setItem("employees", JSON.stringify(updated));
    toast.success("Employee removed.");
  }

  function changeAdminPassword() {
    if (currentAdminPwd !== getAdminPassword()) {
      toast.error("Current password is incorrect.");
      return;
    }
    if (!newAdminPwd) {
      toast.error("New password cannot be empty.");
      return;
    }
    if (newAdminPwd !== confirmAdminPwd) {
      toast.error("Passwords do not match.");
      return;
    }
    localStorage.setItem("sms_admin_password", newAdminPwd);
    toast.success("Admin password updated successfully.");
    setCurrentAdminPwd("");
    setNewAdminPwd("");
    setConfirmAdminPwd("");
    setAdminSection(false);
  }

  return (
    <>
      <Card
        className="gradient-card cursor-pointer hover:scale-[1.02] transition-transform duration-200"
        onClick={() => setOpen(true)}
        data-ocid="settings.user_password.open_modal_button"
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/10 text-accent">
                <Key className="w-5 h-5" />
              </div>
              <CardTitle className="text-sm font-display">
                User &amp; Password Management
              </CardTitle>
            </div>
            <Badge
              variant="secondary"
              className="text-xs bg-green-500/20 text-green-400"
            >
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-xs">
            Manage employee credentials and admin password
          </CardDescription>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-2xl max-h-[80vh] overflow-y-auto"
          data-ocid="settings.user_password.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-4 h-4" /> User &amp; Password Management
            </DialogTitle>
            <DialogDescription>
              View and edit employee credentials. Change admin password below.
            </DialogDescription>
          </DialogHeader>

          {/* Change Admin Password */}
          <div className="border border-border/40 rounded-xl p-4 space-y-3">
            <button
              type="button"
              className="flex items-center justify-between cursor-pointer w-full text-left"
              onClick={() => setAdminSection((v) => !v)}
            >
              <p className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Change Admin
                Password
              </p>
              <Button size="sm" variant="ghost" className="h-7 text-xs">
                {adminSection ? "Hide" : "Show"}
              </Button>
            </button>
            {adminSection && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showAdminPwd ? "text" : "password"}
                      value={currentAdminPwd}
                      onChange={(e) => setCurrentAdminPwd(e.target.value)}
                      className="pr-8 text-sm"
                      placeholder="Current password"
                      data-ocid="settings.admin_current_pwd.input"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 text-muted-foreground"
                      onClick={() => setShowAdminPwd((v) => !v)}
                    >
                      {showAdminPwd ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">New Password</Label>
                  <Input
                    type="password"
                    value={newAdminPwd}
                    onChange={(e) => setNewAdminPwd(e.target.value)}
                    className="text-sm"
                    placeholder="New password"
                    data-ocid="settings.admin_new_pwd.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Confirm Password</Label>
                  <Input
                    type="password"
                    value={confirmAdminPwd}
                    onChange={(e) => setConfirmAdminPwd(e.target.value)}
                    className="text-sm"
                    placeholder="Confirm password"
                    data-ocid="settings.admin_confirm_pwd.input"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end">
                  <Button
                    size="sm"
                    className="gradient-primary h-8 text-xs"
                    onClick={changeAdminPassword}
                    data-ocid="settings.admin_pwd.save_button"
                  >
                    Update Admin Password
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Employee Credentials Table */}
          <div className="space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-accent" /> Employee Credentials (
              {credentials.length})
            </p>
            {credentials.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No employees found. Add employees first.
              </p>
            ) : (
              <div className="border border-border/40 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Employee ID</TableHead>
                      <TableHead className="text-xs">Username</TableHead>
                      <TableHead className="text-xs">Password</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {credentials.map((cred, idx) => (
                      <TableRow
                        key={cred.id}
                        data-ocid={`settings.cred.item.${idx + 1}`}
                      >
                        <TableCell className="text-xs font-medium">
                          {cred.name}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {cred.employeeId}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {cred.username}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {showPassMap[cred.id] ? cred.password : "••••••••"}
                          <button
                            type="button"
                            className="ml-1 text-muted-foreground"
                            onClick={() =>
                              setShowPassMap((p) => ({
                                ...p,
                                [cred.id]: !p[cred.id],
                              }))
                            }
                          >
                            {showPassMap[cred.id] ? (
                              <EyeOff className="w-3 h-3 inline" />
                            ) : (
                              <Eye className="w-3 h-3 inline" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => openEdit(cred)}
                              data-ocid={`settings.cred.edit_button.${idx + 1}`}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-red-400 hover:bg-red-500/10"
                              onClick={() => deleteCredential(cred.employeeId)}
                              data-ocid={`settings.cred.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit credential dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
      >
        <DialogContent data-ocid="settings.edit_cred.dialog">
          <DialogHeader>
            <DialogTitle>Edit Credentials — {editTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Username</Label>
              <Input
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                data-ocid="settings.edit_username.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Password</Label>
              <Input
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                data-ocid="settings.edit_password.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditTarget(null)}
              data-ocid="settings.edit_cred.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="gradient-primary"
              onClick={saveEdit}
              data-ocid="settings.edit_cred.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Section: Salary Structure Configuration ─────────────────────────────────
function SalaryConfigSection() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<SalaryConfig>(getSalaryConfig);

  function save() {
    localStorage.setItem("sms_salary_config", JSON.stringify(config));
    toast.success("Salary configuration saved.");
    setOpen(false);
  }

  function field(label: string, key: keyof SalaryConfig, unit: string) {
    return (
      <div className="space-y-1">
        <Label className="text-xs">
          {label} ({unit})
        </Label>
        <Input
          type="number"
          min={0}
          value={config[key]}
          onChange={(e) =>
            setConfig((prev) => ({ ...prev, [key]: Number(e.target.value) }))
          }
          className="text-sm"
          data-ocid={`settings.salary_config.${key}.input`}
        />
      </div>
    );
  }

  return (
    <>
      <Card
        className="gradient-card cursor-pointer hover:scale-[1.02] transition-transform duration-200"
        onClick={() => setOpen(true)}
        data-ocid="settings.salary_config.open_modal_button"
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-success/10 text-success">
                <Banknote className="w-5 h-5" />
              </div>
              <CardTitle className="text-sm font-display">
                Salary Structure Configuration
              </CardTitle>
            </div>
            <Badge
              variant="secondary"
              className="text-xs bg-green-500/20 text-green-400"
            >
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-xs">
            Configure default DA%, HRA%, PF%, ESIC%
          </CardDescription>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="settings.salary_config.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="w-4 h-4" /> Salary Structure
            </DialogTitle>
            <DialogDescription>
              Default values used in salary processing. Changes apply to new
              calculations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {field("DA Percentage", "da", "%")}
            {field("HRA Percentage", "hra", "%")}
            {field("PF Percentage", "pf", "%")}
            {field("ESIC Percentage", "esic", "%")}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="settings.salary_config.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="gradient-primary"
              onClick={save}
              data-ocid="settings.salary_config.save_button"
            >
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Section: Backup & Restore ───────────────────────────────────────────────
function BackupRestoreSection() {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const BACKUP_KEYS = [
    "sms_institutes",
    "sms_employees",
    "sms_attendance",
    "sms_salary",
    "sms_daily_workers",
    "employees",
    "salaries",
    "attendance",
    "dailyWorkers",
    "institutes",
    "sms_admin_password",
    "sms_salary_config",
  ];

  function downloadBackup() {
    const data: Record<string, unknown> = {};
    for (const key of BACKUP_KEYS) {
      const val = localStorage.getItem(key);
      if (val !== null) {
        try {
          data[key] = JSON.parse(val);
        } catch {
          data[key] = val;
        }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sms_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded.");
  }

  function restoreBackup(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        for (const [key, value] of Object.entries(data)) {
          localStorage.setItem(
            key,
            typeof value === "string" ? value : JSON.stringify(value),
          );
        }
        toast.success("Backup restored. Refreshing...");
        setTimeout(() => window.location.reload(), 1200);
      } catch {
        toast.error("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <>
      <Card
        className="gradient-card cursor-pointer hover:scale-[1.02] transition-transform duration-200"
        onClick={() => setOpen(true)}
        data-ocid="settings.backup.open_modal_button"
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-warning/10 text-warning">
                <Database className="w-5 h-5" />
              </div>
              <CardTitle className="text-sm font-display">
                Backup &amp; Restore
              </CardTitle>
            </div>
            <Badge
              variant="secondary"
              className="text-xs bg-green-500/20 text-green-400"
            >
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-xs">
            Export or import a full JSON backup of all data
          </CardDescription>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="settings.backup.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-4 h-4" /> Backup &amp; Restore
            </DialogTitle>
            <DialogDescription>
              Download all data as a JSON file or restore from a previous
              backup.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-3 p-4 rounded-xl border border-border/40">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Download Backup</p>
                  <p className="text-xs text-muted-foreground">
                    Exports all employees, institutes, salaries, attendance, and
                    settings as a JSON file.
                  </p>
                </div>
              </div>
              <Button
                className="gradient-primary w-full"
                onClick={downloadBackup}
                data-ocid="settings.backup.download_button"
              >
                <Download className="w-4 h-4 mr-2" /> Download Backup
              </Button>
            </div>
            <div className="flex flex-col gap-3 p-4 rounded-xl border border-border/40">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Restore from Backup</p>
                  <p className="text-xs text-muted-foreground">
                    This will overwrite all current data. Make sure you have a
                    recent backup before restoring.
                  </p>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) restoreBackup(f);
                }}
              />
              <Button
                variant="outline"
                className="w-full border-warning/40 text-warning hover:bg-warning/10"
                onClick={() => fileRef.current?.click()}
                data-ocid="settings.backup.upload_button"
              >
                <Upload className="w-4 h-4 mr-2" /> Restore from Backup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Section: Tax Slabs (Informational) ──────────────────────────────────────
function TaxSlabsSection() {
  const [open, setOpen] = useState(false);

  const ptSlabs = [
    { range: "Below ₹2,25,000", monthly: "₹0", annual: "₹0" },
    { range: "₹2,25,000 – ₹2,99,999", monthly: "₹125", annual: "₹1,500" },
    { range: "₹3,00,000 – ₹3,99,999", monthly: "₹167", annual: "₹2,000" },
    { range: "₹4,00,000 and above", monthly: "₹208", annual: "₹2,500" },
  ];

  const itSlabs = [
    { range: "Up to ₹4,00,000", rate: "Nil" },
    { range: "₹4,00,001 – ₹8,00,000", rate: "5%" },
    { range: "₹8,00,001 – ₹12,00,000", rate: "10%" },
    { range: "₹12,00,001 – ₹16,00,000", rate: "15%" },
    { range: "₹16,00,001 – ₹20,00,000", rate: "20%" },
    { range: "₹20,00,001 – ₹24,00,000", rate: "25%" },
    { range: "Above ₹24,00,000", rate: "30%" },
  ];

  return (
    <>
      <Card
        className="gradient-card cursor-pointer hover:scale-[1.02] transition-transform duration-200"
        onClick={() => setOpen(true)}
        data-ocid="settings.tax_slabs.open_modal_button"
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/10 text-destructive">
                <Receipt className="w-5 h-5" />
              </div>
              <CardTitle className="text-sm font-display">
                Tax Slab Reference
              </CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              View Only
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-xs">
            Professional Tax (Maharashtra) &amp; Income Tax (New Regime
            FY2025-26) slabs
          </CardDescription>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-xl max-h-[80vh] overflow-y-auto"
          data-ocid="settings.tax_slabs.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Tax Slab Reference
            </DialogTitle>
            <DialogDescription>
              Current applicable tax slabs used for automatic calculations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* PT Slabs */}
            <div>
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Professional Tax —
                Maharashtra (based on annual gross)
              </p>
              <div className="border border-border/40 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">
                        Annual Gross Salary
                      </TableHead>
                      <TableHead className="text-xs">Monthly PT</TableHead>
                      <TableHead className="text-xs">Annual PT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ptSlabs.map((row) => (
                      <TableRow key={row.range}>
                        <TableCell className="text-xs">{row.range}</TableCell>
                        <TableCell className="text-xs font-medium">
                          {row.monthly}
                        </TableCell>
                        <TableCell className="text-xs">{row.annual}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* IT Slabs */}
            <div>
              <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                <Info className="w-4 h-4 text-accent" /> Income Tax — New Regime
                FY 2025-26
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                Standard deduction: ₹75,000. Section 87A rebate: no tax if
                taxable income ≤ ₹7L and calculated tax ≤ ₹25,000.
              </p>
              <div className="border border-border/40 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">
                        Annual Taxable Income
                      </TableHead>
                      <TableHead className="text-xs">Tax Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itSlabs.map((row) => (
                      <TableRow key={row.range}>
                        <TableCell className="text-xs">{row.range}</TableCell>
                        <TableCell className="text-xs font-medium">
                          {row.rate}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Section: System Information ─────────────────────────────────────────────
function SystemInfoSection() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Card
        className="gradient-card cursor-pointer hover:scale-[1.02] transition-transform duration-200"
        onClick={() => setOpen(true)}
        data-ocid="settings.system_info.open_modal_button"
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/30 text-muted-foreground">
                <Building2 className="w-5 h-5" />
              </div>
              <CardTitle className="text-sm font-display">
                System Information
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-xs">
            App version, author, and copyright details
          </CardDescription>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="settings.system_info.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-4 h-4" /> System Information
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(
              [
                ["Application", "Yf's Platform — Salary Management System"],
                ["Version", "v3.0.0"],
                ["Author", "Sachin Patel"],
                ["Copyright", `© ${new Date().getFullYear()} Yf's Platform`],
                ["Platform", "Web Application"],
                ["Data Storage", "Browser localStorage (persistent)"],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
              >
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-medium">{value}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  return (
    <div className="space-y-6" data-ocid="settings.page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-gradient">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            System configuration and preferences
          </p>
        </div>
        <Settings className="w-6 h-6 text-muted-foreground/50" />
      </motion.div>

      {/* Sections grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <UserPasswordSection />
        <SalaryConfigSection />
        <BackupRestoreSection />
        <TaxSlabsSection />
        <SystemInfoSection />
      </motion.div>
    </div>
  );
}
