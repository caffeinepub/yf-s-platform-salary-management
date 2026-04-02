import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3 } from "lucide-react";
import { useState } from "react";
import { getFeeStructures, getPayments, getStudents } from "../store";

function fmtDate(d: string) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");
}

function fmtAmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function FeesReportsPage() {
  const payments = getPayments();
  const students = getStudents();
  const structures = getFeeStructures();
  const studentMap = Object.fromEntries(students.map((s) => [s.id, s]));

  const [dailyDate, setDailyDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Daily
  const dailyPayments = payments.filter((p) => p.paymentDate === dailyDate);
  const dailyTotal = dailyPayments.reduce((s, p) => s + p.amount, 0);

  // Class-wise
  const classMap: Record<string, { count: number; total: number }> = {};
  for (const p of payments) {
    const cls = studentMap[p.studentId]?.className ?? "Unknown";
    if (!classMap[cls]) classMap[cls] = { count: 0, total: 0 };
    classMap[cls].count += 1;
    classMap[cls].total += p.amount;
  }
  const classEntries = Object.entries(classMap).sort(
    (a, b) => b[1].total - a[1].total,
  );

  // Student-wise
  const studentTotals: Record<number, number> = {};
  for (const p of payments) {
    studentTotals[p.studentId] = (studentTotals[p.studentId] ?? 0) + p.amount;
  }
  const studentEntries = Object.entries(studentTotals)
    .map(([id, total]) => ({ student: studentMap[Number(id)], total }))
    .filter((e) => e.student)
    .sort((a, b) => b.total - a.total);

  // Defaulters: students with fee structures for their class but no payment this month
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const paidThisMonth = new Set(
    payments
      .filter((p) => p.paymentDate.startsWith(thisMonth))
      .map((p) => p.studentId),
  );
  const defaulters = students.filter((s) => {
    if (s.status !== "active") return false;
    const hasStructure = structures.some(
      (str) => str.className === s.className && str.frequency === "monthly",
    );
    return hasStructure && !paidThisMonth.has(s.id);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-gradient">
            Fee Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Analyze fee collection data
          </p>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-display font-bold text-gradient">
          Fee Reports
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analytics and collection summaries
        </p>
      </div>

      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="classwise">Class-wise</TabsTrigger>
          <TabsTrigger value="studentwise">Student-wise</TabsTrigger>
          <TabsTrigger value="defaulters">Defaulters</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Daily Collections
              </CardTitle>
              <Input
                type="date"
                value={dailyDate}
                onChange={(e) => setDailyDate(e.target.value)}
                className="w-40"
                style={{ color: "black", background: "white" }}
              />
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium mb-3">
                Total for {fmtDate(dailyDate)}:{" "}
                <span className="text-primary font-bold">
                  {fmtAmt(dailyTotal)}
                </span>
              </p>
              {dailyPayments.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No payments on this date.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyPayments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">
                          {p.receiptNo}
                        </TableCell>
                        <TableCell>
                          {studentMap[p.studentId]?.name ?? "?"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.categoryName}
                        </TableCell>
                        <TableCell className="capitalize">{p.method}</TableCell>
                        <TableCell className="text-right font-mono-nums">
                          {fmtAmt(p.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classwise" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Class-wise Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {classEntries.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No data.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Payments</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classEntries.map(([cls, data]) => (
                      <TableRow key={cls}>
                        <TableCell className="font-medium">{cls}</TableCell>
                        <TableCell>{data.count}</TableCell>
                        <TableCell className="text-right font-mono-nums font-bold">
                          {fmtAmt(data.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="studentwise" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Student-wise Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {studentEntries.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No data.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="text-right">Total Paid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentEntries.map((e) => (
                      <TableRow key={e.student.id}>
                        <TableCell className="font-medium">
                          {e.student.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {e.student.className}
                        </TableCell>
                        <TableCell className="text-right font-mono-nums font-bold">
                          {fmtAmt(e.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defaulters" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Defaulters (No payment this month)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {defaulters.length === 0 ? (
                <div className="py-8 text-center text-green-600 font-medium">
                  All students have paid this month!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {defaulters.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.className}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {s.rollNo || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {s.phone || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
