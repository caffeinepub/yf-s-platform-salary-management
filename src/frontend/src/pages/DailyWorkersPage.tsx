import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
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
  ArrowRightLeft,
  BadgeIndianRupee,
  Building2,
  CalendarDays,
  CheckCircle2,
  HardHat,
  Lock,
  LogOut,
  Pencil,
  Plus,
  Save,
  Trash2,
  Unlock,
  UserCheck,
  UserMinus,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type WorkerStatus = "active" | "transferred" | "resigned" | "removed";

type DailyWorker = {
  id: string;
  name: string;
  institute: string;
  status: WorkerStatus;
  transferredTo?: string;
};

type WorkerPeriod = {
  id: string;
  workerId: string;
  periodLabel: string;
  startDate: string;
  endDate: string;
  ratePerDay: number;
  attendance: Record<string, boolean>; // date string -> true = present
  presentDays: number;
  netPayable: number;
  locked: boolean;
};

function getWorkers(): DailyWorker[] {
  try {
    return JSON.parse(localStorage.getItem("dailyWorkers") || "[]");
  } catch {
    return [];
  }
}
function saveWorkers(data: DailyWorker[]) {
  localStorage.setItem("dailyWorkers", JSON.stringify(data));
}
function getPeriods(): WorkerPeriod[] {
  try {
    return JSON.parse(localStorage.getItem("dailyWorkerPeriods") || "[]");
  } catch {
    return [];
  }
}
function savePeriods(data: WorkerPeriod[]) {
  localStorage.setItem("dailyWorkerPeriods", JSON.stringify(data));
}
function getInstitutes(): string[] {
  try {
    return JSON.parse(localStorage.getItem("institutes") || "[]").map(
      (i: { name: string }) => i.name,
    );
  } catch {
    return [];
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Generate 15-day periods for a given year
function generatePeriods(
  year: number,
): { label: string; start: string; end: string }[] {
  const periods: { label: string; start: string; end: string }[] = [];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const mid = 15;
    const start1 = `${year}-${String(m + 1).padStart(2, "0")}-01`;
    const end1 = `${year}-${String(m + 1).padStart(2, "0")}-${String(mid).padStart(2, "0")}`;
    const start2 = `${year}-${String(m + 1).padStart(2, "0")}-16`;
    const end2 = `${year}-${String(m + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
    periods.push({
      label: `${monthNames[m]} 1-15 ${year}`,
      start: start1,
      end: end1,
    });
    periods.push({
      label: `${monthNames[m]} 16-${daysInMonth} ${year}`,
      start: start2,
      end: end2,
    });
  }
  return periods;
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start);
  const endD = new Date(end);
  while (cur <= endD) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function isSunday(dateStr: string) {
  return new Date(dateStr).getDay() === 0;
}

function formatDate(d: string) {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    weekday: "short",
  });
}

const STATUS_CONFIG: Record<
  WorkerStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  active: {
    label: "Active",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: <UserCheck className="w-3 h-3" />,
  },
  transferred: {
    label: "Transferred",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: <ArrowRightLeft className="w-3 h-3" />,
  },
  resigned: {
    label: "Resigned",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    icon: <LogOut className="w-3 h-3" />,
  },
  removed: {
    label: "Removed",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: <UserX className="w-3 h-3" />,
  },
};

export default function DailyWorkersPage() {
  const now = new Date();
  const [workers, setWorkers] = useState<DailyWorker[]>(getWorkers);
  const [periods, setPeriods] = useState<WorkerPeriod[]>(getPeriods);
  const [filterInstitute, setFilterInstitute] = useState("all");
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editWorker, setEditWorker] = useState<DailyWorker | null>(null);
  const [statusWorker, setStatusWorker] = useState<{
    worker: DailyWorker;
    status: WorkerStatus;
  } | null>(null);
  const [deleteWorker, setDeleteWorker] = useState<DailyWorker | null>(null);
  const [attendanceWorker, setAttendanceWorker] = useState<DailyWorker | null>(
    null,
  );
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [ratePerDay, setRatePerDay] = useState("");
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>(
    {},
  );
  const [deleteperiod, setDeletePeriod] = useState<WorkerPeriod | null>(null);

  // Form state
  const [form, setForm] = useState({ name: "", institute: "" });
  const [transferTo, setTransferTo] = useState("");

  const institutes = getInstitutes();
  const yearPeriods = generatePeriods(Number(selectedYear));
  const years = ["2024", "2025", "2026"];

  const filteredWorkers = workers.filter(
    (w) => filterInstitute === "all" || w.institute === filterInstitute,
  );

  function persist(updated: DailyWorker[]) {
    setWorkers(updated);
    saveWorkers(updated);
  }

  function persistPeriods(updated: WorkerPeriod[]) {
    setPeriods(updated);
    savePeriods(updated);
  }

  function handleAddWorker() {
    if (!form.name.trim() || !form.institute) {
      toast.error("Name and institute are required.");
      return;
    }
    if (editWorker) {
      const updated = workers.map((w) =>
        w.id === editWorker.id
          ? { ...w, name: form.name.trim(), institute: form.institute }
          : w,
      );
      persist(updated);
      toast.success("Worker updated.");
    } else {
      const newWorker: DailyWorker = {
        id: generateId(),
        name: form.name.trim(),
        institute: form.institute,
        status: "active",
      };
      persist([...workers, newWorker]);
      toast.success("Worker added.");
    }
    setForm({ name: "", institute: "" });
    setEditWorker(null);
    setShowAddDialog(false);
  }

  function handleStatusChange(worker: DailyWorker, status: WorkerStatus) {
    if (status === "transferred" && !transferTo) {
      toast.error("Select destination institute.");
      return;
    }
    const updated = workers.map((w) =>
      w.id === worker.id
        ? {
            ...w,
            status,
            institute: status === "transferred" ? transferTo : w.institute,
            transferredTo: status === "transferred" ? transferTo : undefined,
          }
        : w,
    );
    persist(updated);
    toast.success(`Worker marked as ${status}.`);
    setStatusWorker(null);
    setTransferTo("");
  }

  function handleDeleteWorker(worker: DailyWorker) {
    persist(workers.filter((w) => w.id !== worker.id));
    persistPeriods(periods.filter((p) => p.workerId !== worker.id));
    toast.success("Worker deleted.");
    setDeleteWorker(null);
  }

  function openAttendance(worker: DailyWorker) {
    setAttendanceWorker(worker);
    setSelectedPeriod("");
    setRatePerDay("");
    setAttendanceMap({});
  }

  function handlePeriodSelect(periodLabel: string) {
    setSelectedPeriod(periodLabel);
    const pDef = yearPeriods.find((p) => p.label === periodLabel)!;
    const dates = getDatesInRange(pDef.start, pDef.end);
    // Check if already saved
    const saved = periods.find(
      (p) =>
        p.workerId === attendanceWorker?.id && p.periodLabel === periodLabel,
    );
    if (saved) {
      setAttendanceMap(saved.attendance);
      setRatePerDay(String(saved.ratePerDay));
    } else {
      // Default: weekdays present (true), Sundays absent (false)
      const defaultMap: Record<string, boolean> = {};
      for (const d of dates) {
        defaultMap[d] = !isSunday(d);
      }
      setAttendanceMap(defaultMap);
    }
  }

  function toggleDate(date: string) {
    const pDef = yearPeriods.find((p) => p.label === selectedPeriod);
    if (!pDef) return;
    // Check if period is saved/locked
    const saved = periods.find(
      (p) =>
        p.workerId === attendanceWorker?.id && p.periodLabel === selectedPeriod,
    );
    if (saved?.locked) {
      toast.error("Record is locked. Delete to edit.");
      return;
    }
    setAttendanceMap((prev) => ({ ...prev, [date]: !prev[date] }));
  }

  function getPresentDays() {
    return Object.values(attendanceMap).filter(Boolean).length;
  }

  function getNetPayable() {
    return getPresentDays() * (Number(ratePerDay) || 0);
  }

  function handleSavePeriod() {
    if (!attendanceWorker || !selectedPeriod || !ratePerDay) {
      toast.error("Select period and enter rate.");
      return;
    }
    const pDef = yearPeriods.find((p) => p.label === selectedPeriod)!;
    const presentDays = getPresentDays();
    const netPayable = getNetPayable();
    const existing = periods.find(
      (p) =>
        p.workerId === attendanceWorker.id && p.periodLabel === selectedPeriod,
    );
    if (existing?.locked) {
      toast.error("Already locked.");
      return;
    }
    const newPeriod: WorkerPeriod = {
      id: existing?.id || generateId(),
      workerId: attendanceWorker.id,
      periodLabel: selectedPeriod,
      startDate: pDef.start,
      endDate: pDef.end,
      ratePerDay: Number(ratePerDay),
      attendance: { ...attendanceMap },
      presentDays,
      netPayable,
      locked: true,
    };
    const updated = periods.filter(
      (p) =>
        !(
          p.workerId === attendanceWorker.id && p.periodLabel === selectedPeriod
        ),
    );
    updated.push(newPeriod);
    persistPeriods(updated);
    toast.success(
      `Attendance saved & locked. Net: ₹${netPayable.toLocaleString("en-IN")}`,
    );
  }

  function handleDeletePeriod(period: WorkerPeriod) {
    persistPeriods(periods.filter((p) => p.id !== period.id));
    toast.success("Period record deleted.");
    setDeletePeriod(null);
    // Refresh attendance view
    if (selectedPeriod === period.periodLabel && attendanceWorker) {
      const pDef = yearPeriods.find((p) => p.label === period.periodLabel)!;
      const dates = getDatesInRange(pDef.start, pDef.end);
      const defaultMap: Record<string, boolean> = {};
      for (const d of dates) {
        defaultMap[d] = !isSunday(d);
      }
      setAttendanceMap(defaultMap);
    }
  }

  const currentPeriodRecord =
    attendanceWorker && selectedPeriod
      ? periods.find(
          (p) =>
            p.workerId === attendanceWorker.id &&
            p.periodLabel === selectedPeriod,
        )
      : null;

  const pDef = selectedPeriod
    ? yearPeriods.find((p) => p.label === selectedPeriod)
    : null;
  const datesInPeriod = pDef ? getDatesInRange(pDef.start, pDef.end) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold">
              Daily Rated Workers
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage daily wage workers by institute & period
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterInstitute} onValueChange={setFilterInstitute}>
            <SelectTrigger className="w-40 h-9">
              <Building2 className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Institute" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Institutes</SelectItem>
              {institutes.map((i) => (
                <SelectItem key={i} value={i}>
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="gradient-primary gap-1 h-9"
            onClick={() => {
              setForm({ name: "", institute: "" });
              setEditWorker(null);
              setShowAddDialog(true);
            }}
          >
            <Plus className="w-4 h-4" /> Add Worker
          </Button>
        </div>
      </div>

      {/* Workers list */}
      {filteredWorkers.length === 0 ? (
        <Card className="card-glass">
          <CardContent className="p-10 text-center">
            <HardHat className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No workers found. Add a daily rated worker to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((worker) => {
            const cfg = STATUS_CONFIG[worker.status];
            const workerPeriods = periods.filter(
              (p) => p.workerId === worker.id,
            );
            const totalPaid = workerPeriods.reduce(
              (sum, p) => sum + p.netPayable,
              0,
            );
            return (
              <Card
                key={worker.id}
                className="card-glass hover:border-primary/30 transition-colors"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <HardHat className="w-4 h-4 text-primary" />
                        {worker.name}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Building2 className="w-3 h-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {worker.institute}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`text-xs border ${cfg.color} flex items-center gap-1`}
                    >
                      {cfg.icon} {cfg.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> Periods recorded
                    </span>
                    <span className="font-semibold">
                      {workerPeriods.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <BadgeIndianRupee className="w-3 h-3" /> Total paid
                    </span>
                    <span className="font-bold text-primary">
                      ₹{totalPaid.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => openAttendance(worker)}
                    >
                      <CalendarDays className="w-3 h-3" /> Attendance
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        setEditWorker(worker);
                        setForm({
                          name: worker.name,
                          institute: worker.institute,
                        });
                        setShowAddDialog(true);
                      }}
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-blue-500/30 text-blue-400"
                      onClick={() =>
                        setStatusWorker({ worker, status: "transferred" })
                      }
                    >
                      <ArrowRightLeft className="w-3 h-3" /> Transfer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-amber-500/30 text-amber-400"
                      onClick={() =>
                        setStatusWorker({ worker, status: "resigned" })
                      }
                    >
                      <LogOut className="w-3 h-3" /> Resigned
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-orange-500/30 text-orange-400"
                      onClick={() =>
                        setStatusWorker({ worker, status: "removed" })
                      }
                    >
                      <UserMinus className="w-3 h-3" /> Removed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-red-500/30 text-red-400"
                      onClick={() => setDeleteWorker(worker)}
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Worker Dialog */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(o) => {
          if (!o) {
            setShowAddDialog(false);
            setEditWorker(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HardHat className="w-4 h-4 text-primary" />
              {editWorker ? "Edit Worker" : "Add Daily Worker"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Worker Name *</Label>
              <Input
                placeholder="Full name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Institute *</Label>
              <Select
                value={form.institute}
                onValueChange={(v) => setForm((f) => ({ ...f, institute: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select institute" />
                </SelectTrigger>
                <SelectContent>
                  {institutes.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditWorker(null);
                }}
              >
                Cancel
              </Button>
              <Button className="gradient-primary" onClick={handleAddWorker}>
                {editWorker ? "Update" : "Add Worker"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog
        open={!!statusWorker}
        onOpenChange={(o) => !o && setStatusWorker(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {statusWorker && STATUS_CONFIG[statusWorker.status].icon}
              Mark as {statusWorker && STATUS_CONFIG[statusWorker.status].label}
            </DialogTitle>
          </DialogHeader>
          {statusWorker?.status === "transferred" && (
            <div className="space-y-2">
              <Label>Transfer to Institute</Label>
              <Select value={transferTo} onValueChange={setTransferTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select institute" />
                </SelectTrigger>
                <SelectContent>
                  {institutes
                    .filter((i) => i !== statusWorker.worker.institute)
                    .map((i) => (
                      <SelectItem key={i} value={i}>
                        {i}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setStatusWorker(null)}>
              Cancel
            </Button>
            <Button
              className="gradient-primary"
              onClick={() =>
                statusWorker &&
                handleStatusChange(statusWorker.worker, statusWorker.status)
              }
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog
        open={!!attendanceWorker}
        onOpenChange={(o) => !o && setAttendanceWorker(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Attendance — {attendanceWorker?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Period + Rate selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Period (15-day)</Label>
                <Select
                  value={selectedPeriod}
                  onValueChange={handlePeriodSelect}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {yearPeriods.map((p) => {
                      const saved =
                        attendanceWorker &&
                        periods.find(
                          (pr) =>
                            pr.workerId === attendanceWorker.id &&
                            pr.periodLabel === p.label,
                        );
                      return (
                        <SelectItem key={p.label} value={p.label}>
                          {p.label} {saved?.locked ? "🔒" : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rate per Day (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 500"
                  value={ratePerDay}
                  onChange={(e) => setRatePerDay(e.target.value)}
                  disabled={currentPeriodRecord?.locked}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Attendance grid */}
            {selectedPeriod && datesInPeriod.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Weekday = default present (check to mark absent) | Sunday =
                    default absent (check to mark on duty)
                  </p>
                  {currentPeriodRecord?.locked && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {datesInPeriod.map((date) => {
                    const isPresent = attendanceMap[date];
                    const sunday = isSunday(date);
                    const locked = !!currentPeriodRecord?.locked;
                    return (
                      <div
                        key={date}
                        className={`rounded-lg border p-2 flex items-center gap-2 transition-colors ${
                          sunday
                            ? isPresent
                              ? "border-blue-500/40 bg-blue-500/10"
                              : "border-border/30 bg-card/40"
                            : isPresent
                              ? "border-green-500/40 bg-green-500/10"
                              : "border-red-500/40 bg-red-500/10"
                        }`}
                      >
                        <Checkbox
                          checked={sunday ? isPresent : !isPresent}
                          onCheckedChange={() => !locked && toggleDate(date)}
                          disabled={locked}
                          className="flex-shrink-0"
                        />
                        <div>
                          <p className="text-xs font-medium">
                            {formatDate(date)}
                          </p>
                          <p
                            className={`text-[10px] ${
                              sunday
                                ? isPresent
                                  ? "text-blue-400"
                                  : "text-muted-foreground"
                                : isPresent
                                  ? "text-green-400"
                                  : "text-red-400"
                            }`}
                          >
                            {sunday
                              ? isPresent
                                ? "On Duty"
                                : "Sunday"
                              : isPresent
                                ? "Present"
                                : "Absent"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-4 h-4 text-green-400" /> Present:{" "}
                      <strong>{getPresentDays()}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <UserX className="w-4 h-4 text-red-400" /> Absent:{" "}
                      <strong>{datesInPeriod.length - getPresentDays()}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-primary">
                    <BadgeIndianRupee className="w-4 h-4" />
                    Net Payable: ₹{getNetPayable().toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  {currentPeriodRecord?.locked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={() => setDeletePeriod(currentPeriodRecord)}
                    >
                      <Unlock className="w-3.5 h-3.5" /> Delete & Unlock
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="gradient-primary gap-1"
                      onClick={handleSavePeriod}
                    >
                      <Save className="w-3.5 h-3.5" /> Save & Lock
                    </Button>
                  )}
                </div>
              </>
            )}

            {/* Past periods summary */}
            {attendanceWorker && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Saved Periods
                </p>
                <div className="space-y-1">
                  {periods.filter((p) => p.workerId === attendanceWorker.id)
                    .length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No saved periods yet.
                    </p>
                  ) : (
                    periods
                      .filter((p) => p.workerId === attendanceWorker.id)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-xs rounded-lg bg-card/40 border border-border/30 px-3 py-2"
                        >
                          <span className="font-medium">{p.periodLabel}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground">
                              {p.presentDays} days
                            </span>
                            <span className="font-bold text-primary">
                              ₹{p.netPayable.toLocaleString("en-IN")}
                            </span>
                            <Lock className="w-3 h-3 text-green-400" />
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Worker Confirm */}
      <AlertDialog
        open={!!deleteWorker}
        onOpenChange={(o) => !o && setDeleteWorker(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-400" /> Delete Worker?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteWorker?.name}</strong>{" "}
              and all their period records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteWorker && handleDeleteWorker(deleteWorker)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Period Confirm */}
      <AlertDialog
        open={!!deleteperiod}
        onOpenChange={(o) => !o && setDeletePeriod(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Unlock className="w-4 h-4 text-amber-400" /> Delete & Unlock
              Period?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the locked attendance record for{" "}
              <strong>{deleteperiod?.periodLabel}</strong> and allow re-entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-500 hover:bg-amber-600"
              onClick={() => deleteperiod && handleDeletePeriod(deleteperiod)}
            >
              Delete & Unlock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
