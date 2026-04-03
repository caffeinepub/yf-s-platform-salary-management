import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Lock,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useDeleteAttendance,
  useGetAllEmployees,
  useGetAllInstitutes,
  useGetAttendance,
  useGetEmployeesForInstitute,
  useSaveAttendance,
} from "../hooks/useQueries";
import {
  getCurrentSession,
  getSessionList,
  getYearFromSession,
} from "../utils/sessionUtils";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const SHORT_MONTH = [
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

function getSessionMonths(
  selectedSession?: string,
): { value: string; label: string }[] {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentSession = getCurrentSession();
  const isCurrentSession =
    !selectedSession || selectedSession === currentSession;
  const months: { value: string; label: string }[] = [];
  if (isCurrentSession) {
    if (currentMonth >= 4) {
      for (let m = 4; m <= currentMonth; m++)
        months.push({ value: String(m), label: SHORT_MONTH[m - 1] });
    } else {
      for (let m = 4; m <= 12; m++)
        months.push({ value: String(m), label: SHORT_MONTH[m - 1] });
      for (let m = 1; m <= currentMonth; m++)
        months.push({ value: String(m), label: SHORT_MONTH[m - 1] });
    }
  } else {
    // Past session: show all 12 months Apr-Mar
    for (let m = 4; m <= 12; m++)
      months.push({ value: String(m), label: MONTH_NAMES[m - 1] });
    for (let m = 1; m <= 3; m++)
      months.push({ value: String(m), label: MONTH_NAMES[m - 1] });
  }
  return months.reverse();
}

type DayStatus = "present" | "absent" | "halfday" | "holiday";
type LeaveType = "LWP" | "CL" | "EL" | "HPL" | "ML" | "PH";

interface DayData {
  status: DayStatus;
  leaveType?: LeaveType;
}

interface PeriodDay {
  key: string;
  date: number;
  month: number;
  year: number;
  isPrevMonth: boolean;
  isSunday: boolean;
  dayName: string;
}

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function getPeriodDays(month: number, year: number): PeriodDay[] {
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const daysInPrev = getDaysInMonth(prevMonth, prevYear);
  const result: PeriodDay[] = [];
  for (let d = 25; d <= daysInPrev; d++) {
    const dow = new Date(prevYear, prevMonth - 1, d).getDay();
    result.push({
      key: `prev_${d}`,
      date: d,
      month: prevMonth,
      year: prevYear,
      isPrevMonth: true,
      isSunday: dow === 0,
      dayName: DOW[dow],
    });
  }
  for (let d = 1; d <= 24; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    result.push({
      key: String(d),
      date: d,
      month,
      year,
      isPrevMonth: false,
      isSunday: dow === 0,
      dayName: DOW[dow],
    });
  }
  return result;
}

function buildDefaultStatuses(
  month: number,
  year: number,
): Record<string, DayData> {
  const days = getPeriodDays(month, year);
  const result: Record<string, DayData> = {};
  for (const day of days) {
    result[day.key] = { status: "present" };
  }
  return result;
}

function parseDayEntry(entry: string): { key: string; data: DayData } {
  const parts = entry.split(":");
  const key = parts[0];
  const status = (parts[1] as DayStatus) || "present";
  const leaveType = parts[2] as LeaveType | undefined;
  return { key, data: { status, leaveType } };
}

const LEAVE_COLORS: Record<string, string> = {
  present: "bg-green-500/80 text-white border-green-400",
  halfday: "bg-yellow-400/80 text-black border-yellow-400",
  holiday_PH: "bg-slate-500/80 text-white border-slate-400",
  absent_LWP: "bg-red-600/80 text-white border-red-500",
  absent_CL: "bg-orange-500/80 text-white border-orange-400",
  absent_EL: "bg-blue-500/80 text-white border-blue-400",
  absent_HPL: "bg-purple-500/80 text-white border-purple-400",
  absent_ML: "bg-pink-500/80 text-white border-pink-400",
  default: "bg-card border-border",
};

function getDayColor(data: DayData): string {
  if (data.status === "present") return LEAVE_COLORS.present;
  if (data.status === "halfday") return LEAVE_COLORS.halfday;
  if (data.status === "holiday") return LEAVE_COLORS.holiday_PH;
  if (data.status === "absent" && data.leaveType) {
    return LEAVE_COLORS[`absent_${data.leaveType}`] ?? LEAVE_COLORS.absent_LWP;
  }
  return LEAVE_COLORS.absent_LWP;
}

function getDayLabel(data: DayData): string {
  if (data.status === "present") return "P";
  if (data.status === "halfday") return "½";
  if (data.status === "holiday") return "PH";
  return data.leaveType ?? "LWP";
}

function getLatestMonthForSession(session: string): number {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentY = now.getFullYear();
  const currentSession =
    currentMonth >= 4
      ? `${currentY}-${String(currentY + 1).slice(2)}`
      : `${currentY - 1}-${String(currentY).slice(2)}`;
  if (session === currentSession) return currentMonth;
  return 3; // Past session - latest is March
}

export default function AttendancePage() {
  const now = new Date();
  const [instituteId, setInstituteId] = useState<string>("all");
  const [employeeSelection, setEmployeeSelection] = useState<bigint | "all">(
    "all",
  );
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [session, setSession] = useState(getCurrentSession());
  const sessionList = getSessionList();
  const [dayStatuses, setDayStatuses] = useState<Record<string, DayData>>({});

  const derivedYearForPast = (() => {
    const sessionStart = Number.parseInt(session.split("-")[0]);
    if (month >= 4) return sessionStart;
    return sessionStart + 1;
  })();
  const isPastPeriod = (() => {
    const curM = now.getMonth() + 1;
    const curY = now.getFullYear();
    const selY = derivedYearForPast;
    return selY < curY || (selY === curY && month < curM);
  })();
  const [dialogDay, setDialogDay] = useState<string | null>(null);

  const { data: institutes = [] } = useGetAllInstitutes();
  const { data: allEmployeesData = [] } = useGetAllEmployees();
  const { data: instEmployeesData = [] } = useGetEmployeesForInstitute(
    instituteId !== "all" ? BigInt(instituteId) : null,
  );
  const employees =
    instituteId === "all" ? allEmployeesData : instEmployeesData;

  const specificEmployeeId =
    employeeSelection !== "all" ? employeeSelection : null;

  const derivedYear = getYearFromSession(session, month);

  const { data: attendance } = useGetAttendance(
    specificEmployeeId,
    month,
    derivedYear,
  );
  const saveAttendance = useSaveAttendance();
  const deleteAttendance = useDeleteAttendance();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isLocked = attendance?.isLocked ?? false;

  const year = derivedYear;
  const periodDays = getPeriodDays(month, year);
  const prevMonthNum = month === 1 ? 12 : month - 1;
  const periodTitle = `Period: 25 ${SHORT_MONTH[prevMonthNum - 1]} – 24 ${SHORT_MONTH[month - 1]} ${year}`;

  useEffect(() => {
    if (specificEmployeeId !== null) {
      setDayStatuses(buildDefaultStatuses(month, year));
    }
  }, [specificEmployeeId, month, year]);

  function getDayData(key: string): DayData {
    if (attendance && attendance.days.length > 0) {
      const found = attendance.days.find((d) => d.startsWith(`${key}:`));
      if (found) {
        const { data } = parseDayEntry(found);
        return data;
      }
      return buildDefaultStatuses(month, year)[key] ?? { status: "present" };
    }
    return dayStatuses[key] ?? { status: "present" };
  }

  function handleDayClick(key: string) {
    if (isLocked) return;
    const current = getDayData(key);
    if (current.status === "absent" || current.status === "holiday") {
      setDayStatuses((prev) => ({ ...prev, [key]: { status: "present" } }));
    } else {
      setDialogDay(key);
    }
  }

  function applyLeaveChoice(key: string, choice: DayData) {
    setDayStatuses((prev) => ({ ...prev, [key]: choice }));
    setDialogDay(null);
  }

  function buildDaysArray(): string[] {
    const result: string[] = [];
    for (const [key, data] of Object.entries(dayStatuses)) {
      if (data.leaveType) {
        result.push(`${key}:${data.status}:${data.leaveType}`);
      } else {
        result.push(`${key}:${data.status}`);
      }
    }
    return result;
  }

  function countByType(type: string): number {
    return periodDays.filter((d) => {
      const data = getDayData(d.key);
      if (type === "present") return data.status === "present";
      if (type === "halfday") return data.status === "halfday";
      if (type === "PH") return data.status === "holiday";
      return data.status === "absent" && data.leaveType === type;
    }).length;
  }

  const handleSave = async () => {
    if (!specificEmployeeId) {
      toast.error("Select a specific employee to save attendance");
      return;
    }
    try {
      await saveAttendance.mutateAsync({
        employeeId: specificEmployeeId,
        month,
        year: derivedYear,
        days: buildDaysArray(),
      });
      toast.success("Attendance saved and locked");
    } catch {
      toast.error("Failed to save attendance");
    }
  };

  const handleClear = () => {
    if (!specificEmployeeId || isLocked) return;
    setDayStatuses(buildDefaultStatuses(month, year));
    toast.success("Attendance reset to defaults");
  };

  const showCalendar = specificEmployeeId !== null;
  const showEmployeeList = employeeSelection === "all";

  const summaryStats = [
    {
      label: "Present",
      key: "present",
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: "text-green-400",
    },
    {
      label: "Half Day",
      key: "halfday",
      icon: <Clock className="w-4 h-4" />,
      color: "text-yellow-400",
    },
    {
      label: "LWP",
      key: "LWP",
      icon: <XCircle className="w-4 h-4" />,
      color: "text-red-400",
    },
    {
      label: "CL",
      key: "CL",
      icon: <XCircle className="w-4 h-4" />,
      color: "text-orange-400",
    },
    {
      label: "EL",
      key: "EL",
      icon: <XCircle className="w-4 h-4" />,
      color: "text-blue-400",
    },
    {
      label: "HPL",
      key: "HPL",
      icon: <XCircle className="w-4 h-4" />,
      color: "text-purple-400",
    },
    {
      label: "Maternity",
      key: "ML",
      icon: <XCircle className="w-4 h-4" />,
      color: "text-pink-400",
    },
    {
      label: "Public Holiday",
      key: "PH",
      icon: <CalendarCheck className="w-4 h-4" />,
      color: "text-slate-400",
    },
  ];

  const dialogDayData = dialogDay ? getDayData(dialogDay) : null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
            <CalendarCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gradient">
              Attendance
            </h1>
            <p className="text-sm text-muted-foreground">
              Track monthly attendance for employees
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={instituteId}
            onValueChange={(v) => {
              setInstituteId(v);
              setEmployeeSelection("all");
            }}
          >
            <SelectTrigger className="w-40 h-9" data-ocid="attendance.select">
              <Building2 className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Institute" />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
              <SelectItem value="all">All Institutes</SelectItem>
              {institutes.map((inst) => (
                <SelectItem key={inst.id.toString()} value={inst.id.toString()}>
                  {(inst as any).shortCode || inst.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={
              employeeSelection === "all" ? "all" : employeeSelection.toString()
            }
            onValueChange={(v) => {
              if (v === "all") setEmployeeSelection("all");
              else setEmployeeSelection(BigInt(v));
            }}
          >
            <SelectTrigger className="w-40 h-9" data-ocid="attendance.select">
              <Users className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id.toString()} value={emp.id.toString()}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={month.toString()}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger className="w-32 h-9" data-ocid="attendance.select">
              <CalendarCheck className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
              {getSessionMonths(session).map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={session}
            onValueChange={(newSession) => {
              setSession(newSession);
              setMonth(getLatestMonthForSession(newSession));
            }}
          >
            <SelectTrigger className="w-28 h-9" data-ocid="attendance.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
              {sessionList.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {showCalendar && isPastPeriod && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0-6v.01M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z"
            />
          </svg>
          Previous period — view only. Attendance cannot be edited for past
          months.
        </div>
      )}
      {showCalendar && (
        <>
          {/* Summary cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2"
          >
            {summaryStats.map((stat) => (
              <Card key={stat.label} className="gradient-card border-border/40">
                <CardContent className="pt-3 pb-2 px-3">
                  <div
                    className={`flex items-center gap-1.5 ${stat.color} mb-0.5`}
                  >
                    {stat.icon}
                    <span className="text-[10px] font-medium">
                      {stat.label}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {countByType(stat.key)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Calendar grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="gradient-card border-border/40">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-display">
                  {periodTitle}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {isLocked && (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="w-3 h-3" />
                      Locked
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
                  {periodDays.map((day) => {
                    const data = getDayData(day.key);
                    const colorClass = getDayColor(data);
                    const label = getDayLabel(data);
                    return (
                      <button
                        type="button"
                        key={day.key}
                        onClick={() => handleDayClick(day.key)}
                        disabled={isLocked || isPastPeriod}
                        className={`relative rounded-lg border p-1.5 flex flex-col items-center transition-all duration-150 ${
                          colorClass
                        } ${
                          isLocked || isPastPeriod
                            ? "cursor-not-allowed opacity-80"
                            : "cursor-pointer hover:scale-105 hover:shadow-md"
                        }`}
                      >
                        <span className="text-[9px] font-semibold opacity-80 leading-none mb-0.5">
                          {day.dayName}
                        </span>
                        <span className="text-[9px] opacity-60 leading-none mb-0.5">
                          {SHORT_MONTH[day.month - 1]}
                        </span>
                        <span className="text-sm font-bold leading-none">
                          {day.date}
                        </span>
                        <span className="text-[9px] font-semibold mt-0.5 leading-none">
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
                  {[
                    { color: "bg-green-500", label: "Present" },
                    { color: "bg-yellow-400", label: "Half Day" },
                    { color: "bg-red-600", label: "LWP" },
                    { color: "bg-orange-500", label: "CL" },
                    { color: "bg-blue-500", label: "EL" },
                    { color: "bg-purple-500", label: "HPL" },
                    { color: "bg-pink-500", label: "ML" },
                    { color: "bg-slate-500", label: "PH" },
                  ].map((l) => (
                    <span key={l.label} className="flex items-center gap-1">
                      <span
                        className={`w-2.5 h-2.5 rounded-sm inline-block ${l.color}`}
                      />
                      {l.label}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex gap-3"
          >
            {isLocked ? (
              <>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleClear}
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setConfirmDelete(true)}
                  className="gap-2"
                  data-ocid="attendance.delete_button"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Attendance
                </Button>
                <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Attendance?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                      This will permanently delete the saved attendance record
                      for this employee and month. This cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setConfirmDelete(false)}
                        data-ocid="attendance.cancel_button"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        data-ocid="attendance.confirm_button"
                        onClick={async () => {
                          if (!specificEmployeeId) return;
                          try {
                            await deleteAttendance.mutateAsync({
                              employeeId: specificEmployeeId,
                              month,
                              year: derivedYear,
                            });
                            setDayStatuses(buildDefaultStatuses(month, year));
                            setConfirmDelete(false);
                            toast.error("Attendance deleted");
                          } catch {
                            toast.error("Failed to delete attendance");
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="gap-2"
                  data-ocid="attendance.clear_button"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saveAttendance.isPending}
                  className="gradient-primary text-white gap-2"
                  data-ocid="attendance.save_button"
                >
                  <Save className="w-4 h-4" />
                  {saveAttendance.isPending ? "Saving..." : "Save Attendance"}
                </Button>
              </>
            )}
          </motion.div>
        </>
      )}

      {showEmployeeList && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="gradient-card border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">
                Employees — {employees.length} found
              </CardTitle>
            </CardHeader>
            <CardContent>
              {employees.length === 0 ? (
                <div
                  className="text-center py-8 text-muted-foreground"
                  data-ocid="attendance.empty_state"
                >
                  No employees found for this institute
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40">
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                          Name
                        </th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                          Designation
                        </th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                          Type
                        </th>
                        <th className="py-2 px-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp, idx) => {
                        const extra = (() => {
                          try {
                            return JSON.parse(
                              localStorage.getItem(
                                `empExtra_${emp.employeeId}`,
                              ) ||
                                localStorage.getItem(
                                  `empExtra_${emp.id.toString()}`,
                                ) ||
                                "{}",
                            );
                          } catch {
                            return {};
                          }
                        })();
                        const designation =
                          extra.designation || emp.designation;
                        return (
                          <tr
                            key={emp.id.toString()}
                            className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                            data-ocid={`attendance.row.${idx + 1}`}
                          >
                            <td className="py-2 px-3 font-medium text-foreground">
                              {emp.name}
                            </td>
                            <td className="py-2 px-3 text-muted-foreground">
                              {designation}
                            </td>
                            <td className="py-2 px-3 text-muted-foreground capitalize">
                              {emp.employmentType}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => setEmployeeSelection(emp.id)}
                                data-ocid={`attendance.edit_button.${idx + 1}`}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Leave type selection dialog */}
      <Dialog
        open={dialogDay !== null}
        onOpenChange={(o) => !o && setDialogDay(null)}
      >
        <DialogContent className="sm:max-w-sm" data-ocid="attendance.dialog">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Mark attendance for{" "}
              {dialogDay
                ? dialogDay.startsWith("prev_")
                  ? `${dialogDay.replace("prev_", "")} ${SHORT_MONTH[prevMonthNum - 1]}`
                  : `${dialogDay} ${SHORT_MONTH[month - 1]}`
                : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 py-2">
            <Button
              variant="outline"
              className="justify-start gap-2 border-green-500/40 hover:bg-green-500/10 text-green-400"
              onClick={() =>
                dialogDay && applyLeaveChoice(dialogDay, { status: "present" })
              }
              data-ocid="attendance.confirm_button"
            >
              <CheckCircle2 className="w-4 h-4" /> Present
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 border-yellow-500/40 hover:bg-yellow-500/10 text-yellow-400"
              onClick={() =>
                dialogDay && applyLeaveChoice(dialogDay, { status: "halfday" })
              }
            >
              <Clock className="w-4 h-4" /> Half Day
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 border-red-500/40 hover:bg-red-500/10 text-red-400"
              onClick={() =>
                dialogDay &&
                applyLeaveChoice(dialogDay, {
                  status: "absent",
                  leaveType: "LWP",
                })
              }
            >
              <XCircle className="w-4 h-4" /> LWP
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 border-orange-500/40 hover:bg-orange-500/10 text-orange-400"
              onClick={() =>
                dialogDay &&
                applyLeaveChoice(dialogDay, {
                  status: "absent",
                  leaveType: "CL",
                })
              }
            >
              <XCircle className="w-4 h-4" /> Casual Leave (CL)
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 border-blue-500/40 hover:bg-blue-500/10 text-blue-400"
              onClick={() =>
                dialogDay &&
                applyLeaveChoice(dialogDay, {
                  status: "absent",
                  leaveType: "EL",
                })
              }
            >
              <XCircle className="w-4 h-4" /> Earned Leave (EL)
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 border-purple-500/40 hover:bg-purple-500/10 text-purple-400"
              onClick={() =>
                dialogDay &&
                applyLeaveChoice(dialogDay, {
                  status: "absent",
                  leaveType: "HPL",
                })
              }
            >
              <XCircle className="w-4 h-4" /> Half Pay Leave
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 border-pink-500/40 hover:bg-pink-500/10 text-pink-400"
              onClick={() =>
                dialogDay &&
                applyLeaveChoice(dialogDay, {
                  status: "absent",
                  leaveType: "ML",
                })
              }
            >
              <XCircle className="w-4 h-4" /> Maternity Leave
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 border-slate-500/40 hover:bg-slate-500/10 text-slate-400"
              onClick={() =>
                dialogDay &&
                applyLeaveChoice(dialogDay, {
                  status: "holiday",
                  leaveType: "PH",
                })
              }
            >
              <CalendarCheck className="w-4 h-4" /> Public Holiday
            </Button>
          </div>
          {dialogDayData &&
            (dialogDayData.status === "absent" ||
              dialogDayData.status === "holiday") && (
              <p className="text-xs text-muted-foreground text-center">
                Click day again to mark as Present
              </p>
            )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-1 text-xs"
            onClick={() => setDialogDay(null)}
            data-ocid="attendance.cancel_button"
          >
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
