import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { getTallyTransactions } from "../store";
import { formatAmount, formatDate } from "../utils";

export default function JournalPage() {
  const allTx = getTallyTransactions();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return allTx.filter((tx) => {
      if (
        search &&
        !tx.party.toLowerCase().includes(search.toLowerCase()) &&
        !tx.narration.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (typeFilter !== "all" && tx.entryType !== typeFilter) return false;
      if (dateFrom && tx.date < dateFrom) return false;
      if (dateTo && tx.date > dateTo) return false;
      return true;
    });
  }, [allTx, search, typeFilter, dateFrom, dateTo]);

  const totalDebit = filtered
    .filter((t) => t.entryType === "debit")
    .reduce((s, t) => s + t.amount, 0);
  const totalCredit = filtered
    .filter((t) => t.entryType === "credit")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-gradient">
            Journal
          </h1>
          <p className="text-sm text-muted-foreground">
            View all journal entries
          </p>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-display font-bold text-gradient">
          Journal
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          All transactions with filters
        </p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-40">
              <span className="text-xs text-muted-foreground mb-1 block">
                Search party / narration
              </span>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-ocid="tally.journal.search_input"
                />
              </div>
            </div>
            <div className="w-36">
              <span className="text-xs text-muted-foreground mb-1 block">
                Type
              </span>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger data-ocid="tally.journal.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">
                From
              </span>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-36"
                data-ocid="tally.journal.datefrom.input"
              />
            </div>
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">
                To
              </span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-36"
                data-ocid="tally.journal.dateto.input"
              />
            </div>
            {(search || typeFilter !== "all" || dateFrom || dateTo) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setDateFrom("");
                  setDateTo("");
                }}
                data-ocid="tally.journal.clear.button"
              >
                <X className="w-4 h-4 mr-1" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Total Debit</p>
            <p className="font-mono-nums font-bold text-debit text-lg">
              {formatAmount(totalDebit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Total Credit</p>
            <p className="font-mono-nums font-bold text-credit text-lg">
              {formatAmount(totalCredit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p
              className={`font-mono-nums font-bold text-lg ${totalDebit >= totalCredit ? "text-debit" : "text-credit"}`}
            >
              {formatAmount(Math.abs(totalDebit - totalCredit))}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {filtered.length} entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div
              className="py-16 text-center text-muted-foreground"
              data-ocid="tally.journal.empty_state"
            >
              No transactions found. Upload data first.
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
                  {filtered.map((tx, i) => (
                    <TableRow
                      key={`${tx.slNo}-${tx.date}-${tx.party}`}
                      data-ocid={`tally.journal.item.${i + 1}`}
                    >
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
