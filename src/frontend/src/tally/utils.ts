// @ts-ignore
declare const XLSX: any;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const mon = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${mon},${year}`;
}

export function parseExcelFile(
  file: File,
  onSuccess: (rows: Record<string, unknown>[]) => void,
  onError: (msg: string) => void,
) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = e.target?.result as ArrayBuffer;
      const wb = XLSX.read(data, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, {
        raw: false,
      });
      onSuccess(rows);
    } catch (err) {
      onError(`Failed to parse file: ${err}`);
    }
  };
  reader.readAsArrayBuffer(file);
}
