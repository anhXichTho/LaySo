"use client";

import { Suspense } from "react";
import ConfirmCard from "@/components/ConfirmCard";

function ConfirmContent() {
  return <ConfirmCard />;
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center p-4">
          <div className="text-white text-lg">Đang tải...</div>
        </main>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
