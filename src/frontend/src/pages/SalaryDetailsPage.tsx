import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Filter, IndianRupee, Loader2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Employee,
  type Institute,
  useGetAllInstitutes,
  useGetEmployeesForInstitute,
  useUpdateEmployee,
} from "../hooks/useQueries";

function getEmpExtra(employeeId: string) {
  try {
    return JSON.parse(localStorage.getItem(`empExtra_${employeeId}`) || "{}");
  } catch {
    return {};
  }
}

function saveEmpExtra(employeeId: string, data: any) {
  localStorage.setItem(`empExtra_${employeeId}`, JSON.stringify(data));
}

export default function SalaryDetailsPage() {
  const { data: institutes = [], isLoading: loadingInstitutes } =
    useGetAllInstitutes();
  const [instId, setInstId] = useState<string>("all");
  const [selectedEmpId, setSelectedEmpId] = useState<string>("all");
  const [salaryEdits, setSalaryEdits] = useState<
    Record<string, { basic: string; ta: string }>
  >({});

  const effectiveInstId =
    instId !== "all" ? BigInt(instId) : (institutes[0]?.id ?? null);

  const { data: employees = [], isLoading: loadingEmps } =
    useGetEmployeesForInstitute(effectiveInstId);

  const updateMutation = useUpdateEmployee();

  const isLoading = loadingInstitutes || loadingEmps;

  const instituteEmployees =
    instId === "all"
      ? employees
      : employees.filter((e: Employee) => e.instituteId.toString() === instId);

  const filteredEmps =
    selectedEmpId === "all"
      ? instituteEmployees
      : instituteEmployees.filter(
          (e: Employee) => e.employeeId === selectedEmpId,
        );

  // Reset employee selection when institute changes
  function handleInstChange(val: string) {
    setInstId(val);
    setSelectedEmpId("all");
  }

  function getSalaryEdit(
    empId: string,
    field: "basic" | "ta",
    fallback: string,
  ) {
    return salaryEdits[empId]?.[field] ?? fallback;
  }

  function setSalaryEditField(
    empId: string,
    field: "basic" | "ta",
    value: string,
  ) {
    setSalaryEdits((prev) => ({
      ...prev,
      [empId]: {
        ...{ basic: "0", ta: "0" },
        ...prev[empId],
        [field]: value,
      },
    }));
  }

  async function saveSalaryRow(emp: Employee) {
    try {
      const basic =
        salaryEdits[emp.employeeId]?.basic ?? emp.basicSalary.toString();
      const extra = getEmpExtra(emp.employeeId);
      const ta = salaryEdits[emp.employeeId]?.ta ?? String(extra.ta || "0");
      await updateMutation.mutateAsync({
        id: emp.id,
        name: emp.name,
        employeeId: emp.employeeId,
        instituteId: emp.instituteId,
        designation: emp.designation,
        employmentType: emp.employmentType,
        joiningDate: emp.joiningDate,
        address: emp.address,
        dob: emp.dob,
        basicSalary: BigInt(basic || "0"),
      });
      saveEmpExtra(emp.employeeId, { ...extra, ta: Number(ta) || 0 });
      toast.success(`Saved salary for ${emp.name}`);
    } catch {
      toast.error("Failed to save salary");
    }
  }

  return (
    <div className="space-y-6" data-ocid="salary_details.page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-gradient">
            Salary Details
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Set Basic Salary and TA for each employee
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {/* Institute Selector */}
          <Select value={instId} onValueChange={handleInstChange}>
            <SelectTrigger
              className="bg-card/60 border-border/60 w-44"
              data-ocid="salary_details.institute.select"
            >
              <SelectValue placeholder="All Institutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Institutes</SelectItem>
              {institutes.map((i: Institute) => (
                <SelectItem key={i.id.toString()} value={i.id.toString()}>
                  {i.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Employee Selector */}
          <Select
            value={selectedEmpId}
            onValueChange={setSelectedEmpId}
            disabled={instId === "all"}
          >
            <SelectTrigger
              className="bg-card/60 border-border/60 w-44"
              data-ocid="salary_details.employee.select"
            >
              <Users className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {instituteEmployees.map((emp: Employee) => (
                <SelectItem key={emp.employeeId} value={emp.employeeId}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div
          className="flex items-center justify-center py-20"
          data-ocid="salary_details.loading_state"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredEmps.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
          data-ocid="salary_details.empty_state"
        >
          <IndianRupee className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-display font-semibold text-muted-foreground">
            No employees found
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {instId === "all"
              ? "Select an institute to view employees"
              : "Add employees first to manage salary details"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="gradient-card overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table data-ocid="salary_details.table">
                  <TableHeader>
                    <TableRow className="border-border/40 bg-muted/30">
                      <TableHead className="text-xs font-semibold text-muted-foreground w-12">
                        Sl No
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Staff No
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Name
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Designation
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Institute
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground w-36">
                        Basic Salary (₹)
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground w-28">
                        TA (₹)
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground w-20">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmps.map((emp: Employee, idx: number) => {
                      const extra = getEmpExtra(emp.employeeId);
                      const basicVal = getSalaryEdit(
                        emp.employeeId,
                        "basic",
                        emp.basicSalary.toString(),
                      );
                      const taVal = getSalaryEdit(
                        emp.employeeId,
                        "ta",
                        String(extra.ta || "0"),
                      );
                      const instName =
                        institutes.find(
                          (i: Institute) => i.id === emp.instituteId,
                        )?.name ?? "—";
                      // Use extra.designation (human-readable) over backend enum value
                      const displayDesignation =
                        extra.designation || emp.designation;
                      return (
                        <TableRow
                          key={emp.id.toString()}
                          className="border-border/30 hover:bg-muted/10"
                          data-ocid={`salary_details.item.${idx + 1}`}
                        >
                          <TableCell className="text-sm text-muted-foreground">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="text-sm font-mono text-foreground">
                            {emp.employeeId}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-foreground">
                            {emp.name}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {displayDesignation}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {instName}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={basicVal}
                              onChange={(e) =>
                                setSalaryEditField(
                                  emp.employeeId,
                                  "basic",
                                  e.target.value,
                                )
                              }
                              className="h-8 text-sm text-gray-900 bg-white border-border/60 w-32"
                              placeholder="0"
                              data-ocid={`salary_details.basic.input.${idx + 1}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={taVal}
                              onChange={(e) =>
                                setSalaryEditField(
                                  emp.employeeId,
                                  "ta",
                                  e.target.value,
                                )
                              }
                              className="h-8 text-sm text-gray-900 bg-white border-border/60 w-24"
                              placeholder="0"
                              data-ocid={`salary_details.ta.input.${idx + 1}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => saveSalaryRow(emp)}
                              disabled={updateMutation.isPending}
                              className="h-8 gradient-primary text-white border-0 text-xs gap-1"
                              data-ocid={`salary_details.save_button.${idx + 1}`}
                            >
                              {updateMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : null}
                              Save
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
