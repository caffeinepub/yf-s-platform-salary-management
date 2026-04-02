import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { BookMarked } from "lucide-react";
import { useMemo, useState } from "react";
import { getTallyTransactions, getUniqueParties } from "../store";
import { formatAmount, formatDate } from "../utils";

export default function LedgerPage() {
  const allTx = getTallyTransactions();
  const parties = getUniqueParties(allTx);
  const [party, setParty] = useState(parties[0] ?? "");

  const partyTx = useMemo(
    () =>
      allTx
        .filter((t) => t.party === party)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [allTx, party],
  );

  let running = 0;
  const rows = partyTx.map((tx) => {
    if (tx.entryType === "debit") running += tx.amount;
    else running -= tx.amount;
    return { ...tx, running };
  });

  const totDebit = partyTx
    .filter((t) => t.entryType === "debit")
    .reduce((s, t) => s + t.amount, 0);
  const totCredit = partyTx
    .filter((t) => t.entryType === "credit")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <BookMarked className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-gradient">
            Ledger
          </h1>
          <p className="text-sm text-muted-foreground">
            Account-wise transaction ledger
          </p>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-display font-bold text-gradient">
          Ledger
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Party-wise transaction ledger with running balance
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Select Party:</span>
        <Select value={party} onValueChange={setParty}>
          <SelectTrigger className="w-64" data-ocid="tally.ledger.party.select">
            <SelectValue placeholder="Select party..." />
          </SelectTrigger>
          <SelectContent>
            {parties.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {parties.length === 0 ? (
        <div
          className="py-16 text-center text-muted-foreground"
          data-ocid="tally.ledger.empty_state"
        >
          No data. Upload transactions first.
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-primary" />
                {party}
              </span>
              <div className="flex gap-6 text-sm">
                <span>
                  Dr:{" "}
                  <span className="font-mono-nums text-debit">
                    {formatAmount(totDebit)}
                  </span>
                </span>
                <span>
                  Cr:{" "}
                  <span className="font-mono-nums text-credit">
                    {formatAmount(totCredit)}
                  </span>
                </span>
                <span>
                  Net:{" "}
                  <span
                    className={`font-mono-nums ${totDebit >= totCredit ? "text-debit" : "text-credit"}`}
                  >
                    {formatAmount(Math.abs(totDebit - totCredit))}
                  </span>
                </span>
              </div>
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
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((tx) => (
                    <TableRow key={`${tx.slNo}-${tx.date}`}>
                      <TableCell>{formatDate(tx.date)}</TableCell>
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
                      <TableCell
                        className={`text-right font-mono-nums font-medium ${tx.running >= 0 ? "text-debit" : "text-credit"}`}
                      >
                        {formatAmount(Math.abs(tx.running))}{" "}
                        {tx.running >= 0 ? "Dr" : "Cr"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
