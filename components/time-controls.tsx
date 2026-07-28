"use client";

import { Play, Pause, RotateCcw } from "lucide-react";
import { useTimeStore } from "@/lib/time-store";

const SPEED_PRESETS = [0.25, 0.5, 1, 2, 5, 10] as const;

export function TimeControls() {
  const playing = useTimeStore((s) => s.playing);
  const speed = useTimeStore((s) => s.speed);
  const togglePlaying = useTimeStore((s) => s.togglePlaying);
  const setSpeed = useTimeStore((s) => s.setSpeed);
  const reset = useTimeStore((s) => s.reset);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={togglePlaying}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-card/80 text-muted-foreground backdrop-blur-sm border border-border/50 hover:text-foreground transition-colors"
        aria-label={playing ? "Pause simulation" : "Play simulation"}
      >
        {playing ? (
          <Pause className="h-3.5 w-3.5" />
        ) : (
          <Play className="h-3.5 w-3.5" />
        )}
      </button>

      <div className="flex items-center gap-1 rounded-lg bg-card/80 px-1 backdrop-blur-sm border border-border/50">
        {SPEED_PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => setSpeed(preset)}
            className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
              speed === preset
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {preset}x
          </button>
        ))}
      </div>

      <button
        onClick={reset}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-card/80 text-muted-foreground backdrop-blur-sm border border-border/50 hover:text-foreground transition-colors"
        aria-label="Reset simulation time"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
