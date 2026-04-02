import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { IndianRupee, Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  getCategories,
  getFeeStructures,
  getPayments,
  getStudents,
  savePayments,
} from "../store";
import type { Payment, Student } from "../types";

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

export default function CollectFeePage() {
  const students = getStudents();
  const categories = getCategories();
  const structures = getFeeStructures();

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStructureId, setSelectedStructureId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState<Payment["method"]>("cash");
  const [chequeNo, setChequeNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [receiptData, setReceiptData] = useState<Payment | null>(null);

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const selectedStudent: Student | undefined = students.find(
    (s) => s.id === Number(selectedStudentId),
  );
  const applicableStructures = structures.filter(
    (s) => s.className === selectedStudent?.className,
  );
  const selectedStructure = structures.find(
    (s) => s.id === Number(selectedStructureId),
  );

  function handleStudentChange(v: string) {
    setSelectedStudentId(v);
    setSelectedStructureId("");
    setAmount("");
  }

  function handleStructureChange(v: string) {
    setSelectedStructureId(v);
    const str = structures.find((s) => s.id === Number(v));
    if (str) setAmount(String(str.amount));
  }

  function generateReceiptNo(): string {
    const payments = getPayments();
    const year = new Date().getFullYear();
    const count =
      payments.filter((p) => p.receiptNo.startsWith(`RCPT-${year}`)).length + 1;
    return `RCPT-${year}-${String(count).padStart(4, "0")}`;
  }

  function handleCollect() {
    if (!selectedStudentId || !selectedStructureId || !amount) {
      toast.error("Please select student, fee type, and enter amount");
      return;
    }
    const payments = getPayments();
    const maxId =
      payments.length > 0 ? Math.max(...payments.map((p) => p.id)) : 0;
    const newPayment: Payment = {
      id: maxId + 1,
      studentId: Number(selectedStudentId),
      feeStructureId: Number(selectedStructureId),
      categoryName: catMap[selectedStructure?.categoryId ?? 0] ?? "",
      amount: Number(amount),
      paymentDate: date,
      method,
      chequeNo: method === "cheque" ? chequeNo : "",
      receiptNo: generateReceiptNo(),
      remarks,
    };
    savePayments([...payments, newPayment]);
    setReceiptData(newPayment);
    toast.success("Payment recorded successfully");
  }

  function resetForm() {
    setSelectedStudentId("");
    setSelectedStructureId("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setMethod("cash");
    setChequeNo("");
    setRemarks("");
    setReceiptData(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <IndianRupee className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-gradient">
            Collect Fee
          </h1>
          <p className="text-sm text-muted-foreground">
            Record fee payments from students
          </p>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-display font-bold text-gradient">
          Collect Fee
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record a fee payment for a student
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-primary" /> Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label>Student *</Label>
              <Select
                value={selectedStudentId}
                onValueChange={handleStudentChange}
              >
                <SelectTrigger data-ocid="fees.collect.student.select">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students
                    .filter((s) => s.status === "active")
                    .map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} — {s.className}{" "}
                        {s.rollNo ? `(${s.rollNo})` : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStudent && (
              <div className="space-y-1.5 md:col-span-2">
                <Label>Fee Type *</Label>
                <Select
                  value={selectedStructureId}
                  onValueChange={handleStructureChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee type" />
                  </SelectTrigger>
                  <SelectContent>
                    {applicableStructures.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No structures for this class
                      </SelectItem>
                    ) : (
                      applicableStructures.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {catMap[s.categoryId] ?? "Unknown"} —{" "}
                          {fmtAmt(s.amount)} / {s.frequency}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Amount *</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ color: "black", background: "white" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ color: "black", background: "white" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <Select
                value={method}
                onValueChange={(v) => setMethod(v as Payment["method"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="dd">DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {method === "cheque" && (
              <div className="space-y-1.5">
                <Label>Cheque No</Label>
                <Input
                  value={chequeNo}
                  onChange={(e) => setChequeNo(e.target.value)}
                  style={{ color: "black", background: "white" }}
                />
              </div>
            )}
            <div className="space-y-1.5 md:col-span-2">
              <Label>Remarks</Label>
              <Input
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={{ color: "black", background: "white" }}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleCollect}
              data-ocid="fees.collect.submit.button"
            >
              <IndianRupee className="w-4 h-4 mr-1" /> Collect Fee
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={receiptData !== null}
        onOpenChange={() => setReceiptData(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          {receiptData && (
            <div className="space-y-3 text-sm" id="fee-receipt">
              <div className="text-center border-b pb-3">
                <p className="font-bold text-lg">Fee Receipt</p>
                <p className="font-mono text-primary">
                  {receiptData.receiptNo}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground text-xs">Date</p>
                  <p className="font-medium">
                    {fmtDate(receiptData.paymentDate)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Method</p>
                  <p className="font-medium capitalize">{receiptData.method}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Student</p>
                  <p className="font-medium">{selectedStudent?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Class</p>
                  <p className="font-medium">{selectedStudent?.className}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Fee Type</p>
                  <p className="font-medium">{receiptData.categoryName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Amount</p>
                  <p className="font-bold text-primary text-lg">
                    {fmtAmt(receiptData.amount)}
                  </p>
                </div>
              </div>
              {receiptData.remarks && (
                <p className="text-muted-foreground text-xs">
                  Remarks: {receiptData.remarks}
                </p>
              )}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-1" /> Print
            </Button>
            <Button onClick={resetForm}>New Payment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
