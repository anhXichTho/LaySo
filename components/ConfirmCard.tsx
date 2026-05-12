"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, Clapperboard, SkipForward, Clock, PartyPopper } from "lucide-react";
import { subscribeToQueue, subscribeToSession, subscribeToTheme } from "@/lib/store";
import { QueueItem, ThemeConfig, DEFAULT_THEME, estimateTime } from "@/lib/utils";
import Confetti from "./Confetti";

export default function ConfirmCard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const orderParam = searchParams.get("order");
  const nameParam = searchParams.get("name");

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [turnStartTime, setTurnStartTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);

  useEffect(() => {
    const unsub1 = subscribeToQueue(setQueue);
    const unsub2 = subscribeToSession((data) => {
      setStartTime(data.startTime);
      setTurnStartTime(data.turnStartTime);
    });
    const unsub3 = subscribeToTheme(setTheme);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const myOrder = orderParam ? parseInt(orderParam) : 0;
  const currentItem = queue.find((q) => q.status === "in-progress");
  const currentOrder = currentItem?.order ?? 0;
  const nextItem = queue.find((q) => q.status === "waiting");

  const myItem = queue.find((q) => q.id === id);
  const myStatus = myItem?.status ?? "waiting";
  const waitingBeforeMe = queue.filter(
    (q) => q.status === "waiting" && q.order < myOrder
  ).length + (currentItem ? 1 : 0);

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Số thứ tự #${myOrder}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  }

  if (!id || !orderParam) {
    return (
      <main
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: theme.bgColor }}
      >
        <div className="text-center p-8" style={{ color: theme.textColor }}>
          <p>Không tìm thấy thông tin. Vui lòng đăng ký lại.</p>
          <button onClick={() => router.push("/")} className="mt-4 underline">
            Quay lại đăng ký
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: theme.bgColor,
        backgroundImage: theme.bgImage ? `url(${theme.bgImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-md mx-auto space-y-5">
        <Confetti />

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-3">
            <PartyPopper className="w-8 h-8" style={{ color: theme.textColor }} />
          </div>
          <h1 className="text-2xl font-bold drop-shadow-lg" style={{ color: theme.textColor }}>
            Đăng Ký Thành Công!
          </h1>
          <p className="text-sm mt-1" style={{ color: `${theme.textColor}cc` }}>{nameParam}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-xl text-center space-y-4"
        >
          <p className="text-gray-500 text-sm font-medium">Số thứ tự của bạn</p>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-7xl font-black drop-shadow-sm"
            style={{
              backgroundImage: `linear-gradient(to right, ${theme.accentColor}, ${theme.buttonColor}, ${theme.headerColor})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            #{myOrder}
          </motion.div>

          {myStatus === "done" && (
            <div className="bg-green-50 rounded-2xl p-3 text-green-700 font-semibold">
              Bạn đã chụp xong!
            </div>
          )}
          {myStatus === "in-progress" && (
            <div className="bg-orange-50 rounded-2xl p-3 text-orange-700 font-semibold animate-pulse">
              Đang đến lượt bạn!
            </div>
          )}

          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
              <Clapperboard className="w-5 h-5 text-orange-500" />
              <span className="text-gray-700 text-sm">
                Đang chụp:{" "}
                <strong className="text-orange-600">
                  {currentItem ? `Số ${currentItem.order}` : "Chưa bắt đầu"}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
              <SkipForward className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700 text-sm">
                Sắp đến:{" "}
                <strong className="text-blue-600">
                  {nextItem ? `Số ${nextItem.order}` : "---"}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
              <Clock className="w-5 h-5 text-teal-500" />
              <span className="text-gray-700 text-sm">
                Dự kiến:{" "}
                <strong className="text-teal-600">
                  {estimateTime(myOrder, currentOrder, turnStartTime, waitingBeforeMe, theme.turnDuration, theme.boothCount)}
                </strong>
              </span>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/")}
            className="flex-1 py-3 rounded-2xl bg-white/20 backdrop-blur-sm font-semibold flex items-center justify-center gap-2 hover:bg-white/30 transition-colors"
            style={{ color: theme.textColor }}
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="flex-1 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-colors"
            style={{
              backgroundColor: theme.buttonColor,
              color: theme.buttonTextColor,
            }}
          >
            <Share2 className="w-4 h-4" /> {copied ? "Đã copy!" : "Chia sẻ"}
          </motion.button>
        </div>
      </div>
    </main>
  );
}
