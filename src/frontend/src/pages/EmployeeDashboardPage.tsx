import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  FileText,
  Star,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/dateUtils";

function getEmployees(): any[] {
  try {
    return JSON.parse(localStorage.getItem("sms_employees") || "[]");
  } catch {
    return [];
  }
}
function getSalaries(): any[] {
  try {
    return JSON.parse(localStorage.getItem("sms_salary") || "[]");
  } catch {
    return [];
  }
}
function getEmpExtra(employeeId: string): any {
  try {
    return JSON.parse(localStorage.getItem(`empExtra_${employeeId}`) || "{}");
  } catch {
    return {};
  }
}

const _MONTHS = [
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

export default function EmployeeDashboardPage() {
  const { employeeId, username } = useAuth();

  const employees = getEmployees();
  const emp = employees.find(
    (e: any) =>
      String(e.id) === String(employeeId) ||
      e.employeeId === employeeId ||
      e.employeeId === username,
  );
  const extra = emp ? getEmpExtra(emp.employeeId) : {};

  const salaries = getSalaries();
  const empSalaries = salaries.filter(
    (s: any) =>
      String(s.employeeId) === String(emp?.id) ||
      s.employeeId === emp?.employeeId,
  );
  const latestSalary = empSalaries.sort((a: any, b: any) => {
    const aVal = (a.year ?? 0) * 100 + (a.month ?? 0);
    const bVal = (b.year ?? 0) * 100 + (b.month ?? 0);
    return bVal - aVal;
  })[0];

  if (!emp) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">
            Employee profile not found
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  const infoCards = [
    {
      label: "Institute",
      value: extra.institute || emp.institute || "—",
      icon: Building2,
      color: "oklch(0.55 0.22 260)",
    },
    {
      label: "Department",
      value: extra.department || emp.department || "—",
      icon: Briefcase,
      color: "oklch(0.55 0.22 160)",
    },
    {
      label: "Designation",
      value: extra.designation || emp.designation || "—",
      icon: Star,
      color: "oklch(0.65 0.22 80)",
    },
    {
      label: "Employee Type",
      value: extra.employeeType || emp.employmentType || "—",
      icon: User,
      color: "oklch(0.55 0.22 290)",
    },
    {
      label: "Status",
      value: extra.employeeStatus || "Active",
      icon: TrendingUp,
      color: "oklch(0.55 0.20 145)",
    },
    {
      label: "Joining Date",
      value: formatDate(emp.joiningDate),
      icon: Calendar,
      color: "oklch(0.60 0.20 30)",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 relative overflow-hidden bg-primary/10 border border-primary/20"
        style={{}}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
          className="absolute right-0 top-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{
            background: "oklch(0.55 0.28 260)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div className="relative flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.50 0.25 260), oklch(0.45 0.28 295))",
            }}
          >
            {emp.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1
              className="text-2xl font-display font-bold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.90 0.10 260), oklch(0.80 0.20 295))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome back, {emp.name}!
            </h1>
            <p className="text-sm mt-1 text-muted-foreground">
              {extra.designation || emp.designation || "Employee"} &bull;{" "}
              {extra.department || emp.department || "—"}
            </p>
          </div>
          <Badge
            className="ml-auto flex-shrink-0 text-xs"
            style={{
              background: "oklch(0.50 0.20 145 / 0.25)",
              color: "oklch(0.75 0.18 145)",
              border: "1px solid oklch(0.50 0.20 145 / 0.4)",
            }}
          >
            ID: {emp.employeeId}
          </Badge>
        </div>
      </motion.div>

      {/* Info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {infoCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
            >
              <Card className="card-glass h-full">
                <CardContent className="p-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                    style={{
                      background: `${card.color} / 0.2`,
                      border: `1px solid ${card.color} / 0.3`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {card.label}
                  </p>
                  <p className="text-xs font-semibold text-foreground truncate capitalize">
                    {card.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Latest salary + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Latest salary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-glass h-full">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "oklch(0.50 0.25 260 / 0.2)" }}
                >
                  <Banknote
                    className="w-4 h-4"
                    style={{ color: "oklch(0.70 0.22 260)" }}
                  />
                </div>
                <div>
                  <p className="text-sm font-display font-semibold">
                    Latest Salary
                  </p>
                  {latestSalary && (
                    <p className="text-xs text-muted-foreground">
                      {typeof latestSalary.month === "number"
                        ? [
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
                          ][latestSalary.month - 1]
                        : latestSalary.month}{" "}
                      {latestSalary.year}
                    </p>
                  )}
                </div>
              </div>
              {latestSalary ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Gross Earnings
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      ₹
                      {Number(
                        latestSalary.grossEarnings ?? latestSalary.gross ?? 0,
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-red-400" />
                      Total Deductions
                    </span>
                    <span className="text-sm font-semibold text-red-400">
                      -₹
                      {Number(latestSalary.totalDeductions ?? 0).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border/40">
                    <span className="text-sm font-semibold">Net Earnings</span>
                    <span
                      className="text-lg font-bold"
                      style={{ color: "oklch(0.70 0.22 145)" }}
                    >
                      ₹
                      {Number(
                        latestSalary.netEarnings ?? latestSalary.net ?? 0,
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No salary records yet
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="card-glass h-full">
            <CardContent className="p-5">
              <p className="text-sm font-display font-semibold mb-4">
                Quick Actions
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 border-border/50 hover:bg-primary/10 hover:text-primary"
                  onClick={() => {
                    const event = new CustomEvent("emp-nav", {
                      detail: "profile",
                    });
                    window.dispatchEvent(event);
                  }}
                  data-ocid="emp_dashboard.profile_button"
                >
                  <User className="w-4 h-4" />
                  View My Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 border-border/50 hover:bg-primary/10 hover:text-primary"
                  onClick={() => {
                    const event = new CustomEvent("emp-nav", {
                      detail: "salaryslips",
                    });
                    window.dispatchEvent(event);
                  }}
                  data-ocid="emp_dashboard.salary_slips_button"
                >
                  <FileText className="w-4 h-4" />
                  Download Salary Slip
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
