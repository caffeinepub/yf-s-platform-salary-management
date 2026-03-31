import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";
import { getTallyTransactions, getUniqueParties } from "../store";
import { formatAmount } from "../utils";

export default function ProfitLossPage() {
  const allTx = getTallyTransactions();
  const parties = getUniqueParties(allTx);

  const income: { party: string; amount: number }[] = [];
  const expenses: { party: string; amount: number }[] = [];

  for (const p of parties) {
    const credit = allTx
      .filter((t) => t.party === p && t.entryType === "credit")
      .reduce((s, t) => s + t.amount, 0);
    const debit = allTx
      .filter((t) => t.party === p && t.entryType === "debit")
      .reduce((s, t) => s + t.amount, 0);
    if (credit > 0) income.push({ party: p, amount: credit });
    if (debit > 0) expenses.push({ party: p, amount: debit });
  }

  const totIncome = income.reduce((s, r) => s + r.amount, 0);
  const totExpenses = expenses.reduce((s, r) => s + r.amount, 0);
  const netProfit = totIncome - totExpenses;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">
            Profit & Loss
          </h1>
          <p className="text-sm text-muted-foreground">
            Income and expenditure summary
          </p>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Profit &amp; Loss
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Income vs Expenses summary by party
        </p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Total Income</p>
              <p className="font-mono-nums font-bold text-credit text-xl">
                {formatAmount(totIncome)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Expenses</p>
              <p className="font-mono-nums font-bold text-debit text-xl">
                {formatAmount(totExpenses)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Net {netProfit >= 0 ? "Profit" : "Loss"}
              </p>
              <p
                className={`font-mono-nums font-bold text-xl ${netProfit >= 0 ? "text-credit" : "text-debit"}`}
              >
                {formatAmount(Math.abs(netProfit))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {allTx.length === 0 ? (
        <div
          className="py-16 text-center text-muted-foreground"
          data-ocid="tally.profitloss.empty_state"
        >
          No data. Upload transactions first.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-credit">
                <TrendingUp className="w-5 h-5" />
                Income (Credits)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {income
                .sort((a, b) => b.amount - a.amount)
                .map((r) => (
                  <div
                    key={r.party}
                    className="flex justify-between py-2 border-b border-border/30 last:border-0"
                  >
                    <span className="text-sm">{r.party}</span>
                    <span className="font-mono-nums text-credit font-medium">
                      {formatAmount(r.amount)}
                    </span>
                  </div>
                ))}
              <div className="flex justify-between pt-3 font-bold">
                <span>Total</span>
                <span className="font-mono-nums text-credit">
                  {formatAmount(totIncome)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-debit">
                <TrendingUp className="w-5 h-5 rotate-180" />
                Expenses (Debits)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expenses
                .sort((a, b) => b.amount - a.amount)
                .map((r) => (
                  <div
                    key={r.party}
                    className="flex justify-between py-2 border-b border-border/30 last:border-0"
                  >
                    <span className="text-sm">{r.party}</span>
                    <span className="font-mono-nums text-debit font-medium">
                      {formatAmount(r.amount)}
                    </span>
                  </div>
                ))}
              <div className="flex justify-between pt-3 font-bold">
                <span>Total</span>
                <span className="font-mono-nums text-debit">
                  {formatAmount(totExpenses)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
