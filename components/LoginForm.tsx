"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, User, LogIn } from "lucide-react";

interface Props {
  onLogin: () => void;
}

export default function LoginForm({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username === "admin" && password === "123") {
      onLogin();
    } else {
      setError("Sai tài khoản hoặc mật khẩu!");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 p-4">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl space-y-5"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-2">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-500 text-sm">Đăng nhập để quản lý</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
            <User className="w-4 h-4" /> Tài khoản
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-800"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
            <Lock className="w-4 h-4" /> Mật khẩu
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-800"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-xl">{error}</p>
        )}

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
        >
          <LogIn className="w-5 h-5" /> Đăng nhập
        </motion.button>
      </motion.form>
    </div>
  );
}
