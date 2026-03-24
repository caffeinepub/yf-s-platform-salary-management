import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Wallet } from "lucide-react";
import { getTallyTransactions } from "../store";
import { formatAmount, formatDate } from "../utils";

export default function CashBookPage() {
  const allTx = getTallyTransactions();
  const cashTx = allTx
    .filter((t) => t.party.toLowerCase().includes("cash"))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totDebit = cashTx
    .filter((t) => t.entryType === "debit")
    .reduce((s, t) => s + t.amount, 0);
  const totCredit = cashTx
    .filter((t) => t.entryType === "credit")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Cash Book
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cash transactions (parties containing "Cash")
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Cash Receipts (Dr)</p>
            <p className="font-mono-nums font-bold text-debit text-lg">
              {formatAmount(totDebit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Cash Payments (Cr)</p>
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
            <Wallet className="w-5 h-5 text-primary" />
            {cashTx.length} cash entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cashTx.length === 0 ? (
            <div
              className="py-16 text-center text-muted-foreground"
              data-ocid="tally.cashbook.empty_state"
            >
              No cash transactions found.
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
                  {cashTx.map((tx) => (
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
