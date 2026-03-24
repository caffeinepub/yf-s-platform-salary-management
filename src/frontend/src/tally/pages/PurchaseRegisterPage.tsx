import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShoppingCart } from "lucide-react";
import { getTallyTransactions, getUniqueParties } from "../store";
import { formatAmount, formatDate } from "../utils";

export default function PurchaseRegisterPage() {
  const allTx = getTallyTransactions();
  const debitTx = allTx
    .filter((t) => t.entryType === "debit")
    .sort((a, b) => a.date.localeCompare(b.date));
  const parties = getUniqueParties(debitTx);

  const grouped = parties.map((p) => ({
    party: p,
    transactions: debitTx.filter((t) => t.party === p),
    total: debitTx
      .filter((t) => t.party === p)
      .reduce((s, t) => s + t.amount, 0),
  }));

  const grandTotal = debitTx.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Purchase Register
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Debit transactions grouped by party
        </p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Grand Total Purchases</p>
          <p className="font-mono-nums font-bold text-debit text-xl">
            {formatAmount(grandTotal)}
          </p>
        </CardContent>
      </Card>

      {debitTx.length === 0 ? (
        <div
          className="py-16 text-center text-muted-foreground"
          data-ocid="tally.purchase.empty_state"
        >
          No debit transactions found.
        </div>
      ) : (
        grouped.map((g) => (
          <Card key={g.party}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  {g.party}
                </span>
                <span className="font-mono-nums text-debit">
                  {formatAmount(g.total)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-border/40">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Narration</TableHead>
                      <TableHead>Cheque No</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {g.transactions.map((tx) => (
                      <TableRow key={`${tx.slNo}-${tx.date}`}>
                        <TableCell>{formatDate(tx.date)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {tx.narration}
                        </TableCell>
                        <TableCell>{tx.chequeNo || "—"}</TableCell>
                        <TableCell className="text-right font-mono-nums text-debit">
                          {formatAmount(tx.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
