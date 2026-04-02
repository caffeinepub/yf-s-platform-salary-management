import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight } from "lucide-react";
import {
  getPartyBalance,
  getTallyTransactions,
  getUniqueParties,
} from "../store";
import { formatAmount } from "../utils";

export default function PayablesPage() {
  const allTx = getTallyTransactions();
  const parties = getUniqueParties(allTx);

  const payables = parties
    .map((p) => ({ party: p, ...getPartyBalance(allTx, p) }))
    .filter((r) => r.net < 0)
    .sort((a, b) => a.net - b.net);

  const total = payables.reduce((s, r) => s + Math.abs(r.net), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <ArrowUpRight className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-gradient">
            Payables
          </h1>
          <p className="text-sm text-muted-foreground">
            Outstanding amounts to pay
          </p>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-display font-bold text-gradient">
          Payables
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Parties where credit exceeds debit (amounts you owe)
        </p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total Payable</p>
          <p className="font-mono-nums font-bold text-credit text-xl">
            {formatAmount(total)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-credit" />
            {payables.length} parties
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payables.length === 0 ? (
            <div
              className="py-16 text-center text-muted-foreground"
              data-ocid="tally.payables.empty_state"
            >
              No payables found.
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
                    <TableHead className="text-right">Net Payable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payables.map((r, i) => (
                    <TableRow
                      key={r.party}
                      data-ocid={`tally.payables.item.${i + 1}`}
                    >
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-medium">{r.party}</TableCell>
                      <TableCell className="text-right font-mono-nums text-debit">
                        {formatAmount(r.debit)}
                      </TableCell>
                      <TableCell className="text-right font-mono-nums text-credit">
                        {formatAmount(r.credit)}
                      </TableCell>
                      <TableCell className="text-right font-mono-nums font-semibold text-credit">
                        {formatAmount(Math.abs(r.net))}
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
