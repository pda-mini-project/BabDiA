"use client";

import { Suspense } from "react";
import RecommendResultContent from "@/features/recommend/RecommendResultContent";

function ResultFallback() {
  return (
    <div style={{ padding: 48, textAlign: "center" }}>
      로딩 중...
    </div>
  );
}

export default function RecommendResultPage() {
  return (
    <Suspense fallback={<ResultFallback />}>
      <RecommendResultContent />
    </Suspense>
  );
}
