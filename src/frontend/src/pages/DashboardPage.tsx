import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BadgeIndianRupee,
  Banknote,
  Building2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  HardHat,
  Landmark,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../context/AuthContext";

type StoredEmployee = {
  id: string;
  name: string;
  employeeId: string;
  institute: string;
  department: string;
  employmentType: "regular" | "temporary";
  basicSalary: number;
};

function getEmployees(): StoredEmployee[] {
  try {
    return JSON.parse(localStorage.getItem("employees") || "[]");
  } catch {
    return [];
  }
}
function getInstitutes() {
  try {
    return JSON.parse(localStorage.getItem("institutes") || "[]");
  } catch {
    return [];
  }
}
function getAttendance() {
  try {
    return JSON.parse(localStorage.getItem("attendance") || "[]");
  } catch {
    return [];
  }
}
function getSalaries() {
  try {
    return JSON.parse(localStorage.getItem("salaries") || "[]");
  } catch {
    return [];
  }
}

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

function calcForMonth(employees: StoredEmployee[]) {
  return employees.reduce(
    (acc, emp) => {
      const basic = Number(emp.basicSalary) || 0;
      const isRegular = emp.employmentType === "regular";
      const da = isRegular ? Math.round(basic * 2.57) : 0;
      const hra = isRegular ? Math.round(basic * 0.2) : 0;
      const ta = isRegular ? 1500 : 0;
      const gross = basic + da + hra + ta;
      const pf = Math.round(basic * 0.12);
      const esic = gross <= 21000 ? Math.round(gross * 0.0075) : 0;
      let pt = 0;
      if (gross > 20000) pt = 200;
      else if (gross > 15000) pt = 150;
      else if (gross > 10000) pt = 100;
      const annualTaxable = gross * 12;
      let annualIT = 0;
      if (annualTaxable > 1500000)
        annualIT = (annualTaxable - 1500000) * 0.3 + 150000;
      else if (annualTaxable > 1200000)
        annualIT = (annualTaxable - 1200000) * 0.2 + 90000;
      else if (annualTaxable > 900000)
        annualIT = (annualTaxable - 900000) * 0.15 + 45000;
      else if (annualTaxable > 600000)
        annualIT = (annualTaxable - 600000) * 0.1 + 15000;
      else if (annualTaxable > 300000)
        annualIT = (annualTaxable - 300000) * 0.05;
      const it = Math.round(annualIT / 12);
      const net = gross - pf - esic - pt - it;
      return {
        gross: acc.gross + gross,
        pf: acc.pf + pf,
        esic: acc.esic + esic,
        net: acc.net + net,
      };
    },
    { gross: 0, pf: 0, esic: 0, net: 0 },
  );
}

const PIE_COLORS = [
  "#6366f1",
  "#22d3ee",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#a78bfa",
];

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

