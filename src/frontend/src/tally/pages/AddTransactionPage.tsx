import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getTallyTransactions, saveTallyTransactions } from "../store";
import type { Transaction } from "../types";
import { formatAmount, formatDate } from "../utils";

export default function AddTransactionPage() {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    party: "",
    narration: "",
    chequeNo: "",
    amount: "",
    entryType: "debit" as "debit" | "credit",
  });

  function handleSave() {
    if (!form.date || !form.party || !form.amount) {
      toast.error("Date, Party and Amount are required");
      return;
    }
    const existing = getTallyTransactions();
    const maxSlNo =
      existing.length > 0 ? Math.max(...existing.map((t) => t.slNo)) : 0;
    const newTx: Transaction = {
      slNo: maxSlNo + 1,
      date: form.date,
      party: form.party.trim(),
      narration: form.narration.trim(),
      chequeNo: form.chequeNo.trim(),
      amount: Number.parseFloat(form.amount) || 0,
      entryType: form.entryType,
    };
    saveTallyTransactions([...existing, newTx]);
    toast.success("Transaction saved");
    setForm({
      date: new Date().toISOString().split("T")[0],
      party: "",
      narration: "",
      chequeNo: "",
      amount: "",
      entryType: "debit",
    });
  }

  const recent = getTallyTransactions().slice(-20).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Add Transaction
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manually record a new accounting entry
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary" />
            New Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={{ color: "black", background: "white" }}
                data-ocid="tally.addtx.date.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Party *</Label>
              <Input
                placeholder="Party name"
                value={form.party}
                onChange={(e) => setForm({ ...form, party: e.target.value })}
                style={{ color: "black", background: "white" }}
                data-ocid="tally.addtx.party.input"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Narration</Label>
              <Input
                placeholder="Description / narration"
                value={form.narration}
                onChange={(e) =>
                  setForm({ ...form, narration: e.target.value })
                }
                style={{ color: "black", background: "white" }}
                data-ocid="tally.addtx.narration.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cheque No</Label>
              <Input
                placeholder="Optional"
                value={form.chequeNo}
                onChange={(e) => setForm({ ...form, chequeNo: e.target.value })}
                style={{ color: "black", background: "white" }}
                data-ocid="tally.addtx.chequeno.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Amount *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                style={{ color: "black", background: "white" }}
                data-ocid="tally.addtx.amount.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Entry Type *</Label>
              <Select
                value={form.entryType}
                onValueChange={(v) =>
                  setForm({ ...form, entryType: v as "debit" | "credit" })
                }
              >
                <SelectTrigger data-ocid="tally.addtx.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSave} data-ocid="tally.addtx.save.button">
              <PlusCircle className="w-4 h-4 mr-1" /> Save Transaction
            </Button>
          </div>
        </CardContent>
      </Card>

      {recent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sl No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Narration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((tx) => (
                    <TableRow key={`r-${tx.slNo}`}>
                      <TableCell>{tx.slNo}</TableCell>
                      <TableCell>{formatDate(tx.date)}</TableCell>
                      <TableCell className="font-medium">{tx.party}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {tx.narration || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            tx.entryType === "debit"
                              ? "text-debit border-destructive/40"
                              : "text-credit border-green-600/40"
                          }
                        >
                          {tx.entryType}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono-nums ${tx.entryType === "debit" ? "text-debit" : "text-credit"}`}
                      >
                        {formatAmount(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
