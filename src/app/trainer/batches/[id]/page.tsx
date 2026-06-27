// ============================================================
// TRAINER BATCH DETAIL PAGE
// ============================================================

"use client";

import { BatchDetailView } from "@/components/shared/batch-detail-view";

export default function TrainerBatchDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <BatchDetailView batchId={params.id} role="TRAINER" />;
}
