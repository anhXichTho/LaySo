"use client";

import { useState, useEffect } from "react";
import RegistrationForm from "@/components/RegistrationForm";
import { subscribeToTheme } from "@/lib/store";
import { ThemeConfig, DEFAULT_THEME } from "@/lib/utils";

export default function HomePage() {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);

  useEffect(() => {
    const unsub = subscribeToTheme(setTheme);
    return () => unsub();
  }, []);

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
      <RegistrationForm theme={theme} />
    </main>
  );
}
