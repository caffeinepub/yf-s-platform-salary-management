import { Cloud, CloudOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getSyncStatus, onSyncStatusChange } from "../services/backendSync";

export default function SyncIndicator() {
  const [status, setStatus] = useState(getSyncStatus());

  useEffect(() => {
    return onSyncStatusChange(setStatus);
  }, []);

  if (status === "idle" || status === "ok") {
    return (
      <div
        title="Data saved to cloud"
        className="flex items-center gap-1 text-xs"
        style={{ color: "oklch(0.60 0.15 155)" }}
      >
        <Cloud className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Saved</span>
      </div>
    );
  }

  if (status === "syncing") {
    return (
      <div
        title="Syncing data..."
        className="flex items-center gap-1 text-xs"
        style={{ color: "oklch(0.70 0.18 260)" }}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span className="hidden sm:inline">Saving...</span>
      </div>
    );
  }

  // error
  return (
    <div
      title="Could not save to server. Check your connection."
      className="flex items-center gap-1 text-xs cursor-help"
      style={{ color: "oklch(0.60 0.22 25)" }}
    >
      <CloudOff className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Sync error</span>
    </div>
  );
}
