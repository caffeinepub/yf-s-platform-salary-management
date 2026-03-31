import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDownLeft } from "lucide-react";
import {
  getPartyBalance,
  getTallyTransactions,
  getUniqueParties,
} from "../store";
import { formatAmount } from "../utils";

export default function ReceivablesPage() {
  const allTx = getTallyTransactions();
  const parties = getUniqueParties(allTx);

  const receivables = parties
    .map((p) => ({ party: p, ...getPartyBalance(allTx, p) }))
    .filter((r) => r.net > 0)
    .sort((a, b) => b.net - a.net);

  const total = receivables.reduce((s, r) => s + r.net, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <ArrowDownLeft className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">
            Receivables
          </h1>
          <p className="text-sm text-muted-foreground">
            Outstanding amounts to collect
          </p>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Receivables
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Parties where debit exceeds credit (amounts owed to you)
        </p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total Receivable</p>
          <p className="font-mono-nums font-bold text-debit text-xl">
            {formatAmount(total)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-debit" />
            {receivables.length} parties
          </CardTitle>
        </CardHeader>
        <CardContent>
          {receivables.length === 0 ? (
            <div
              className="py-16 text-center text-muted-foreground"
              data-ocid="tally.receivables.empty_state"
            >
              No receivables found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Net Receivable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivables.map((r, i) => (
                    <TableRow
                      key={r.party}
                      data-ocid={`tally.receivables.item.${i + 1}`}
                    >
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-medium">{r.party}</TableCell>
                      <TableCell className="text-right font-mono-nums text-debit">
                        {formatAmount(r.debit)}
                      </TableCell>
                      <TableCell className="text-right font-mono-nums text-credit">
                        {formatAmount(r.credit)}
                      </TableCell>
                      <TableCell className="text-right font-mono-nums font-semibold text-debit">
                        {formatAmount(r.net)}
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
