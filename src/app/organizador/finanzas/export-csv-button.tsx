"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportTransactionsCsv } from "@/lib/actions/finance";
import type { FinanceFilters } from "@/lib/finance";

function ExportCsvButton({ filters }: { filters: FinanceFilters }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const { csv, error } = await exportTransactionsCsv(filters);
      if (error || !csv) return;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transacciones-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      <Download className="size-4" /> {loading ? "Exportando…" : "Exportar CSV"}
    </Button>
  );
}

export { ExportCsvButton };
