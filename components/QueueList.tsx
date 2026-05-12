"use client";

import { motion } from "framer-motion";
import { QueueItem } from "@/lib/utils";
import { User, Phone, Clock } from "lucide-react";

interface Props {
  items: QueueItem[];
}

const statusConfig = {
  waiting: { label: "Chờ", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  "in-progress": { label: "Đang chụp", bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  done: { label: "Xong", bg: "bg-sky-100", text: "text-sky-700", dot: "bg-sky-500" },
};

export default function QueueList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">Chưa có ai đăng ký</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const sc = statusConfig[item.status];
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              item.status === "in-progress"
                ? "border-orange-300 bg-orange-50 shadow-md"
                : item.status === "done"
                ? "border-sky-200 bg-sky-50/50 opacity-60"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm shrink-0">
              {item.order}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate text-sm flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {item.name}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {item.phone}
              </p>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${sc.bg} ${sc.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${item.status === "in-progress" ? "animate-pulse" : ""}`} />
              {sc.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
