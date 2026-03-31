import { Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import AddTransactionPage from "./pages/AddTransactionPage";
import BalanceSheetPage from "./pages/BalanceSheetPage";
import BankBookPage from "./pages/BankBookPage";
import CashBookPage from "./pages/CashBookPage";
import DayBookPage from "./pages/DayBookPage";
import JournalPage from "./pages/JournalPage";
import LedgerPage from "./pages/LedgerPage";
import PayablesPage from "./pages/PayablesPage";
import ProfitLossPage from "./pages/ProfitLossPage";
import PurchaseRegisterPage from "./pages/PurchaseRegisterPage";
import ReceivablesPage from "./pages/ReceivablesPage";
import SalesRegisterPage from "./pages/SalesRegisterPage";
import StockSummaryPage from "./pages/StockSummaryPage";
import TallyDashboardPage from "./pages/TallyDashboardPage";
import TrialBalancePage from "./pages/TrialBalancePage";
import UploadPage from "./pages/UploadPage";
import type { TallyPage } from "./types";

function TransactionsPage(_: { onNavigate: (p: TallyPage) => void }) {
  const [tab, setTab] = useState<"upload" | "add">("upload");
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <Upload className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">
            Transactions
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload or manually enter transactions
          </p>
        </div>
      </div>
      <div className="flex gap-1 bg-muted/40 rounded-lg p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
            tab === "upload"
              ? "gradient-primary text-white glow-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          data-ocid="tally.transactions.upload.tab"
        >
          Upload Excel
        </button>
        <button
          type="button"
          onClick={() => setTab("add")}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
            tab === "add"
              ? "gradient-primary text-white glow-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          data-ocid="tally.transactions.add.tab"
        >
          Add Transaction
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "upload" ? <UploadPage /> : <AddTransactionPage />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function renderPage(page: TallyPage, onNavigate: (p: TallyPage) => void) {
  switch (page) {
    case "dashboard":
      return <TallyDashboardPage onNavigate={onNavigate} />;
    case "transactions":
      return <TransactionsPage onNavigate={onNavigate} />;
    case "journal":
      return <JournalPage />;
    case "ledger":
      return <LedgerPage />;
    case "trialbalance":
      return <TrialBalancePage />;
    case "daybook":
      return <DayBookPage />;
    case "balancesheet":
      return <BalanceSheetPage />;
    case "profitloss":
      return <ProfitLossPage />;
    case "cashbook":
      return <CashBookPage />;
    case "bankbook":
      return <BankBookPage />;
    case "purchase":
      return <PurchaseRegisterPage />;
    case "sales":
      return <SalesRegisterPage />;
    case "stock":
      return <StockSummaryPage />;
    case "receivables":
      return <ReceivablesPage />;
    case "payables":
      return <PayablesPage />;
    default:
      return <TallyDashboardPage onNavigate={onNavigate} />;
  }
}

interface TallyAppProps {
  currentPage: TallyPage;
  onNavigate: (p: TallyPage) => void;
}

export default function TallyApp({ currentPage, onNavigate }: TallyAppProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {renderPage(currentPage, onNavigate)}
      </motion.div>
    </AnimatePresence>
  );
}
