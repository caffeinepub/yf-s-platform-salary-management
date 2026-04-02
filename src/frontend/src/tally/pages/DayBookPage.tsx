import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, X } from "lucide-react";
import { useMemo, useState } from "react";
import { getTallyTransactions } from "../store";
import { formatAmount, formatDate } from "../utils";

export default function DayBookPage() {
  const allTx = getTallyTransactions();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return allTx
      .filter((tx) => {
        if (dateFrom && tx.date < dateFrom) return false;
        if (dateTo && tx.date > dateTo) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [allTx, dateFrom, dateTo]);

  const totDebit = filtered
    .filter((t) => t.entryType === "debit")
    .reduce((s, t) => s + t.amount, 0);
  const totCredit = filtered
    .filter((t) => t.entryType === "credit")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-gradient">
            Day Book
          </h1>
          <p className="text-sm text-muted-foreground">
            Day-wise transaction records
          </p>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-display font-bold text-gradient">
          Day Book
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          All transactions in date order
        </p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">
                From Date
              </span>
              <Input
                type="date"
                id="daybook-from"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
                data-ocid="tally.daybook.datefrom.input"
              />
            </div>
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">
                To Date
              </span>
              <Input
                type="date"
                id="daybook-to"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
                data-ocid="tally.daybook.dateto.input"
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                data-ocid="tally.daybook.clear.button"
              >
                <X className="w-4 h-4 mr-1" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Debit</p>
            <p className="font-mono-nums font-bold text-debit text-lg">
              {formatAmount(totDebit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Credit</p>
            <p className="font-mono-nums font-bold text-credit text-lg">
              {formatAmount(totCredit)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {filtered.length} entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div
              className="py-16 text-center text-muted-foreground"
              data-ocid="tally.daybook.empty_state"
            >
              No entries for selected range.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sl No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Narration</TableHead>
                    <TableHead>Cheque No</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((tx) => (
                    <TableRow key={`${tx.slNo}-${tx.date}-${tx.party}`}>
                      <TableCell>{tx.slNo}</TableCell>
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
