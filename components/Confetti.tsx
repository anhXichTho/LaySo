"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const COLORS = ["#FCD34D", "#F97316", "#EC4899", "#A78BFA", "#14B8A6", "#3B82F6"];

function randomBetween(a: number, b: number) {
  return Math.random() * (b - a) + a;
}

export default function Confetti() {
  const [pieces, setPieces] = useState<
    { id: number; x: number; color: string; delay: number; size: number }[]
  >([]);

  useEffect(() => {
    const items = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: randomBetween(5, 95),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: randomBetween(0, 1.5),
      size: randomBetween(6, 12),
    }));
    setPieces(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: 0, rotate: randomBetween(180, 720) }}
          transition={{ duration: randomBetween(2.5, 4), delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}
