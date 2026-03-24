import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Scale } from "lucide-react";
import {
  getPartyBalance,
  getTallyTransactions,
  getUniqueParties,
} from "../store";
import { formatAmount } from "../utils";

export default function TrialBalancePage() {
  const allTx = getTallyTransactions();
  const parties = getUniqueParties(allTx);

  const rows = parties.map((p) => ({ party: p, ...getPartyBalance(allTx, p) }));
  const totDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totCredit = rows.reduce((s, r) => s + r.credit, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Trial Balance
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Party-wise debit and credit totals
        </p>
      </div>

      {rows.length === 0 ? (
        <div
          className="py-16 text-center text-muted-foreground"
          data-ocid="tally.trialbalance.empty_state"
        >
          No data. Upload transactions first.
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              {rows.length} accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Party / Account</TableHead>
                    <TableHead className="text-right">Debit (Dr)</TableHead>
                    <TableHead className="text-right">Credit (Cr)</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow
                      key={r.party}
                      data-ocid={`tally.trialbalance.item.${i + 1}`}
                    >
                      <TableCell className="font-medium">{r.party}</TableCell>
                      <TableCell className="text-right font-mono-nums text-debit">
                        {r.debit > 0 ? formatAmount(r.debit) : ""}
                      </TableCell>
                      <TableCell className="text-right font-mono-nums text-credit">
                        {r.credit > 0 ? formatAmount(r.credit) : ""}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono-nums font-medium ${r.net >= 0 ? "text-debit" : "text-credit"}`}
                      >
                        {formatAmount(Math.abs(r.net))}{" "}
                        {r.net >= 0 ? "Dr" : "Cr"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end gap-8 mt-4 px-4 py-3 bg-muted/30 rounded-lg">
              <span className="text-sm font-semibold">
                Total Debit:{" "}
                <span className="font-mono-nums text-debit">
                  {formatAmount(totDebit)}
                </span>
              </span>
              <span className="text-sm font-semibold">
                Total Credit:{" "}
                <span className="font-mono-nums text-credit">
                  {formatAmount(totCredit)}
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
