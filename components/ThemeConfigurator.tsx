"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Palette, X, Save, RotateCcw, Image, Type, Timer, Monitor } from "lucide-react";
import { ThemeConfig, DEFAULT_THEME } from "@/lib/utils";
import { saveThemeConfig } from "@/lib/store";

interface Props {
  theme: ThemeConfig;
  onUpdate: (theme: ThemeConfig) => void;
}

export default function ThemeConfigurator({ theme, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<ThemeConfig>(theme);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function handleChange(key: keyof ThemeConfig, value: string) {
    setLocal((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await saveThemeConfig(local);
    onUpdate(local);
    setSaving(false);
    setOpen(false);
  }

  function handleReset() {
    setLocal(DEFAULT_THEME);
  }

  const colorFields: { key: keyof ThemeConfig; label: string; type: "color" | "text" }[] = [
    { key: "bgColor", label: "Màu nền", type: "color" },
    { key: "bgImage", label: "URL ảnh nền", type: "text" },
    { key: "headerColor", label: "Màu header", type: "color" },
    { key: "buttonColor", label: "Màu nút bấm", type: "color" },
    { key: "buttonTextColor", label: "Màu chữ nút", type: "color" },
    { key: "textColor", label: "Màu chữ chính", type: "color" },
    { key: "accentColor", label: "Màu accent", type: "color" },
  ];

  return (
    <>
      <button
        onClick={() => { setLocal(theme); setOpen(true); }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm font-semibold"
      >
        <Palette className="w-4 h-4" /> Tùy chỉnh giao diện
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col"
            style={{ maxHeight: "min(600px, 85vh)" }}
          >
            {/* Header - fixed */}
            <div className="shrink-0 border-b px-5 py-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" /> Cấu hình giao diện
              </h3>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {/* Preview */}
              <div
                className="rounded-xl p-3 text-center text-sm font-semibold"
                style={{
                  backgroundColor: local.bgColor,
                  color: local.textColor,
                  backgroundImage: local.bgImage ? `url(${local.bgImage})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <p style={{ color: local.textColor }} className="font-bold mb-1">
                  {local.titleText || "Tiêu đề"}
                </p>
                <p className="text-xs" style={{ color: `${local.textColor}cc` }}>
                  {local.subtitleText || "Phụ đề"} · {local.turnDuration}p chụp · giữ {local.holdDuration}p · {local.boothCount} máy
                </p>
                <button
                  type="button"
                  className="mt-1.5 px-3 py-1 rounded-lg text-xs font-bold"
                  style={{ backgroundColor: local.buttonColor, color: local.buttonTextColor }}
                >
                  Nút mẫu
                </button>
              </div>

              {/* Text settings */}
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 pt-1">
                <Type className="w-3.5 h-3.5" /> Nội dung
              </p>
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-gray-600">Tiêu đề chính</label>
                  <input
                    type="text"
                    value={local.titleText}
                    onChange={(e) => handleChange("titleText", e.target.value)}
                    className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 focus:border-purple-400 outline-none text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Phụ đề</label>
                  <input
                    type="text"
                    value={local.subtitleText}
                    onChange={(e) => handleChange("subtitleText", e.target.value)}
                    className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 focus:border-purple-400 outline-none text-gray-800"
                  />
                </div>
              </div>

              {/* Settings */}
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 pt-1">
                <Timer className="w-3.5 h-3.5" /> Cài đặt
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600 shrink-0">Thời gian chụp</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={local.turnDuration}
                  onChange={(e) => setLocal((prev) => ({ ...prev, turnDuration: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-20 text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 focus:border-purple-400 outline-none text-gray-800 text-center"
                />
                <span className="text-xs text-gray-500">phút/lượt</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600 shrink-0">Giữ lượt</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={local.holdDuration}
                  onChange={(e) => setLocal((prev) => ({ ...prev, holdDuration: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-20 text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 focus:border-purple-400 outline-none text-gray-800 text-center"
                />
                <span className="text-xs text-gray-500">phút</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600 shrink-0 flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5" /> Số máy chụp
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={local.boothCount}
                  onChange={(e) => setLocal((prev) => ({ ...prev, boothCount: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-20 text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 focus:border-purple-400 outline-none text-gray-800 text-center"
                />
                <span className="text-xs text-gray-500">máy</span>
              </div>

              {/* Color settings */}
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 pt-1">
                <Palette className="w-3.5 h-3.5" /> Màu sắc
              </p>
              {colorFields.map((f) => (
                <div key={f.key} className="flex items-center gap-2.5">
                  {f.type === "color" ? (
                    <input
                      type="color"
                      value={local[f.key] as string}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      className="w-9 h-9 rounded-lg border-2 border-gray-200 cursor-pointer shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg border-2 border-gray-200 flex items-center justify-center shrink-0 bg-gray-50">
                      <Image className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-medium text-gray-600">{f.label}</label>
                    <input
                      type="text"
                      placeholder={f.type === "text" ? "https://example.com/bg.jpg" : ""}
                      value={local[f.key] as string}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      className="w-full text-sm px-2.5 py-1 rounded-lg border border-gray-200 focus:border-purple-400 outline-none text-gray-800"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer - fixed */}
            <div className="shrink-0 border-t px-5 py-3 flex gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-semibold"
              >
                <RotateCcw className="w-4 h-4" /> Mặc định
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-sm font-bold disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {saving ? "Đang lưu..." : "Lưu cấu hình"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