export default function DashboardPage() {
  const { role } = useAuth();
  const employees = getEmployees();
  const institutes = getInstitutes();
  const attendance = getAttendance();
  const salaries = getSalaries();

  const now = new Date();
  const curMonthIdx = now.getMonth();
  const curYear = now.getFullYear();

  const prevMonthIdx = curMonthIdx === 0 ? 11 : curMonthIdx - 1;
  const prevYear = curMonthIdx === 0 ? curYear - 1 : curYear;
  const nextMonthIdx = curMonthIdx === 11 ? 0 : curMonthIdx + 1;
  const nextYear = curMonthIdx === 11 ? curYear + 1 : curYear;

  const currentCalc = calcForMonth(employees);
  const prevCalc = calcForMonth(employees);
  const nextCalc = calcForMonth(employees);

  // Count processed salaries this month
  const processedThisMonth = salaries.filter(
    (s: { month: string; year: string }) =>
      s.month === MONTHS[curMonthIdx] && s.year === String(curYear),
  ).length;

  const savedAttendanceThisMonth = attendance.filter(
    (a: { month: string; year: string }) =>
      a.month === MONTHS[curMonthIdx] && a.year === String(curYear),
  ).length;

  // Chart data
  const deptData = employees.reduce((acc: Record<string, number>, e) => {
    const dept = e.department || "Unassigned";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(deptData).map(([name, value]) => ({
    name,
    value,
  }));

  const barData = MONTHS.slice(0, curMonthIdx + 1).map((m) => {
    const count = salaries.filter(
      (s: { month: string; year: string }) =>
        s.month === m && s.year === String(curYear),
    ).length;
    return { month: m.slice(0, 3), processed: count, total: employees.length };
  });

  const summaryCards = [
    {
      label: "Total Employees",
      value: employees.length,
      icon: <Users className="w-5 h-5" />,
      color: "from-blue-500 to-indigo-600",
      sub: `${employees.filter((e) => e.employmentType === "regular").length} regular`,
    },
    {
      label: "Active Institutes",
      value: institutes.length,
      icon: <Building2 className="w-5 h-5" />,
      color: "from-purple-500 to-violet-600",
      sub: "Branches / units",
    },
    {
      label: "Attendance Saved",
      value: savedAttendanceThisMonth,
      icon: <CalendarCheck className="w-5 h-5" />,
      color: "from-emerald-500 to-teal-600",
      sub: MONTHS[curMonthIdx],
    },
    {
      label: "Salaries Processed",
      value: `${processedThisMonth}/${employees.length}`,
      icon: <Banknote className="w-5 h-5" />,
      color: "from-amber-500 to-orange-600",
      sub: MONTHS[curMonthIdx],
    },
  ];

  const projections = [
    {
      label: `${MONTHS[prevMonthIdx]} ${prevYear}`,
      tag: "Previous",
      tagColor: "bg-slate-500/20 text-slate-300",
      ...prevCalc,
    },
    {
      label: `${MONTHS[curMonthIdx]} ${curYear}`,
      tag: "Current",
      tagColor: "bg-primary/20 text-primary",
      ...currentCalc,
    },
    {
      label: `${MONTHS[nextMonthIdx]} ${nextYear}`,
      tag: "Next",
      tagColor: "bg-green-500/20 text-green-400",
      ...nextCalc,
    },
  ];

  if (role === "employee") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold">
              Employee Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back! View your payslips and salary details.
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="card-glass">
            <CardContent className="p-5">
              <p className="text-muted-foreground text-sm">
                Use the sidebar to view your payslip and profile.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview for {MONTHS[curMonthIdx]} {curYear}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="card-glass overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.sub}
                  </p>
                </div>
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-white`}
                >
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Salary Projections */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BadgeIndianRupee className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold text-sm">
            Salary / PF / ESIC Projections
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {projections.map((proj, idx) => (
            <Card
              key={proj.label}
              className={`card-glass ${idx === 1 ? "border-primary/40" : ""}`}
            >
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    {proj.label}
                  </CardTitle>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${proj.tagColor}`}
                  >
                    {proj.tag}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Banknote className="w-3.5 h-3.5 text-blue-400" /> Net
                    Salary
                  </div>
                  <span className="font-bold text-sm">{fmt(proj.net)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-400" /> Total
                    PF
                  </div>
                  <span className="font-semibold text-sm text-green-400">
                    {fmt(proj.pf)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Landmark className="w-3.5 h-3.5 text-purple-400" /> Total
                    ESIC
                  </div>
                  <span className="font-semibold text-sm text-purple-400">
                    {fmt(proj.esic)}
                  </span>
                </div>
                <div className="border-t border-border/30 pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BadgeIndianRupee className="w-3.5 h-3.5 text-amber-400" />{" "}
                    Gross
                  </div>
                  <span className="font-semibold text-sm text-amber-400">
                    {fmt(proj.gross)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Banknote className="w-4 h-4 text-primary" /> Salary Processed
              (Monthly)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar
                  dataKey="processed"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  name="Processed"
                />
                <Bar
                  dataKey="total"
                  fill="#334155"
                  radius={[4, 4, 0, 0]}
                  name="Total"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Employee Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {pieData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                <HardHat className="w-4 h-4 mr-2" /> No employees added yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
