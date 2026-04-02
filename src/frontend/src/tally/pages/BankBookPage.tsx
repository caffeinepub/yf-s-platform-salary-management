import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2 } from "lucide-react";
import { getTallyTransactions } from "../store";
import { formatAmount, formatDate } from "../utils";

export default function BankBookPage() {
  const allTx = getTallyTransactions();
  const bankTx = allTx
    .filter((t) => t.party.toLowerCase().includes("bank"))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totDebit = bankTx
    .filter((t) => t.entryType === "debit")
    .reduce((s, t) => s + t.amount, 0);
  const totCredit = bankTx
    .filter((t) => t.entryType === "credit")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-gradient">
            Bank Book
          </h1>
          <p className="text-sm text-muted-foreground">
            Bank transaction records
          </p>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-display font-bold text-gradient">
          Bank Book
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bank transactions (parties containing "Bank")
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Bank Receipts (Dr)</p>
            <p className="font-mono-nums font-bold text-debit text-lg">
              {formatAmount(totDebit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Bank Payments (Cr)</p>
            <p className="font-mono-nums font-bold text-credit text-lg">
              {formatAmount(totCredit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Net Balance</p>
            <p
              className={`font-mono-nums font-bold text-lg ${totDebit >= totCredit ? "text-debit" : "text-credit"}`}
            >
              {formatAmount(Math.abs(totDebit - totCredit))}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            {bankTx.length} bank entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bankTx.length === 0 ? (
            <div
              className="py-16 text-center text-muted-foreground"
              data-ocid="tally.bankbook.empty_state"
            >
              No bank transactions found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Narration</TableHead>
                    <TableHead>Cheque No</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankTx.map((tx) => (
                    <TableRow key={`${tx.slNo}-${tx.date}`}>
                      <TableCell>{formatDate(tx.date)}</TableCell>
                      <TableCell className="font-medium">{tx.party}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {tx.narration}
                      </TableCell>
                      <TableCell>{tx.chequeNo || "—"}</TableCell>
                      <TableCell className="text-right font-mono-nums text-debit">
                        {tx.entryType === "debit"
                          ? formatAmount(tx.amount)
                          : ""}
                      </TableCell>
                      <TableCell className="text-right font-mono-nums text-credit">
                        {tx.entryType === "credit"
                          ? formatAmount(tx.amount)
                          : ""}
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
