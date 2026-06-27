// ============================================================
// ADMIN BATCH DETAIL PAGE — /admin/batches/[id]
// ============================================================

import { use } from "react";
import BatchDetailView from "@/components/shared/batch-detail-view";

export const metadata = { title: "Batch Details" };

export default function AdminBatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <BatchDetailView batchId={id} backHref="/admin/batches" role="admin" />;
}
