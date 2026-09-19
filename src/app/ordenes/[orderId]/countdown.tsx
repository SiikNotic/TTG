"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function Countdown({ expiresAt }: { expiresAt: string }) {
  const router = useRouter();
  const target = new Date(expiresAt).getTime();
  const [remaining, setRemaining] = useState(() => target - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const next = target - Date.now();
      setRemaining(next);
      if (next <= 0) {
        clearInterval(interval);
        router.refresh();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [target, router]);

  if (remaining <= 0) {
    return <p className="text-sm font-medium text-destructive">La reserva expiró.</p>;
  }

  return (
    <p className="text-sm text-muted-foreground">
      Confirma antes de que se agote el tiempo: <span className="font-mono font-medium text-foreground">{formatRemaining(remaining)}</span>
    </p>
  );
}

export { Countdown };
