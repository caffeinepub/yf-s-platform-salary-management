import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Printer, Receipt } from "lucide-react";
import { useState } from "react";
import { getPayments, getStudents } from "../store";
import type { Payment } from "../types";

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

export default function PaymentsPage() {
  const payments = getPayments();
  const students = getStudents();
  const studentMap = Object.fromEntries(students.map((s) => [s.id, s]));

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewPayment, setViewPayment] = useState<Payment | null>(null);

  const filtered = payments
    .filter((p) => {
      const st = studentMap[p.studentId];
      if (
        search &&
        !st?.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.receiptNo.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (dateFrom && p.paymentDate < dateFrom) return false;
      if (dateTo && p.paymentDate > dateTo) return false;
      return true;
    })
    .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));

  function exportCsv() {
    const rows = [
      [
        "Receipt No",
        "Date",
        "Student",
        "Class",
        "Category",
        "Amount",
        "Method",
      ].join(","),
      ...filtered.map((p) =>
        [
          p.receiptNo,
          fmtDate(p.paymentDate),
          studentMap[p.studentId]?.name ?? "",
          studentMap[p.studentId]?.className ?? "",
          p.categoryName,
          p.amount,
          p.method,
        ].join(","),
      ),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <Receipt className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">
            Payments
          </h1>
          <p className="text-sm text-muted-foreground">
            View all payment transactions
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Payments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {payments.length} total payments
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" /> Payment History
          </CardTitle>
          <div className="flex flex-wrap gap-3 mt-2">
            <Input
              placeholder="Search student or receipt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-40"
              style={{ color: "black", background: "white" }}
            />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-36"
              style={{ color: "black", background: "white" }}
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-36"
              style={{ color: "black", background: "white" }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No payments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => setViewPayment(p)}
                    >
                      <TableCell className="font-mono text-xs">
                        {p.receiptNo}
                      </TableCell>
                      <TableCell className="text-sm">
                        {fmtDate(p.paymentDate)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {studentMap[p.studentId]?.name ?? "?"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {studentMap[p.studentId]?.className ?? "?"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.categoryName}
                      </TableCell>
                      <TableCell className="text-sm capitalize">
                        {p.method}
                      </TableCell>
                      <TableCell className="text-right font-mono-nums">
                        {fmtAmt(p.amount)}
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost">
                          <Receipt className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={viewPayment !== null}
        onOpenChange={() => setViewPayment(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Receipt Details</DialogTitle>
          </DialogHeader>
          {viewPayment && (
            <div className="space-y-3 text-sm">
              <div className="text-center border-b pb-3">
                <p className="font-bold text-lg">Fee Receipt</p>
                <p className="font-mono text-primary">
                  {viewPayment.receiptNo}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground text-xs">Date</p>
                  <p className="font-medium">
                    {fmtDate(viewPayment.paymentDate)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Method</p>
                  <p className="font-medium capitalize">{viewPayment.method}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Student</p>
                  <p className="font-medium">
                    {studentMap[viewPayment.studentId]?.name}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Class</p>
                  <p className="font-medium">
                    {studentMap[viewPayment.studentId]?.className}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Fee Type</p>
                  <p className="font-medium">{viewPayment.categoryName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Amount</p>
                  <p className="font-bold text-primary text-lg">
                    {fmtAmt(viewPayment.amount)}
                  </p>
                </div>
              </div>
            </div>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-1" /> Print
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
