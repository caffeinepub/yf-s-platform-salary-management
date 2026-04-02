import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp } from "lucide-react";
import { getTallyTransactions, getUniqueParties } from "../store";
import { formatAmount, formatDate } from "../utils";

export default function SalesRegisterPage() {
  const allTx = getTallyTransactions();
  const creditTx = allTx
    .filter((t) => t.entryType === "credit")
    .sort((a, b) => a.date.localeCompare(b.date));
  const parties = getUniqueParties(creditTx);

  const grouped = parties.map((p) => ({
    party: p,
    transactions: creditTx.filter((t) => t.party === p),
    total: creditTx
      .filter((t) => t.party === p)
      .reduce((s, t) => s + t.amount, 0),
  }));

  const grandTotal = creditTx.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-gradient">
            Sales Register
          </h1>
          <p className="text-sm text-muted-foreground">
            All sales transactions
          </p>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-display font-bold text-gradient">
          Sales Register
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Credit transactions grouped by party
        </p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Grand Total Sales</p>
          <p className="font-mono-nums font-bold text-credit text-xl">
            {formatAmount(grandTotal)}
          </p>
        </CardContent>
      </Card>

      {creditTx.length === 0 ? (
        <div
          className="py-16 text-center text-muted-foreground"
          data-ocid="tally.sales.empty_state"
        >
          No credit transactions found.
        </div>
      ) : (
        grouped.map((g) => (
          <Card key={g.party}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  {g.party}
                </span>
                <span className="font-mono-nums text-credit">
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
                        <TableCell className="text-right font-mono-nums text-credit">
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
