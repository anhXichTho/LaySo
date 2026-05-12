"use client";

import { Clock, Video } from "lucide-react";

export default function WarningBox() {
  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 space-y-2">
      <div className="flex items-start gap-2">
        <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-amber-800 text-sm font-medium">
          BTC chỉ giữ lượt chụp trong <strong>5 phút</strong>. Vui lòng đến đúng giờ!
        </p>
      </div>
      <div className="flex items-start gap-2">
        <Video className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-amber-800 text-sm font-medium">
          Mỗi lượt chụp diễn ra trong <strong>10 phút</strong>.
        </p>
      </div>
    </div>
  );
}
