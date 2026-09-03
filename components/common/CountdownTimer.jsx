"use client";
import { useEffect, useState } from "react";
import { RECRUITMENT_DEADLINE } from "@/lib/recruitment";
export default function CountdownTimer({
  targetDate = RECRUITMENT_DEADLINE,
  className = "",
}) {
  const [remaining, setRemaining] = useState(null);
  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const update = () =>
      setRemaining(
        Number.isFinite(target) ? Math.max(0, target - Date.now()) : 0,
      );
    update();
    if (!Number.isFinite(target) || target <= Date.now()) return;
    const timer = setInterval(() => {
      update();
      if (target <= Date.now()) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  if (remaining === null)
    return <span className={className}>Checking recruitment dates…</span>;
  if (remaining === 0)
    return <span className={className}>Recruitment closed</span>;
  const seconds = Math.floor(remaining / 1000);
  return (
    <span
      className={className}
      role="timer"
      aria-label="Time until recruitment closes"
    >
      {Math.floor(seconds / 86400)}d {Math.floor(seconds / 3600) % 24}h{" "}
      {Math.floor(seconds / 60) % 60}m {seconds % 60}s remaining
    </span>
  );
}
