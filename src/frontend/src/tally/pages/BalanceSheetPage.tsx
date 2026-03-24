import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid } from "lucide-react";
import {
  getPartyBalance,
  getTallyTransactions,
  getUniqueParties,
} from "../store";
import { formatAmount } from "../utils";

export default function BalanceSheetPage() {
  const allTx = getTallyTransactions();
  const parties = getUniqueParties(allTx);

  const rows = parties.map((p) => ({ party: p, ...getPartyBalance(allTx, p) }));
  const assets = rows.filter((r) => r.net > 0);
  const liabilities = rows.filter((r) => r.net < 0);

  const totAssets = assets.reduce((s, r) => s + r.net, 0);
  const totLiabilities = liabilities.reduce((s, r) => s + Math.abs(r.net), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Balance Sheet
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Assets vs Liabilities
        </p>
      </div>

      {rows.length === 0 ? (
        <div
          className="py-16 text-center text-muted-foreground"
          data-ocid="tally.balancesheet.empty_state"
        >
          No data. Upload transactions first.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-debit">
                <LayoutGrid className="w-5 h-5" />
                Assets (Debit Balance)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assets.map((r) => (
                  <div
                    key={r.party}
                    className="flex justify-between items-center py-2 border-b border-border/30 last:border-0"
                  >
                    <span className="text-sm font-medium">{r.party}</span>
                    <span className="font-mono-nums text-debit font-semibold">
                      {formatAmount(r.net)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 font-bold">
                  <span>Total Assets</span>
                  <span className="font-mono-nums text-debit">
                    {formatAmount(totAssets)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-credit">
                <LayoutGrid className="w-5 h-5" />
                Liabilities (Credit Balance)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {liabilities.map((r) => (
                  <div
                    key={r.party}
                    className="flex justify-between items-center py-2 border-b border-border/30 last:border-0"
                  >
                    <span className="text-sm font-medium">{r.party}</span>
                    <span className="font-mono-nums text-credit font-semibold">
                      {formatAmount(Math.abs(r.net))}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 font-bold">
                  <span>Total Liabilities</span>
                  <span className="font-mono-nums text-credit">
                    {formatAmount(totLiabilities)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
