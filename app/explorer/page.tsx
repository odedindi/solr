"use client";

import { useState, useCallback } from "react";
import {
  Eye,
  EyeOff,
  Tag,
  Gauge,
  Search,
  X,
  ChevronRight,
  Info,
} from "lucide-react";
import { SolarSystemScene } from "@/components/solar-system-scene";
import {
  planets,
  dwarfPlanets,
  type Planet,
  formatNumber,
} from "@/lib/planet-data";
import Link from "next/link";

const allBodies = [...planets, ...dwarfPlanets];

const _presetViews = [
  { name: "Overview", description: "Full solar system view" },
  { name: "Inner Planets", description: "Mercury, Venus, Earth, Mars" },
  { name: "Gas Giants", description: "Jupiter and Saturn" },
  { name: "Ice Giants", description: "Uranus and Neptune" },
];

export default function ExplorerPage() {
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showControls, setShowControls] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  const handleSelectPlanet = useCallback((planet: Planet) => {
    setSelectedPlanet(planet);
  }, []);

  const filteredBodies = allBodies.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* 3D Scene */}
      <SolarSystemScene
        showOrbits={showOrbits}
        showLabels={showLabels}
        speedMultiplier={speedMultiplier}
        selectedPlanet={selectedPlanet}
        onSelectPlanet={handleSelectPlanet}
      />

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="rounded-lg bg-card/80 px-4 py-2 font-sans text-sm font-semibold text-foreground backdrop-blur-sm border border-border/50">
            Solar System Explorer
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Search toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-card/80 text-muted-foreground backdrop-blur-sm border border-border/50 hover:text-foreground transition-colors"
            aria-label="Search planets"
          >
            <Search className="h-4 w-4" />
          </button>
          {/* Controls toggle */}
          <button
            onClick={() => setShowControls(!showControls)}
            className="flex h-9 items-center gap-2 rounded-lg bg-card/80 px-3 text-sm text-muted-foreground backdrop-blur-sm border border-border/50 hover:text-foreground transition-colors"
          >
            {showControls ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Controls</span>
          </button>
        </div>
      </div>

      {/* Search panel */}
      {showSearch && (
        <div className="absolute top-16 right-4 z-20 w-72 rounded-xl border border-border/50 bg-card/90 backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search planets..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              autoFocus
            />
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto p-2">
            {filteredBodies.map((body) => (
              <button
                key={body.id}
                onClick={() => {
                  setSelectedPlanet(body);
                  setShowSearch(false);
                  setSearchQuery("");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary transition-colors"
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: body.color }}
                />
                <span className="text-foreground">{body.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {body.type}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls Panel */}
      {showControls && (
        <div className="absolute bottom-4 left-4 z-10 w-64 rounded-xl border border-border/50 bg-card/90 p-4 backdrop-blur-xl">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Controls
          </h3>

          {/* Toggle options */}
          <div className="mb-4 flex flex-col gap-2">
            <label className="flex items-center justify-between text-sm text-foreground">
              <span className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                Orbit Lines
              </span>
              <button
                onClick={() => setShowOrbits(!showOrbits)}
                className={`h-5 w-9 rounded-full transition-colors ${showOrbits ? "bg-primary" : "bg-muted"}`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-foreground transition-transform ${showOrbits ? "translate-x-4" : "translate-x-0.5"}`}
                />
              </button>
            </label>
            <label className="flex items-center justify-between text-sm text-foreground">
              <span className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                Labels
              </span>
              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`h-5 w-9 rounded-full transition-colors ${showLabels ? "bg-primary" : "bg-muted"}`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-foreground transition-transform ${showLabels ? "translate-x-4" : "translate-x-0.5"}`}
                />
              </button>
            </label>
          </div>

          {/* Speed control */}
          <div className="mb-4">
            <label className="mb-2 flex items-center justify-between text-sm text-foreground">
              <span className="flex items-center gap-2">
                <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                Speed
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {speedMultiplier}x
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          {/* Presets */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Nav
            </h4>
            <div className="flex flex-col gap-1">
              {allBodies.slice(0, 8).map((body) => (
                <button
                  key={body.id}
                  onClick={() => setSelectedPlanet(body)}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
                    selectedPlanet?.id === body.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: body.color }}
                  />
                  {body.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Planet Info HUD */}
      {selectedPlanet && (
        <div className="absolute bottom-4 right-4 z-10 w-80 rounded-xl border border-border/50 bg-card/90 backdrop-blur-xl">
          <div className="flex items-start justify-between border-b border-border/50 p-4">
            <div>
              <h2 className="font-sans text-lg font-bold text-foreground">
                {selectedPlanet.name}
              </h2>
              <span className="text-xs capitalize text-muted-foreground">
                {selectedPlanet.type.replace("-", " ")} planet
              </span>
            </div>
            <button
              onClick={() => setSelectedPlanet(null)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            <div>
              <span className="text-xs text-muted-foreground">
                Distance from Sun
              </span>
              <p className="font-mono text-sm font-medium text-foreground">
                {selectedPlanet.distanceFromSun}M km
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Orbital Period
              </span>
              <p className="font-mono text-sm font-medium text-foreground">
                {selectedPlanet.orbitalPeriod > 365
                  ? `${(selectedPlanet.orbitalPeriod / 365.25).toFixed(1)} years`
                  : `${selectedPlanet.orbitalPeriod} days`}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Diameter</span>
              <p className="font-mono text-sm font-medium text-foreground">
                {formatNumber(selectedPlanet.diameter)} km
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Gravity</span>
              <p className="font-mono text-sm font-medium text-foreground">
                {selectedPlanet.gravity} m/s&sup2;
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Temperature</span>
              <p className="font-mono text-sm font-medium text-foreground">
                {selectedPlanet.meanTemp}&deg;C
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Moons</span>
              <p className="font-mono text-sm font-medium text-foreground">
                {selectedPlanet.moons.length}
              </p>
            </div>
          </div>
          <div className="border-t border-border/50 p-4">
            <Link
              href={`/planets/${selectedPlanet.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View Details
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transform">
        <div className="flex items-center gap-3 rounded-full bg-card/60 px-4 py-2 text-xs text-muted-foreground backdrop-blur-sm border border-border/30">
          <Info className="h-3.5 w-3.5" />
          <span>
            Click a planet to view info. Double-click to see details. Scroll to
            zoom.
          </span>
        </div>
      </div>
    </div>
  );
}
