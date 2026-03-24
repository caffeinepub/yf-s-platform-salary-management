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
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { saveTallyTransactions } from "../store";
import type { Transaction } from "../types";
import { formatAmount, formatDate, parseExcelFile } from "../utils";

interface ExcelRow {
  slNo?: unknown;
  "sl no"?: unknown;
  slno?: unknown;
  date?: unknown;
  Date?: unknown;
  party?: unknown;
  Party?: unknown;
  narration?: unknown;
  Narration?: unknown;
  chequeNo?: unknown;
  "cheque no"?: unknown;
  chequeno?: unknown;
  amount?: unknown;
  Amount?: unknown;
  entryType?: unknown;
  "entry type"?: unknown;
  type?: unknown;
  [key: string]: unknown;
}

function downloadSampleFile() {
  const csv = [
    "slNo,date,party,narration,chequeNo,amount,entryType",
    "1,2026-01-15,ABC Traders,Purchase of stationery,CHQ001,5000,debit",
    "2,2026-01-16,XYZ Suppliers,Payment received,,12000,credit",
    "3,2026-01-20,Ram & Co,Office rent payment,,15000,debit",
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tally_transactions_sample.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function UploadPage() {
  const [preview, setPreview] = useState<Transaction[]>([]);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setError("");
    setPreview([]);
    parseExcelFile(
      file,
      (rows) => {
        const txs: Transaction[] = (rows as ExcelRow[]).map((row, i) => ({
          slNo: Number(row.slNo ?? row["sl no"] ?? row.slno ?? i + 1),
          date: String(row.date ?? row.Date ?? ""),
          party: String(row.party ?? row.Party ?? ""),
          narration: String(row.narration ?? row.Narration ?? ""),
          chequeNo: String(
            row.chequeNo ?? row["cheque no"] ?? row.chequeno ?? "",
          ),
          amount: Number(row.amount ?? row.Amount ?? 0),
          entryType: (String(
            row.entryType ?? row["entry type"] ?? row.type ?? "debit",
          ).toLowerCase() === "credit"
            ? "credit"
            : "debit") as "debit" | "credit",
        }));
        if (txs.length === 0) {
          setError("No rows found. Check your Excel format.");
          return;
        }
        setPreview(txs);
      },
      (msg) => setError(msg),
    );
  }

  function confirmUpload() {
    setConfirming(true);
    saveTallyTransactions(preview);
    toast.success(`${preview.length} transactions uploaded successfully`);
    setPreview([]);
    setConfirming(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Upload Transactions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload an Excel/CSV file with columns: slNo, date, party, narration,
            chequeNo, amount, entryType
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadSampleFile}
          data-ocid="tally.upload.sample_download.button"
        >
          <Download className="w-4 h-4 mr-1" /> Sample File
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Select Excel File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all ${
              dragging
                ? "border-primary bg-primary/10"
                : "border-border/60 hover:border-primary/60 hover:bg-primary/5"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            data-ocid="tally.upload.dropzone"
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-2">
              Drag &amp; drop Excel file here, or
            </p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Browse File
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              .xlsx / .xls / .csv files accepted
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            data-ocid="tally.upload_button"
          />

          {error && (
            <div
              className="mt-4 flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg"
              data-ocid="tally.upload.error_state"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Preview — {preview.length} rows
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPreview([]);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  data-ocid="tally.upload.cancel_button"
                >
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={confirmUpload}
                  disabled={confirming}
                  data-ocid="tally.upload.confirm_button"
                >
                  <Upload className="w-4 h-4 mr-1" /> Confirm Upload
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sl No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Narration</TableHead>
                    <TableHead>Cheque No</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.slice(0, 50).map((tx) => (
                    <TableRow key={`${tx.slNo}-${tx.party}-${tx.date}`}>
                      <TableCell>{tx.slNo}</TableCell>
                      <TableCell>{formatDate(tx.date)}</TableCell>
                      <TableCell className="font-medium">{tx.party}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {tx.narration}
                      </TableCell>
                      <TableCell>{tx.chequeNo || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            tx.entryType === "debit"
                              ? "text-debit border-destructive/40"
                              : "text-credit border-green-600/40"
                          }
                        >
                          {tx.entryType}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono-nums ${
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
            </div>
            {preview.length > 50 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Showing first 50 of {preview.length} rows
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
