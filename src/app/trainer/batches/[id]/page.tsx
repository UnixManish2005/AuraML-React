// ============================================================
// TRAINER BATCH DETAIL PAGE
// ============================================================

"use client";

import BatchDetailView from "@/components/shared/batch-detail-view";
import { use } from "react";

export default function TrainerBatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <BatchDetailView batchId={id} role="trainer" />;
}
