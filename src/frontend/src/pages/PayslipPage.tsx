import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, FileText, Lock, Printer, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  useGetAllInstitutes,
  useGetEmployeesForInstitute,
  useGetSalary,
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

function getSessionMonths(): { value: string; label: string }[] {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const months: { value: string; label: string }[] = [];
  if (currentMonth >= 4) {
    for (let m = 4; m <= currentMonth; m++) {
      months.push({ value: String(m), label: MONTH_NAMES[m - 1] });
    }
  } else {
    for (let m = 4; m <= 12; m++) {
      months.push({ value: String(m), label: MONTH_NAMES[m - 1] });
    }
    for (let m = 1; m <= currentMonth; m++) {
      months.push({ value: String(m), label: MONTH_NAMES[m - 1] });
    }
  }
  return months.reverse();
}

const fmt = (n: bigint | number) => `₹${Number(n).toLocaleString("en-IN")}`;

export default function PayslipPage() {
  const now = new Date();
  const [instituteId, setInstituteId] = useState<bigint | null>(null);
  const [employeeId, setEmployeeId] = useState<bigint | null>(null);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [session, setSession] = useState(getCurrentSession());
  const sessionList = getSessionList();
  const year = getYearFromSession(session, month);

  const { data: institutes = [] } = useGetAllInstitutes();
  const { data: employees = [] } = useGetEmployeesForInstitute(instituteId);
  const { data: salary, isLoading } = useGetSalary(employeeId, month, year);

  const selectedInstitute = institutes.find((i) => i.id === instituteId);
  const selectedEmployee = employees.find((e) => e.id === employeeId);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gradient">
              Payslip
            </h1>
            <p className="text-sm text-muted-foreground">
              View and print employee payslips
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={instituteId?.toString() ?? ""}
            onValueChange={(v) => {
              setInstituteId(BigInt(v));
              setEmployeeId(null);
            }}
          >
            <SelectTrigger className="w-40 h-9" data-ocid="payslip.select">
              <Building2 className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Institute" />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
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
            <SelectTrigger className="w-40 h-9" data-ocid="payslip.select">
              <Users className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Employee" />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
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
            <SelectTrigger className="w-32 h-9" data-ocid="payslip.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[250px] overflow-y-auto">
              {getSessionMonths().map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={session} onValueChange={setSession}>
            <SelectTrigger className="w-28 h-9" data-ocid="payslip.select">
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

      {/* Payslip Card */}
      {employeeId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          id="payslip-print-area"
        >
          {isLoading ? (
            <div
              className="gradient-card rounded-xl p-12 text-center"
              data-ocid="payslip.loading_state"
            >
              <p className="text-muted-foreground">Loading salary data...</p>
            </div>
          ) : !salary ? (
            <div
              className="gradient-card rounded-xl p-12 text-center"
              data-ocid="payslip.empty_state"
            >
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">
                Salary not processed yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Process salary first from the Salary Processing page
              </p>
            </div>
          ) : (
            <Card className="gradient-card border-border/40 max-w-2xl mx-auto">
              <CardContent className="p-8">
                {/* Header */}
                <div className="text-center mb-6 pb-4 border-b border-border/40">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-primary/30 mx-auto mb-2">
                    <img
                      src="/assets/uploads/file_0000000098e07208a686dfee13498f2c-1.png"
                      alt="Logo"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <h2 className="text-xl font-display font-bold text-gradient">
                    {selectedInstitute?.name ?? "Institute"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    SALARY SLIP
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {MONTH_NAMES[month - 1]} {year}
                  </p>
                  {salary.isLocked && (
                    <Badge variant="secondary" className="gap-1 mt-2">
                      <Lock className="w-3 h-3" />
                      Locked
                    </Badge>
                  )}
                </div>

                {/* Employee Details */}
                <div className="grid grid-cols-2 gap-3 mb-6 p-3 rounded-lg bg-muted/20">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Employee Name
                    </p>
                    <p className="font-semibold text-foreground">
                      {selectedEmployee?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Employee ID</p>
                    <p className="font-semibold text-foreground">
                      {selectedEmployee?.employeeId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Designation</p>
                    <p className="font-semibold text-foreground capitalize">
                      {selectedEmployee?.designation.toString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Employment Type
                    </p>
                    <p className="font-semibold text-foreground capitalize">
                      {selectedEmployee?.employmentType.toString()}
                    </p>
                  </div>
                </div>

                {/* Earnings & Deductions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Earnings */}
                  <div>
                    <h3 className="text-sm font-display font-semibold text-green-400 mb-2 flex items-center gap-1">
                      Earnings
                    </h3>
                    <div className="space-y-1.5">
                      {[
                        { label: "Basic Salary", value: salary.basicSalary },
                        { label: "DA (257%)", value: salary.da },
                        { label: "HRA (20%)", value: salary.hra },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="flex justify-between text-sm py-1 border-b border-border/20"
                        >
                          <span className="text-muted-foreground">
                            {row.label}
                          </span>
                          <span className="font-medium text-foreground">
                            {fmt(row.value)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm py-1.5 font-semibold text-green-400">
                        <span>Gross Total</span>
                        <span>{fmt(salary.grossSalary)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h3 className="text-sm font-display font-semibold text-red-400 mb-2">
                      Deductions
                    </h3>
                    <div className="space-y-1.5">
                      {[
                        { label: "PF (12%)", value: salary.pf },
                        { label: "ESIC (0.75%)", value: salary.esic },
                        { label: "Professional Tax", value: salary.pt },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="flex justify-between text-sm py-1 border-b border-border/20"
                        >
                          <span className="text-muted-foreground">
                            {row.label}
                          </span>
                          <span className="font-medium text-red-400">
                            {fmt(row.value)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm py-1.5 font-semibold text-red-400">
                        <span>Total Deductions</span>
                        <span>{fmt(salary.totalDeductions)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Salary */}
                <div className="rounded-xl gradient-primary p-5 text-center glow-primary">
                  <p className="text-white/80 text-sm mb-1">Net Salary</p>
                  <p className="text-3xl font-display font-bold text-white">
                    {fmt(salary.netSalary)}
                  </p>
                </div>

                {/* Print Button */}
                <div className="mt-6 flex justify-center print:hidden">
                  <Button
                    onClick={() => window.print()}
                    className="gradient-primary text-white gap-2"
                    data-ocid="payslip.primary_button"
                  >
                    <Printer className="w-4 h-4" />
                    Print Payslip
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {!employeeId && (
        <div
          className="gradient-card rounded-xl p-12 text-center"
          data-ocid="payslip.empty_state"
        >
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Select institute, employee, and period to view payslip
          </p>
        </div>
      )}
    </div>
  );
}
