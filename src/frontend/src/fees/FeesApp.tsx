import { AnimatePresence, motion } from "motion/react";
import CollectFeePage from "./pages/CollectFeePage";
import FeeStructurePage from "./pages/FeeStructurePage";
import FeesDashboardPage from "./pages/FeesDashboardPage";
import FeesReportsPage from "./pages/FeesReportsPage";
import PaymentsPage from "./pages/PaymentsPage";
import StudentsPage from "./pages/StudentsPage";
import type { FeesPage } from "./types";

function renderPage(page: FeesPage, onNavigate: (p: FeesPage) => void) {
  switch (page) {
    case "dashboard":
      return <FeesDashboardPage onNavigate={onNavigate} />;
    case "students":
      return <StudentsPage />;
    case "feestructure":
      return <FeeStructurePage />;
    case "collectfee":
      return <CollectFeePage />;
    case "payments":
      return <PaymentsPage />;
    case "reports":
      return <FeesReportsPage />;
    default:
      return <FeesDashboardPage onNavigate={onNavigate} />;
  }
}

interface FeesAppProps {
  currentPage: FeesPage;
  onNavigate: (p: FeesPage) => void;
}

export default function FeesApp({ currentPage, onNavigate }: FeesAppProps) {
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
