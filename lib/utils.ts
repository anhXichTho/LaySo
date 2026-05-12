export interface QueueItem {
  id: string;
  name: string;
  phone: string;
  registeredAt: number;
  status: "waiting" | "in-progress" | "done";
  order: number;
}

export interface ThemeConfig {
  bgColor: string;
  bgImage: string;
  buttonColor: string;
  buttonTextColor: string;
  textColor: string;
  headerColor: string;
  accentColor: string;
}

export const DEFAULT_THEME: ThemeConfig = {
  bgColor: "#0f172a",
  bgImage: "",
  buttonColor: "#3b82f6",
  buttonTextColor: "#ffffff",
  textColor: "#f8fafc",
  headerColor: "#1e3a8a",
  accentColor: "#14b8a6",
};

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export function estimateTime(
  order: number,
  currentOrder: number,
  turnStartTime: number | null,
  waitingBeforeMe: number
): string {
  if (!turnStartTime) return "Chưa bắt đầu";
  if (order <= currentOrder) return "Sắp đến lượt!";
  const TURN_DURATION = 10 * 60 * 1000;
  const elapsed = Date.now() - turnStartTime;
  const remaining = Math.max(0, TURN_DURATION - elapsed);
  const estimatedMs = Date.now() + remaining + (waitingBeforeMe - 1) * TURN_DURATION;
  return formatTime(estimatedMs);
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60000) % 60;
  const hours = Math.floor(ms / 3600000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
