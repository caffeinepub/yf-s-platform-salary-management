import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function StockSummaryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">
            Stock Summary
          </h1>
          <p className="text-sm text-muted-foreground">
            Inventory and stock overview
          </p>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Stock Summary
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Inventory stock overview
        </p>
      </div>
      <Card>
        <CardContent className="py-16 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">
            Stock summary not available
          </p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            Import stock data from Excel to view stock summary.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
