import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  FileText,
  PlusCircle,
  Scale,
  TrendingUp,
} from "lucide-react";
import { getTallyTransactions } from "../store";
import type { TallyPage } from "../types";
import { formatAmount, formatDate } from "../utils";

interface Props {
  onNavigate: (page: TallyPage) => void;
}

export default function TallyDashboardPage({ onNavigate }: Props) {
  const txs = getTallyTransactions();

  const totalDebit = txs
    .filter((t) => t.entryType === "debit")
    .reduce((s, t) => s + t.amount, 0);
  const totalCredit = txs
    .filter((t) => t.entryType === "credit")
    .reduce((s, t) => s + t.amount, 0);
  const netBalance = totalDebit - totalCredit;

  // Party-wise summary
  const partyMap: Record<
    string,
    { debit: number; credit: number; count: number }
  > = {};
  for (const tx of txs) {
    if (!partyMap[tx.party])
      partyMap[tx.party] = { debit: 0, credit: 0, count: 0 };
    if (tx.entryType === "debit") partyMap[tx.party].debit += tx.amount;
    else partyMap[tx.party].credit += tx.amount;
    partyMap[tx.party].count += 1;
  }
  const topParties = Object.entries(partyMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  const recent = [...txs].reverse().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">
            Tally Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Overview of your accounting records
          </p>
        </div>
      </div>
      <div className="flex items-end justify-end">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate("transactions")}
          >
            <FileText className="w-4 h-4 mr-1" /> Upload
          </Button>
          <Button size="sm" onClick={() => onNavigate("transactions")}>
            <PlusCircle className="w-4 h-4 mr-1" /> Add Transaction
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-red-500" /> Total Debits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono-nums text-debit">
              {formatAmount(totalDebit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4 text-green-500" /> Total Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono-nums text-credit">
              {formatAmount(totalCredit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" /> Net Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold font-mono-nums ${
                netBalance >= 0 ? "text-debit" : "text-credit"
              }`}
            >
              {formatAmount(Math.abs(netBalance))}
            </p>
            <p className="text-xs text-muted-foreground">
              {netBalance >= 0 ? "Net Debit" : "Net Credit"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">
                No transactions yet. Upload or add transactions to get started.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((tx) => (
                    <TableRow key={tx.slNo}>
                      <TableCell className="text-xs">
                        {formatDate(tx.date)}
                      </TableCell>
                      <TableCell className="text-xs font-medium max-w-[120px] truncate">
                        {tx.party}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            tx.entryType === "debit"
                              ? "text-debit border-debit/30 bg-debit/10 text-xs"
                              : "text-credit border-credit/30 bg-credit/10 text-xs"
                          }
                        >
                          {tx.entryType}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right text-xs font-mono-nums ${
                          tx.entryType === "debit"
                            ? "text-debit"
                            : "text-credit"
                        }`}
                      >
                        {formatAmount(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Top Parties */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Parties</CardTitle>
          </CardHeader>
          <CardContent>
            {topParties.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No party data available.
              </p>
            ) : (
              <div className="space-y-3">
                {topParties.map(([party, data]) => (
                  <div
                    key={party}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium truncate max-w-[180px]">
                        {party}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {data.count} transaction{data.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-debit">
                        Dr: {formatAmount(data.debit)}
                      </p>
                      <p className="text-xs text-credit">
                        Cr: {formatAmount(data.credit)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("transactions")}
          >
            <FileText className="w-4 h-4 mr-1" /> Upload Transactions
          </Button>
          <Button size="sm" onClick={() => onNavigate("transactions")}>
            <PlusCircle className="w-4 h-4 mr-1" /> Add Transaction
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("ledger")}
          >
            <Scale className="w-4 h-4 mr-1" /> View Ledger
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("trialbalance")}
          >
            <TrendingUp className="w-4 h-4 mr-1" /> Trial Balance
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
