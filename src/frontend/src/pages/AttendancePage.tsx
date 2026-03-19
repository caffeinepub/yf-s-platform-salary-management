import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Lock,
  Save,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useGetAllInstitutes,
  useGetAttendance,
  useGetEmployeesForInstitute,
  useLockAttendance,
  useSaveAttendance,
} from "../hooks/useQueries";

const MONTHS = [
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

const YEARS = Array.from({ length: 11 }, (_, i) => 2020 + i);

type DayStatus = "present" | "absent" | "halfday" | "holiday" | "none";

const STATUS_COLORS: Record<DayStatus, string> = {
  present: "bg-green-500/80 text-white border-green-400",
  absent: "bg-red-500/80 text-white border-red-400",
  halfday: "bg-yellow-500/80 text-black border-yellow-400",
  holiday: "bg-slate-500/80 text-white border-slate-400",
  none: "bg-card border-border hover:bg-muted/50",
};

const STATUS_CYCLE: DayStatus[] = [
  "present",
  "absent",
  "halfday",
  "holiday",
  "none",
];

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(month: number, year: number) {
  return new Date(year, month - 1, 1).getDay();
}

export default function AttendancePage() {
  const now = new Date();
  const [instituteId, setInstituteId] = useState<bigint | null>(null);
  const [employeeId, setEmployeeId] = useState<bigint | null>(null);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [dayStatuses, setDayStatuses] = useState<Record<number, DayStatus>>({});

  const { data: institutes = [] } = useGetAllInstitutes();
  const { data: employees = [] } = useGetEmployeesForInstitute(instituteId);
  const { data: attendance } = useGetAttendance(employeeId, month, year);
  const saveAttendance = useSaveAttendance();
  const lockAttendance = useLockAttendance();

  const isLocked = attendance?.isLocked ?? false;
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);

  const getStatus = (day: number): DayStatus => {
    if (attendance) {
      const found = attendance.days.find((d) => d.startsWith(`${day}:`));
      if (found) {
        const status = found.split(":")[1] as DayStatus;
        return status || "none";
      }
      return "none";
    }
    return dayStatuses[day] ?? "none";
  };

  const toggleDay = (day: number) => {
    if (isLocked) return;
    const current: DayStatus = dayStatuses[day] ?? "none";
    const nextIdx = (STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length;
    setDayStatuses((prev) => ({ ...prev, [day]: STATUS_CYCLE[nextIdx] }));
  };

  const buildDaysArray = () => {
    const result: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const s = dayStatuses[d] ?? "none";
      if (s !== "none") result.push(`${d}:${s}`);
    }
    return result;
  };

  const countStatus = (status: DayStatus) =>
    Object.values(dayStatuses).filter((s) => s === status).length;

  const handleSave = async () => {
    if (!employeeId) {
      toast.error("Select an employee");
      return;
    }
    try {
      await saveAttendance.mutateAsync({
        employeeId,
        month,
        year,
        days: buildDaysArray(),
      });
      toast.success("Attendance saved successfully");
    } catch {
      toast.error("Failed to save attendance");
    }
  };

  const handleLock = async () => {
    if (!employeeId) {
      toast.error("Select an employee");
      return;
    }
    try {
      await lockAttendance.mutateAsync({ employeeId, month, year });
      toast.success("Attendance locked");
    } catch {
      toast.error("Failed to lock attendance");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
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
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="gradient-card rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <Select
          value={instituteId?.toString() ?? ""}
          onValueChange={(v) => {
            setInstituteId(BigInt(v));
            setEmployeeId(null);
          }}
        >
          <SelectTrigger data-ocid="attendance.select">
            <SelectValue placeholder="Select Institute" />
          </SelectTrigger>
          <SelectContent>
            {institutes.map((inst) => (
              <SelectItem key={inst.id.toString()} value={inst.id.toString()}>
                {inst.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={employeeId?.toString() ?? ""}
          onValueChange={(v) => setEmployeeId(BigInt(v))}
          disabled={!instituteId}
        >
          <SelectTrigger data-ocid="attendance.select">
            <SelectValue placeholder="Select Employee" />
          </SelectTrigger>
          <SelectContent>
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
          <SelectTrigger data-ocid="attendance.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m} value={(MONTHS.indexOf(m) + 1).toString()}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={year.toString()}
          onValueChange={(v) => setYear(Number(v))}
        >
          <SelectTrigger data-ocid="attendance.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {employeeId && (
        <>
          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {[
              {
                label: "Present",
                value: countStatus("present"),
                icon: <CheckCircle2 className="w-4 h-4" />,
                color: "text-green-400",
              },
              {
                label: "Absent",
                value: countStatus("absent"),
                icon: <XCircle className="w-4 h-4" />,
                color: "text-red-400",
              },
              {
                label: "Half Day",
                value: countStatus("halfday"),
                icon: <Clock className="w-4 h-4" />,
                color: "text-yellow-400",
              },
              {
                label: "Holiday",
                value: countStatus("holiday"),
                icon: <CalendarCheck className="w-4 h-4" />,
                color: "text-slate-400",
              },
            ].map((stat) => (
              <Card key={stat.label} className="gradient-card border-border/40">
                <CardContent className="pt-4 pb-3">
                  <div className={`flex items-center gap-2 ${stat.color} mb-1`}>
                    {stat.icon}
                    <span className="text-xs font-medium">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Calendar Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="gradient-card border-border/40">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-display">
                  {MONTHS[month - 1]} {year}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {isLocked && (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="w-3 h-3" />
                      Locked
                    </Badge>
                  )}
                  <div className="flex gap-1.5 text-xs">
                    {(
                      ["present", "absent", "halfday", "holiday"] as DayStatus[]
                    ).map((s) => (
                      <span
                        key={s}
                        className={`px-2 py-0.5 rounded ${STATUS_COLORS[s]}`}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (d) => (
                      <div
                        key={d}
                        className="text-center text-xs text-muted-foreground py-1 font-medium"
                      >
                        {d}
                      </div>
                    ),
                  )}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }, (_, i) => `empty-${i}`).map(
                    (key) => (
                      <div key={key} />
                    ),
                  )}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                    (day) => {
                      const status = getStatus(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => toggleDay(day)}
                          disabled={isLocked}
                          className={`aspect-square rounded-lg border text-sm font-semibold transition-all duration-150 ${
                            STATUS_COLORS[status]
                          } ${isLocked ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:scale-105"}`}
                        >
                          {day}
                        </button>
                      );
                    },
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          {!isLocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex gap-3"
            >
              <Button
                onClick={handleSave}
                disabled={saveAttendance.isPending}
                className="gradient-primary text-white gap-2"
                data-ocid="attendance.save_button"
              >
                <Save className="w-4 h-4" />
                {saveAttendance.isPending ? "Saving..." : "Save Attendance"}
              </Button>
              <Button
                variant="outline"
                onClick={handleLock}
                disabled={lockAttendance.isPending}
                className="gap-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                data-ocid="attendance.primary_button"
              >
                <Lock className="w-4 h-4" />
                {lockAttendance.isPending ? "Locking..." : "Lock Attendance"}
              </Button>
            </motion.div>
          )}
        </>
      )}

      {!employeeId && (
        <div
          className="gradient-card rounded-xl p-12 text-center"
          data-ocid="attendance.empty_state"
        >
          <CalendarCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Select an institute and employee to view attendance
          </p>
        </div>
      )}
    </div>
  );
}
