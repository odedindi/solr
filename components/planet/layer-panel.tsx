"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Info, Layers, RotateCcw } from "lucide-react";
import type { PlanetTextureConfig, TextureLayerType } from "@/lib/texture-config";
import {
  isLayerActive,
  missingRequirements,
  VIEW_MODE_DESCRIPTIONS,
  type LayerStates,
  type ViewMode,
} from "@/lib/layer-state";
import { Slider } from "@/components/ui/slider";

const PANEL_EXPANDED_KEY = "Solr:layer-panel-expanded";

/** Layer types whose strength is adjustable, with the slider's meaning. */
const SLIDER_LABEL: Partial<Record<TextureLayerType, string>> = {
  bump: "Relief strength",
  specular: "Glint strength",
  clouds: "Cloud opacity",
  emissive: "Light intensity",
  atmosphere: "Glow intensity",
  rings: "Ring opacity",
};

export function LayerControlPanel({
  config,
  layerStates,
  onToggleLayer,
  onChangeOpacity,
  viewMode,
  onViewModeChange,
  onReset,
  isDefault,
}: {
  config: PlanetTextureConfig;
  layerStates: LayerStates;
  onToggleLayer: (id: string) => void;
  onChangeOpacity: (id: string, opacity: number) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onReset: () => void;
  isDefault: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeInfo, setActiveInfo] = useState<string | null>(null);

  // Restore after hydration to avoid an SSR mismatch.
  useEffect(() => {
    if (localStorage.getItem(PANEL_EXPANDED_KEY) === "true") setExpanded(true);
  }, []);

  const toggleExpanded = () => {
    setExpanded((prev) => {
      localStorage.setItem(PANEL_EXPANDED_KEY, String(!prev));
      return !prev;
    });
  };

  const activeCount = config.layers.filter((l) => isLayerActive(config, l, layerStates)).length;
  const labelOf = (id: string) => config.layers.find((l) => l.id === id)?.label ?? id;

  return (
    <div className="absolute top-4 right-4 z-10 w-72 max-w-[calc(100%-2rem)]">
      <button
        onClick={toggleExpanded}
        className={`flex w-full items-center justify-between border border-border/50 bg-card/90 px-3 py-2 text-xs font-semibold text-foreground backdrop-blur-md ${
          expanded ? "rounded-t-lg" : "rounded-lg"
        }`}
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5" />
          Layers & View
          <span className="font-mono text-[10px] font-normal text-primary">
            {activeCount}/{config.layers.length}
          </span>
        </span>
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {expanded && (
        <div className="max-h-[60vh] overflow-y-auto rounded-b-lg border border-t-0 border-border/50 bg-card/90 p-3 backdrop-blur-md">
          {/* View mode */}
          <div className="mb-3 border-b border-border/30 pb-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              View Mode
            </p>
            <div className="flex gap-1" role="radiogroup" aria-label="View mode">
              {(["realistic", "enhanced"] as const).map((mode) => (
                <button
                  key={mode}
                  role="radio"
                  aria-checked={viewMode === mode}
                  onClick={() => onViewModeChange(mode)}
                  className={`flex-1 rounded px-2 py-1.5 text-[10px] font-medium capitalize transition-all duration-200 ${
                    viewMode === mode
                      ? mode === "enhanced"
                        ? "bg-accent text-accent-foreground shadow-sm shadow-accent/30"
                        : "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[9px] italic text-muted-foreground">
              {VIEW_MODE_DESCRIPTIONS[viewMode]}
            </p>
          </div>

          {/* Layers */}
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Layers
            </p>
            <button
              onClick={onReset}
              disabled={isDefault}
              className="flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              title="Restore the default layers and view mode"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {config.layers.map((layer) => {
              const state = layerStates[layer.id] ?? {
                enabled: layer.defaultEnabled,
                opacity: layer.defaultOpacity,
              };
              const missing = missingRequirements(config, layer, layerStates);
              const blocked = missing.length > 0;
              const active = state.enabled && !blocked;
              const sliderLabel = SLIDER_LABEL[layer.type];
              const pct = Math.round(state.opacity * 100);

              return (
                <div key={layer.id} className={blocked ? "opacity-50" : undefined}>
                  <div className="flex items-center gap-2">
                    <button
                      role="checkbox"
                      aria-checked={state.enabled}
                      aria-disabled={blocked}
                      disabled={blocked}
                      onClick={() => onToggleLayer(layer.id)}
                      className={`flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-not-allowed`}
                      title={
                        blocked ? `Requires ${missing.map(labelOf).join(", ")}` : layer.description
                      }
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-200 ${
                          active
                            ? "border-primary bg-primary/20"
                            : "border-border/50 bg-secondary/50"
                        }`}
                      >
                        {state.enabled && (
                          <span
                            className={`h-2 w-2 rounded-sm ${blocked ? "bg-muted-foreground" : "bg-primary"}`}
                          />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block truncate text-[11px] transition-colors ${
                            active ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {layer.label}
                        </span>
                        {blocked && (
                          <span className="block text-[9px] text-muted-foreground">
                            Needs {missing.map(labelOf).join(", ")}
                          </span>
                        )}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveInfo(activeInfo === layer.id ? null : layer.id)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={`About ${layer.label}`}
                      aria-expanded={activeInfo === layer.id}
                    >
                      <Info className="h-3 w-3" />
                    </button>
                  </div>

                  {active && sliderLabel && (
                    <div className="mt-1.5 ml-6 flex items-center gap-2">
                      <Slider
                        className="flex-1"
                        min={0}
                        max={100}
                        step={1}
                        value={[pct]}
                        onValueChange={(v) => onChangeOpacity(layer.id, v[0] / 100)}
                        aria-label={`${layer.label} – ${sliderLabel}`}
                        title={`${sliderLabel}: ${pct}%`}
                      />
                      <span className="w-8 text-right font-mono text-[9px] text-muted-foreground">
                        {pct}%
                      </span>
                    </div>
                  )}

                  {activeInfo === layer.id && (
                    <div className="mt-1.5 ml-6 rounded-md border border-primary/20 bg-muted/80 p-2.5 text-[10px] leading-relaxed text-muted-foreground backdrop-blur-sm animate-in fade-in-0 slide-in-from-top-1 duration-200">
                      <p className="mb-1.5">{layer.description}</p>
                      <p className="text-[9px]">
                        <span className="font-medium text-foreground/70">Source:</span>{" "}
                        {layer.source}
                      </p>
                      <p className="mt-1 text-[9px] italic">{layer.scientificNote}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-3 border-t border-border/30 pt-2 text-[8px] text-muted-foreground">
            Textures: Solar System Scope (CC BY 4.0), NASA/JPL, ESA
          </p>
        </div>
      )}
    </div>
  );
}
