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
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  Lock,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Unlock,
  UserCheck,
  UserMinus,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { localGetAllInstitutes } from "../hooks/localStore";

type WorkerStatus = "active" | "transferred" | "resigned" | "removed";

type ContractWorker = {
  id: string;
  name: string;
  institute: string;
  status: WorkerStatus;
  transferredTo?: string;
};

type MonthRecord = {
  id: string;
  workerId: string;
  monthLabel: string;
  monthNum: number;
  year: number;
  startDate: string;
  endDate: string;
  ratePerDay: number;
  attendance: Record<string, boolean>;
  presentDays: number;
  netPayable: number;
  locked: boolean;
};

const MONTHS_SHORT = [
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

function getWorkers(): ContractWorker[] {
  try {
    return JSON.parse(localStorage.getItem("contractWorkers") || "[]");
  } catch {
    return [];
  }
}
function saveWorkers(data: ContractWorker[]) {
  localStorage.setItem("contractWorkers", JSON.stringify(data));
}
function getRecords(): MonthRecord[] {
  try {
    return JSON.parse(localStorage.getItem("contractWorkerPeriods") || "[]");
  } catch {
    return [];
  }
}
function saveRecords(data: MonthRecord[]) {
  localStorage.setItem("contractWorkerPeriods", JSON.stringify(data));
}
function getInstitutes(): string[] {
  return localGetAllInstitutes().map((i) => i.name);
}
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getPeriodDates(monthNum: number, year: number): string[] {
  const prevMonthNum = monthNum === 1 ? 12 : monthNum - 1;
  const prevYear = monthNum === 1 ? year - 1 : year;
  const dates: string[] = [];
  const daysInPrev = new Date(prevYear, prevMonthNum, 0).getDate();
  for (let d = 25; d <= daysInPrev; d++) {
    dates.push(
      `${prevYear}-${String(prevMonthNum).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    );
  }
  for (let d = 1; d <= 24; d++) {
    dates.push(
      `${year}-${String(monthNum).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    );
  }
  return dates;
}

function isSunday(dateStr: string) {
  return new Date(dateStr).getDay() === 0;
}

function fmtDate(d: string) {
  const dt = new Date(d);
  const day = dt.getDate();
  const month = MONTHS_SHORT[dt.getMonth()];
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    dt.getDay()
  ];
  return `${weekday}, ${day} ${month}`;
}

function getMonthList(
  selectedSession?: string,
): { label: string; month: number; year: number }[] {
  const list: { label: string; month: number; year: number }[] = [];
  const now = new Date();
  const curMonth = now.getMonth() + 1;
  const curYear = now.getFullYear();
  const currentSession =
    curMonth >= 4
      ? `${curYear}-${String(curYear + 1).slice(2)}`
      : `${curYear - 1}-${String(curYear).slice(2)}`;
  const isCurrentSession =
    !selectedSession || selectedSession === currentSession;

  if (isCurrentSession) {
    const sessionStartYear = curMonth >= 4 ? curYear : curYear - 1;
    let y = curYear;
    let m = curMonth;
    while (y > sessionStartYear || (y === sessionStartYear && m >= 4)) {
      list.push({ label: MONTHS_SHORT[m - 1], month: m, year: y });
      m--;
      if (m === 0) {
        m = 12;
        y--;
      }
    }
  } else {
    const startYear = Number.parseInt(
      (selectedSession || currentSession).split("-")[0],
      10,
    );
    // Apr-Dec of startYear
    for (let m = 12; m >= 4; m--)
      list.push({ label: MONTHS_SHORT[m - 1], month: m, year: startYear });
    // Jan-Mar of startYear+1
    for (let m = 3; m >= 1; m--)
      list.push({ label: MONTHS_SHORT[m - 1], month: m, year: startYear + 1 });
  }
  return list;
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

export default function ContractWorkersPage() {
  const now = new Date();
  const [workers, setWorkers] = useState<ContractWorker[]>(getWorkers);
  const [records, setRecords] = useState<MonthRecord[]>(getRecords);
  const [filterInstitute, setFilterInstitute] = useState("all");
  const [filterWorker, setFilterWorker] = useState("all");
  const [selectedMonthLabel, setSelectedMonthLabel] = useState(() => {
    return MONTHS_SHORT[now.getMonth()];
  });
  const [selectedSession, setSelectedSession] = useState(() => {
    const m = now.getMonth() + 1;
    const y = now.getFullYear();
    return m >= 4
      ? `${y}-${String(y + 1).slice(-2)}`
      : `${y - 1}-${String(y).slice(-2)}`;
  });
  const [contractWorkerRate] = useState(() =>
    Number(localStorage.getItem("contractWorkerRate") || "500"),
  );
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editWorker, setEditWorker] = useState<ContractWorker | null>(null);
  const [statusWorker, setStatusWorker] = useState<{
    worker: ContractWorker;
    status: WorkerStatus;
  } | null>(null);
  const [deleteWorker, setDeleteWorker] = useState<ContractWorker | null>(null);
  const [attendanceWorker, setAttendanceWorker] =
    useState<ContractWorker | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>(
    {},
  );
  const [deleteRecord, setDeleteRecord] = useState<MonthRecord | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [form, setForm] = useState({ name: "", institute: "" });
  const [transferTo, setTransferTo] = useState("");

  const institutes = getInstitutes();
  const monthList = getMonthList(selectedSession);

  const selMonthObj =
    monthList.find((m) => m.label === selectedMonthLabel) ?? monthList[0];
  const selMonth = selMonthObj?.month ?? now.getMonth() + 1;
  const selYear = selMonthObj?.year ?? now.getFullYear();

  const periodDates = getPeriodDates(selMonth, selYear);

  const filteredWorkers = workers
    .filter((w) => filterInstitute === "all" || w.institute === filterInstitute)
    .filter((w) => filterWorker === "all" || w.id === filterWorker);

  function persist(updated: ContractWorker[]) {
    setWorkers(updated);
    saveWorkers(updated);
  }
  function persistRecords(updated: MonthRecord[]) {
    setRecords(updated);
    saveRecords(updated);
  }

  function handleAddWorker() {
    if (!form.name.trim() || !form.institute) {
      toast.error("Name and institute are required.");
      return;
    }
    if (editWorker) {
      persist(
        workers.map((w) =>
          w.id === editWorker.id
            ? { ...w, name: form.name.trim(), institute: form.institute }
            : w,
        ),
      );
      toast.success("Worker updated.");
    } else {
      persist([
        ...workers,
        {
          id: generateId(),
          name: form.name.trim(),
          institute: form.institute,
          status: "active",
        },
      ]);
      toast.success("Worker added.");
    }
    setForm({ name: "", institute: "" });
    setEditWorker(null);
    setShowAddDialog(false);
  }

  function handleStatusChange(worker: ContractWorker, status: WorkerStatus) {
    if (status === "transferred" && !transferTo) {
      toast.error("Select destination institute.");
      return;
    }
    persist(
      workers.map((w) =>
        w.id === worker.id
          ? {
              ...w,
              status,
              institute: status === "transferred" ? transferTo : w.institute,
              transferredTo: status === "transferred" ? transferTo : undefined,
            }
          : w,
      ),
    );
    toast.success(`Worker marked as ${status}.`);
    setStatusWorker(null);
    setTransferTo("");
  }

  function handleDeleteWorker(worker: ContractWorker) {
    persist(workers.filter((w) => w.id !== worker.id));
    persistRecords(records.filter((r) => r.workerId !== worker.id));
    toast.success("Worker deleted.");
    setDeleteWorker(null);
  }

  function openAttendance(worker: ContractWorker) {
    setAttendanceWorker(worker);
    const existing = records.find(
      (r) => r.workerId === worker.id && r.monthLabel === selectedMonthLabel,
    );
    if (existing) {
      setAttendanceMap(existing.attendance);
    } else {
      const defaultMap: Record<string, boolean> = {};
      for (const d of periodDates) {
        defaultMap[d] = !isSunday(d);
      }
      setAttendanceMap(defaultMap);
    }
  }

  function toggleDate(date: string) {
    const existing = records.find(
      (r) =>
        r.workerId === attendanceWorker?.id &&
        r.monthLabel === selectedMonthLabel,
    );
    if (existing?.locked) {
      toast.error("Record is locked. Delete to edit.");
      return;
    }
    setAttendanceMap((prev) => ({ ...prev, [date]: !prev[date] }));
  }

  function getPresentDays() {
    return Object.values(attendanceMap).filter(Boolean).length;
  }
  function getNetPayable() {
    return getPresentDays() * contractWorkerRate;
  }

  function handleSaveRecord() {
    if (!attendanceWorker) return;
    const existing = records.find(
      (r) =>
        r.workerId === attendanceWorker.id &&
        r.monthLabel === selectedMonthLabel,
    );
    if (existing?.locked) {
      toast.error("Already locked.");
      return;
    }
    const newRecord: MonthRecord = {
      id: existing?.id || generateId(),
      workerId: attendanceWorker.id,
      monthLabel: selectedMonthLabel,
      monthNum: selMonth,
      year: selYear,
      startDate: periodDates[0],
      endDate: periodDates[periodDates.length - 1],
      ratePerDay: contractWorkerRate,
      attendance: { ...attendanceMap },
      presentDays: getPresentDays(),
      netPayable: getNetPayable(),
      locked: true,
    };
    const updated = records.filter(
      (r) =>
        !(
          r.workerId === attendanceWorker.id &&
          r.monthLabel === selectedMonthLabel
        ),
    );
    persistRecords([...updated, newRecord]);
    toast.success("Attendance saved & locked.");
  }

  function handleDeleteRecord(rec: MonthRecord) {
    persistRecords(records.filter((r) => r.id !== rec.id));
    toast.success("Record deleted & unlocked.");
    setDeleteRecord(null);
    if (attendanceWorker) {
      const defaultMap: Record<string, boolean> = {};
      for (const d of periodDates) {
        defaultMap[d] = !isSunday(d);
      }
      setAttendanceMap(defaultMap);
    }
  }

  const currentRecord = attendanceWorker
    ? records.find(
        (r) =>
          r.workerId === attendanceWorker.id &&
          r.monthLabel === selectedMonthLabel,
      )
    : null;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gradient">
              Contract Workers
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage contract workers by institute &amp; month (25th–24th)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterInstitute} onValueChange={setFilterInstitute}>
            <SelectTrigger className="w-40 h-9">
              <Building2 className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Institute" />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
              <SelectItem value="all">All Institutes</SelectItem>
              {institutes.map((i) => (
                <SelectItem key={i} value={i}>
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterWorker} onValueChange={setFilterWorker}>
            <SelectTrigger className="w-40 h-9">
              <Briefcase className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All Workers" />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
              <SelectItem value="all">All Workers</SelectItem>
              {workers
                .filter(
                  (w) =>
                    filterInstitute === "all" ||
                    w.institute === filterInstitute,
                )
                .map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedMonthLabel}
            onValueChange={setSelectedMonthLabel}
          >
            <SelectTrigger className="w-36 h-9">
              <CalendarDays className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
              {monthList.map((m) => (
                <SelectItem key={m.label} value={m.label}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="w-32 h-9">
              <GraduationCap className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
              {(() => {
                const sessions: string[] = [];
                const nm = now.getMonth() + 1;
                const ny = now.getFullYear();
                const endYear = nm >= 4 ? ny : ny - 1;
                for (let sy = endYear; sy >= 2004; sy--) {
                  sessions.push(`${sy}-${String(sy + 1).slice(-2)}`);
                }
                return sessions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ));
              })()}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="gradient-primary gap-1 h-9"
            data-ocid="contract.open_modal_button"
            disabled={institutes.length === 0}
            title={
              institutes.length === 0 ? "Please add an institute first" : ""
            }
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
        <Card className="card-glass" data-ocid="contract.empty_state">
          <CardContent className="p-10 text-center">
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No contract workers found. Add a worker to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((worker, idx) => {
            const cfg = STATUS_CONFIG[worker.status];
            const workerRecs = records.filter((r) => r.workerId === worker.id);
            const totalPaid = workerRecs.reduce(
              (sum, r) => sum + r.netPayable,
              0,
            );
            return (
              <Card
                key={worker.id}
                className="card-glass hover:border-primary/30 transition-colors"
                data-ocid={`contract.item.${idx + 1}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" />
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
                      <CalendarDays className="w-3 h-3" /> Months recorded
                    </span>
                    <span className="font-semibold">{workerRecs.length}</span>
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
                      className="h-7 text-xs gap-1 border-purple-500/30 text-purple-400"
                      onClick={() =>
                        setStatusWorker({ worker, status: "removed" })
                      }
                    >
                      <UserMinus className="w-3 h-3" /> Remove
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs gap-1"
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

      {/* Floating Attendance Report button */}
      <div className="fixed bottom-6 right-6 z-10">
        <Button
          className="gradient-primary gap-2 shadow-lg"
          data-ocid="contract.open_modal_button"
          onClick={() => setShowReport(true)}
        >
          <FileText className="w-4 h-4" /> Attendance Report
        </Button>
      </div>

      {/* Add/Edit Worker Dialog */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(o) => !o && setShowAddDialog(false)}
      >
        <DialogContent data-ocid="contract.dialog">
          <DialogHeader>
            <DialogTitle>
              {editWorker ? "Edit Worker" : "Add Contract Worker"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                data-ocid="contract.input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Worker name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Institute</Label>
              <Select
                value={form.institute}
                onValueChange={(v) => setForm((f) => ({ ...f, institute: v }))}
              >
                <SelectTrigger className="mt-1" data-ocid="contract.select">
                  <SelectValue placeholder="Select institute" />
                </SelectTrigger>
                <SelectContent className="max-h-[250px] overflow-y-auto">
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
                data-ocid="contract.cancel_button"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="gradient-primary"
                data-ocid="contract.submit_button"
                onClick={handleAddWorker}
              >
                {editWorker ? "Update" : "Add"}
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
        <DialogContent data-ocid="contract.dialog">
          <DialogHeader>
            <DialogTitle>Change Worker Status</DialogTitle>
          </DialogHeader>
          {statusWorker && (
            <div className="space-y-3">
              <p className="text-sm">
                Mark <strong>{statusWorker.worker.name}</strong> as{" "}
                <strong>{statusWorker.status}</strong>?
              </p>
              {statusWorker.status === "transferred" && (
                <div>
                  <Label>Transfer to Institute</Label>
                  <Select value={transferTo} onValueChange={setTransferTo}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select institute" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px] overflow-y-auto">
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
                <Button
                  variant="outline"
                  data-ocid="contract.cancel_button"
                  onClick={() => setStatusWorker(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="gradient-primary"
                  data-ocid="contract.confirm_button"
                  onClick={() =>
                    statusWorker &&
                    handleStatusChange(statusWorker.worker, statusWorker.status)
                  }
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog
        open={!!attendanceWorker}
        onOpenChange={(o) => !o && setAttendanceWorker(null)}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="contract.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Attendance — {attendanceWorker?.name} ({selectedMonthLabel})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  25 {MONTHS_SHORT[selMonth === 1 ? 11 : selMonth - 2]} – 24{" "}
                  {MONTHS_SHORT[selMonth - 1]} {selYear}
                </span>
              </div>
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                Rate: <strong>₹{contractWorkerRate}/day</strong>
              </span>
            </div>

            {currentRecord?.locked && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                <Lock className="w-3 h-3 mr-1" /> Locked
              </Badge>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Weekday = default present | Sunday = default absent
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {periodDates.map((date) => {
                const isPresent = attendanceMap[date];
                const sunday = isSunday(date);
                const locked = !!currentRecord?.locked;
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
                      checked={!!isPresent}
                      onCheckedChange={() => !locked && toggleDate(date)}
                      disabled={locked}
                      className="flex-shrink-0"
                    />
                    <div>
                      <p className="text-xs font-medium">{fmtDate(date)}</p>
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

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-4 h-4 text-green-400" /> Present:{" "}
                  <strong>{getPresentDays()}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <UserX className="w-4 h-4 text-red-400" /> Absent:{" "}
                  <strong>{periodDates.length - getPresentDays()}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1 font-bold text-primary">
                <BadgeIndianRupee className="w-4 h-4" /> Net Payable: ₹
                {getNetPayable().toLocaleString("en-IN")}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => {
                  setForm({ name: "", institute: "" });
                  setEditWorker(null);
                }}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </Button>
              {currentRecord?.locked ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => setDeleteRecord(currentRecord)}
                >
                  <Unlock className="w-3.5 h-3.5" /> Delete &amp; Unlock
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="gradient-primary gap-1"
                  data-ocid="contract.save_button"
                  onClick={handleSaveRecord}
                >
                  <Save className="w-3.5 h-3.5" /> Save &amp; Lock
                </Button>
              )}
            </div>

            {attendanceWorker && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Saved Months
                </p>
                <div className="space-y-1">
                  {records.filter((r) => r.workerId === attendanceWorker.id)
                    .length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No saved records yet.
                    </p>
                  ) : (
                    records
                      .filter((r) => r.workerId === attendanceWorker.id)
                      .map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between text-xs rounded-lg bg-card/40 border border-border/30 px-3 py-2"
                        >
                          <span className="font-medium">{r.monthLabel}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground">
                              {r.presentDays} days
                            </span>
                            <span className="font-bold text-primary">
                              ₹{r.netPayable.toLocaleString("en-IN")}
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

      {/* Attendance Report Dialog */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-lg" data-ocid="contract.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Attendance Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Month: <strong>{selectedMonthLabel}</strong>
              {filterInstitute !== "all" && ` · ${filterInstitute}`}
              {filterWorker !== "all" &&
                ` · ${workers.find((w) => w.id === filterWorker)?.name}`}
            </p>

            <div className="max-h-64 overflow-y-auto rounded-lg border border-border/40">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left">Worker</th>
                    <th className="px-3 py-2 text-left">Institute</th>
                    <th className="px-3 py-2 text-left">Month</th>
                    <th className="px-3 py-2 text-right">Days</th>
                    <th className="px-3 py-2 text-right">Net Payable</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const recs = records.filter((r) => {
                      const w = workers.find((x) => x.id === r.workerId);
                      if (!w) return false;
                      if (
                        filterInstitute !== "all" &&
                        w.institute !== filterInstitute
                      )
                        return false;
                      if (filterWorker !== "all" && r.workerId !== filterWorker)
                        return false;
                      if (r.monthLabel !== selectedMonthLabel) return false;
                      return true;
                    });
                    return recs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-3 py-4 text-center text-muted-foreground"
                        >
                          No records found
                        </td>
                      </tr>
                    ) : (
                      recs.map((r) => {
                        const w = workers.find((x) => x.id === r.workerId);
                        return (
                          <tr key={r.id} className="border-t border-border/20">
                            <td className="px-3 py-2">{w?.name}</td>
                            <td className="px-3 py-2">{w?.institute}</td>
                            <td className="px-3 py-2">{r.monthLabel}</td>
                            <td className="px-3 py-2 text-right">
                              {r.presentDays}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold">
                              ₹{r.netPayable.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        );
                      })
                    );
                  })()}
                </tbody>
              </table>
            </div>
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
              and all their records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="contract.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="contract.delete_button"
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteWorker && handleDeleteWorker(deleteWorker)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Record Confirm */}
      <AlertDialog
        open={!!deleteRecord}
        onOpenChange={(o) => !o && setDeleteRecord(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Unlock className="w-4 h-4 text-amber-400" /> Delete &amp; Unlock?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Delete attendance record for{" "}
              <strong>{deleteRecord?.monthLabel}</strong> and allow re-entry?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="contract.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="contract.confirm_button"
              className="bg-amber-500 hover:bg-amber-600"
              onClick={() => deleteRecord && handleDeleteRecord(deleteRecord)}
            >
              Delete &amp; Unlock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
