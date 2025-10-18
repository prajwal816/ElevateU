import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

interface BubbleTabsProps {
  role: "student" | "teacher";
  setRole: (r: "student" | "teacher") => void;
}

const BubbleTabs: React.FC<BubbleTabsProps> = ({ role, setRole }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxDrag, setMaxDrag] = useState(0);
  const x = useMotionValue(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        setMaxDrag(trackRef.current.offsetWidth / 2 - 8);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const target = role === "teacher" ? maxDrag : 0;
    animate(x, target, { type: "spring", stiffness: 400, damping: 30 });
  }, [role, maxDrag]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX;
    const startVal = x.get();

    const move = (e2: PointerEvent) => {
      const delta = e2.clientX - startX;
      const next = Math.min(Math.max(startVal + delta, 0), maxDrag);
      x.set(next);
    };

    const up = () => {
      setIsDragging(false);
      const current = x.get();
      const newRole = current > maxDrag * 0.4 ? "teacher" : "student";
      setRole(newRole);
      animate(x, newRole === "teacher" ? maxDrag : 0, {
        type: "spring",
        stiffness: 500,
        damping: 35,
      });
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const handleLabelClick = (targetRole: "student" | "teacher") => {
    if (targetRole === role) return;
    setRole(targetRole);
    animate(x, targetRole === "teacher" ? maxDrag : 0, {
      type: "spring",
      stiffness: 500,
      damping: 30,
    });
  };

  const scale = isHovering || isDragging ? 1.08 : 1;

  return (
    <div
      ref={trackRef}
      className="relative flex items-center justify-between bg-[#0e0e0e]/60 backdrop-blur-lg border border-white/10 rounded-full mb-6 p-1 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)] select-none touch-none"
      style={{ width: "100%", maxWidth: 380, height: 48 }}
    >
      {/* draggable glass bubble */}
      <motion.div
        style={{ x, scale }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full overflow-hidden z-20 cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          if (!isDragging) setIsHovering(false);
        }}
      >
        {/* 🪞 Realistic Refractive Glass */}
        <div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden">
          {/* subtle glass distortion + contrast with orange tint */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              backdropFilter:
                "blur(10px) contrast(1.35) saturate(1.4) brightness(1.15)",
              WebkitBackdropFilter:
                "blur(10px) contrast(1.35) saturate(1.4) brightness(1.15)",
              border: "1px solid rgba(255,255,255,0.20)",
              boxShadow:
                "inset 0 0 6px rgba(255,255,255,0.2), 0 3px 12px rgba(0,0,0,0.4), 0 0 20px rgba(255,107,53,0.15)",
              background: "rgba(255,107,53,0.08)",
            }}
          />

          {/* dynamic chromatic shimmer with orange tones */}
          <div
            className="absolute inset-0 rounded-full mix-blend-screen"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(255,107,53,0.12), rgba(255,150,80,0.08), rgba(255,180,120,0.06), rgba(255,107,53,0.12))",
              filter: "blur(2px)",
            }}
          />

          {/* inner highlight */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.2), rgba(255,255,255,0) 70%)",
              mixBlendMode: "screen",
            }}
          />

          {/* light streak reflection */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05) 40%, transparent 70%)",
            }}
          />
        </div>

        {/* transparent full drag zone */}
        <div
          className="absolute inset-0 rounded-full z-30"
          style={{ background: "transparent", cursor: "grab" }}
          onPointerEnter={() => setIsHovering(true)}
          onPointerLeave={() => {
            if (!isDragging) setIsHovering(false);
          }}
          onPointerDown={handlePointerDown}
        />
      </motion.div>

      {/* labels */}
      <div className="relative z-10 flex w-full text-sm font-medium">
        <button
          type="button"
          onClick={() => handleLabelClick("student")}
          disabled={role === "student"}
          className={`flex-1 text-center transition-colors ${
            role === "student"
              ? "text-white pointer-events-none"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Student
        </button>
        <button
          type="button"
          onClick={() => handleLabelClick("teacher")}
          disabled={role === "teacher"}
          className={`flex-1 text-center transition-colors ${
            role === "teacher"
              ? "text-white pointer-events-none"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Teacher
        </button>
      </div>
    </div>
  );
};

export default BubbleTabs;
