"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Play,
  CheckCircle,
  Undo2,
  LogOut,
  Users,
  Clapperboard,
  Timer,
  BarChart3,
  Trash2,
} from "lucide-react";
import LoginForm from "@/components/LoginForm";
import QueueList from "@/components/QueueList";
import ThemeConfigurator from "@/components/ThemeConfigurator";
import {
  subscribeToQueue,
  updateQueueItemStatus,
  saveStartTime,
  saveTurnStartTime,
  subscribeToSession,
  getThemeConfig,
  clearAllQueue,
} from "@/lib/store";
import { QueueItem, ThemeConfig, DEFAULT_THEME, formatDuration } from "@/lib/utils";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);

  useEffect(() => {
    const saved = typeof window !== "undefined" && sessionStorage.getItem("adminLoggedIn");
    if (saved === "true") setLoggedIn(true);
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    const unsub1 = subscribeToQueue(setQueue);
    const unsub2 = subscribeToSession((data) => setStartTime(data.startTime));
    getThemeConfig().then(setTheme);
    return () => { unsub1(); unsub2(); };
  }, [loggedIn]);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const currentItem = queue.find((q) => q.status === "in-progress");
  const waitingItems = queue.filter((q) => q.status === "waiting");
  const doneItems = queue.filter((q) => q.status === "done");

  function handleLogin() {
    setLoggedIn(true);
    sessionStorage.setItem("adminLoggedIn", "true");
  }

  function handleLogout() {
    setLoggedIn(false);
    sessionStorage.removeItem("adminLoggedIn");
  }

  async function handleStart() {
    if (waitingItems.length === 0) return;
    const first = waitingItems[0];
    await updateQueueItemStatus(first.id, "in-progress");
    if (!startTime) {
      await saveStartTime(Date.now());
    }
  }

  async function handleComplete() {
    if (!currentItem) return;
    await updateQueueItemStatus(currentItem.id, "done");
    if (waitingItems.length > 0) {
      await updateQueueItemStatus(waitingItems[0].id, "in-progress");
      await saveTurnStartTime(Date.now());
    }
  }

  async function handleGoBack() {
    if (!currentItem) return;
    await updateQueueItemStatus(currentItem.id, "waiting");
    if (doneItems.length > 0) {
      const lastDone = doneItems[doneItems.length - 1];
      await updateQueueItemStatus(lastDone.id, "in-progress");
    }
  }

  async function handleClearAll() {
    if (!confirm("Bạn có chắc muốn XÓA TOÀN BỘ danh sách? Hành động này không thể hoàn tác!")) return;
    await clearAllQueue();
  }

  if (!loggedIn) return <LoginForm onLogin={handleLogin} />;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: theme.bgColor,
        backgroundImage: theme.bgImage ? `url(${theme.bgImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-40 backdrop-blur-md border-b border-white/10"
        style={{ backgroundColor: `${theme.headerColor}ee` }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ color: theme.textColor }}>
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <ThemeConfigurator theme={theme} onUpdate={setTheme} />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors text-sm font-semibold"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5" style={{ color: theme.accentColor }} />
              <span className="text-sm font-medium" style={{ color: `${theme.textColor}aa` }}>
                Tổng đã đăng ký
              </span>
            </div>
            <p className="text-3xl font-bold" style={{ color: theme.textColor }}>
              {queue.length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-1">
              <Clapperboard className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-medium" style={{ color: `${theme.textColor}aa` }}>
                Đang chụp
              </span>
            </div>
            <p className="text-lg font-bold truncate" style={{ color: theme.textColor }}>
              {currentItem ? currentItem.name : "Chưa bắt đầu"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-1">
              <Timer className="w-5 h-5 text-teal-400" />
              <span className="text-sm font-medium" style={{ color: `${theme.textColor}aa` }}>
                Thời gian
              </span>
            </div>
            <p className="text-3xl font-bold font-mono" style={{ color: theme.textColor }}>
              {startTime ? formatDuration(elapsed) : "00:00:00"}
            </p>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {!currentItem ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              disabled={waitingItems.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
              style={{
                backgroundColor: theme.buttonColor,
                color: theme.buttonTextColor,
              }}
            >
              <Play className="w-4 h-4" /> Bắt đầu chụp
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                <CheckCircle className="w-4 h-4" /> Hoàn tất lượt
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoBack}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
              >
                <Undo2 className="w-4 h-4" /> Quay lại
              </motion.button>
            </>
          )}

          {queue.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg bg-red-600 text-white hover:bg-red-700 transition-colors ml-auto"
            >
              <Trash2 className="w-4 h-4" /> Xóa toàn bộ
            </button>
          )}
        </div>

        {/* Queue */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Danh sách chờ
            </h2>
            <span className="text-sm text-gray-500">
              {waitingItems.length} đang chờ / {doneItems.length} đã xong
            </span>
          </div>
          <div className="p-3 max-h-[60vh] overflow-y-auto">
            <QueueList items={queue} />
          </div>
        </div>
      </div>
    </div>
  );
}
