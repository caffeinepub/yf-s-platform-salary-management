import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, IndianRupee, PlusCircle, Users } from "lucide-react";
import { getPayments, getStudents } from "../store";
import type { FeesPage } from "../types";

interface Props {
  onNavigate: (page: FeesPage) => void;
}

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
    .replace(/ /g, "-")
    .replace(/,/g, ",");
}

function fmtAmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function FeesDashboardPage({ onNavigate }: Props) {
  const students = getStudents();
  const payments = getPayments();

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthPayments = payments.filter((p) =>
    p.paymentDate.startsWith(thisMonth),
  );
  const monthTotal = monthPayments.reduce((s, p) => s + p.amount, 0);
  const allTotal = payments.reduce((s, p) => s + p.amount, 0);
  const activeStudents = students.filter((s) => s.status === "active").length;

  const recent = [...payments]
    .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
    .slice(0, 5);
  const studentMap = Object.fromEntries(students.map((s) => [s.id, s]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Fees Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fee collection overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate("students")}
          >
            <PlusCircle className="w-4 h-4 mr-1" /> Add Student
          </Button>
          <Button size="sm" onClick={() => onNavigate("collectfee")}>
            <IndianRupee className="w-4 h-4 mr-1" /> Collect Fee
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold">{activeStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-lg font-bold">{fmtAmt(monthTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Collected</p>
                <p className="text-lg font-bold">{fmtAmt(allTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No payments yet.{" "}
              <button
                type="button"
                className="text-primary underline"
                onClick={() => onNavigate("collectfee")}
              >
                Collect a fee
              </button>{" "}
              to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">
                        {p.receiptNo}
                      </TableCell>
                      <TableCell className="text-sm">
                        {fmtDate(p.paymentDate)}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {studentMap[p.studentId]?.name ?? "Unknown"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.categoryName}
                      </TableCell>
                      <TableCell className="text-right font-mono-nums">
                        {fmtAmt(p.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
