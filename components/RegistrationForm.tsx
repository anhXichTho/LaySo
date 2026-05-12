"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Sparkles, User, Phone, Mail, Eye } from "lucide-react";
import WarningBox from "./WarningBox";
import { addToQueue, subscribeToQueue } from "@/lib/store";
import { ThemeConfig, DEFAULT_THEME, QueueItem } from "@/lib/utils";

interface Props {
  theme?: ThemeConfig;
}

export default function RegistrationForm({ theme = DEFAULT_THEME }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);

  useEffect(() => {
    const unsub = subscribeToQueue(setQueue);
    return () => unsub();
  }, []);

  const isPhoneValid = /^[0-9]{10,11}$/.test(phone);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const existingEntries = queue.filter((q) => q.email === email.trim().toLowerCase() && isEmailValid);
  const isFormValid = name.trim().length > 0 && isPhoneValid && isEmailValid && agreed && existingEntries.length === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    if (existingEntries.length > 0) {
      setError("Email này đã được đăng ký. Bấm vào số thứ tự ở trên để xem.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const item = await addToQueue(name.trim(), phone.trim(), email.trim().toLowerCase());
      const params = new URLSearchParams({
        id: item.id,
        order: item.order.toString(),
        name: item.name,
      });
      router.push(`/confirm?${params.toString()}`);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err?.message || "Có lỗi xảy ra, vui lòng thử lại!");
      setLoading(false);
    }
  }

  function viewExisting(item: QueueItem) {
    const params = new URLSearchParams({
      id: item.id,
      order: item.order.toString(),
      name: item.name,
    });
    router.push(`/confirm?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto space-y-5 animate-[fadeIn_0.5s_ease-out]"
    >
      <div className="text-center space-y-2 animate-[slideDown_0.5s_ease-out]">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-2">
          <Camera className="w-10 h-10" style={{ color: theme.textColor }} />
        </div>
        <h1 className="text-3xl font-bold drop-shadow-lg" style={{ color: theme.textColor }}>
          {theme.titleText}
        </h1>
        <p className="text-sm" style={{ color: `${theme.textColor}cc` }}>{theme.subtitleText}</p>
      </div>

      {existingEntries.length > 0 && (
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 shadow-xl space-y-2">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Eye className="w-4 h-4" /> Email này đã đăng ký
          </p>
          {existingEntries.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => viewExisting(item)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <div>
                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-500">{item.email}</p>
              </div>
              <span
                className="text-lg font-black px-3 py-1 rounded-xl"
                style={{ backgroundColor: `${theme.buttonColor}20`, color: theme.buttonColor }}
              >
                #{item.order}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-xl space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <User className="w-4 h-4" /> Tên đầy đủ - Lớp
          </label>
          <input
            type="text"
            placeholder="VD: Nguyễn Văn A - 12A1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-800 placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Mail className="w-4 h-4" /> Email
          </label>
          <input
            type="email"
            placeholder="VD: nguyenvana@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-800 placeholder:text-gray-400"
          />
          {email.length > 0 && !isEmailValid && (
            <p className="text-red-500 text-xs mt-1">Email không hợp lệ</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Phone className="w-4 h-4" /> Số điện thoại
          </label>
          <input
            type="tel"
            placeholder="VD: 0901234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-800 placeholder:text-gray-400"
          />
          {phone.length > 0 && !isPhoneValid && (
            <p className="text-red-500 text-xs mt-1">Số điện thoại cần 10-11 số</p>
          )}
        </div>

        <WarningBox holdDuration={theme.holdDuration} turnDuration={theme.turnDuration} />

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-5 h-5 rounded-md border-2 border-gray-300 text-purple-500 focus:ring-purple-400 cursor-pointer accent-purple-500"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
            Tôi đã hiểu và sẽ đến đúng giờ để không mất lượt
          </span>
        </label>

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-xl">{error}</p>
        )}

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className="w-full py-3.5 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
          style={{
            background: isFormValid && !loading
              ? theme.buttonColor
              : "#e5e7eb",
            color: isFormValid && !loading ? theme.buttonTextColor : "#9ca3af",
            cursor: isFormValid && !loading ? "pointer" : "not-allowed",
          }}
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Lấy Số <Sparkles className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
