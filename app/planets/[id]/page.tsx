"use client";

import { use, useState, useMemo } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Thermometer,
  Scale,
  Orbit,
  Rocket,
  Wind,
  Shield,
  Globe2,
  Zap,
  RotateCcw,
  Gauge,
  MoonIcon,
} from "lucide-react";
import {
  planets,
  dwarfPlanets,
  formatNumber,
  type Planet,
} from "@/lib/planet-data";
import { Planet3D } from "@/components/planet-3d";
import { PlanetComparison } from "@/components/planet-comparison";
import { textureConfigs } from "@/lib/texture-config";

function planetThumbUrl(planetId: string): string | null {
  const cfg = textureConfigs[planetId];
  if (!cfg) return null;
  const diffuse = cfg.layers.find(
    (l) => l.type === "diffuse" && (l.id === "surface" || l.id === "clouds"),
  );
  return diffuse?.url || null;
}

const allBodies = [...planets, ...dwarfPlanets];

type Tab =
  | "overview"
  | "physical"
  | "orbital"
  | "atmosphere"
  | "moons"
  | "missions"
  | "compare";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "physical", label: "Physical" },
  { id: "orbital", label: "Orbital" },
  { id: "atmosphere", label: "Atmosphere" },
  { id: "moons", label: "Moons" },
  { id: "missions", label: "Missions" },
  { id: "compare", label: "Compare" },
];

function DataRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/30 py-3">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </span>
      <span className="font-mono text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

function OverviewTab({ planet }: { planet: Planet }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {planet.description}
      </p>
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
          Fun Fact
        </h4>
        <p className="text-sm leading-relaxed text-foreground">
          {planet.funFact}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">Type</p>
          <p className="text-sm font-medium capitalize text-foreground">
            {planet.type.replace("-", " ")}
          </p>
        </div>
        <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">Diameter</p>
          <p className="font-mono text-sm font-medium text-foreground">
            {formatNumber(planet.diameter)} km
          </p>
        </div>
        <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">Temperature</p>
          <p className="font-mono text-sm font-medium text-foreground">
            {planet.meanTemp}&deg;C
          </p>
        </div>
        <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">Moons</p>
          <p className="font-mono text-sm font-medium text-foreground">
            {planet.moons.length}
          </p>
        </div>
        <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">Rings</p>
          <p className="text-sm font-medium text-foreground">
            {planet.rings ? "Yes" : "No"}
          </p>
        </div>
        <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">Gravity</p>
          <p className="font-mono text-sm font-medium text-foreground">
            {planet.gravity} m/s&sup2;
          </p>
        </div>
      </div>
      {planet.discoveredBy && (
        <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
          <p className="mb-1 text-xs text-muted-foreground">Discovery</p>
          <p className="text-sm text-foreground">
            Discovered by {planet.discoveredBy} in {planet.discoveryYear}
          </p>
        </div>
      )}
    </div>
  );
}

function PhysicalTab({ planet }: { planet: Planet }) {
  return (
    <div>
      <h3 className="mb-4 font-sans text-lg font-semibold text-foreground">
        Physical Characteristics
      </h3>
      <DataRow
        label="Diameter"
        value={`${formatNumber(planet.diameter)} km`}
        icon={Scale}
      />
      <DataRow label="Mass (Earth = 1)" value={planet.mass} icon={Globe2} />
      <DataRow
        label="Surface Gravity"
        value={`${planet.gravity} m/s²`}
        icon={Gauge}
      />
      <DataRow
        label="Escape Velocity"
        value={`${planet.escapeVelocity} km/s`}
        icon={Zap}
      />
      <DataRow
        label="Surface Area"
        value={`${planet.surfaceArea} million km²`}
        icon={Globe2}
      />
      <DataRow
        label="Mean Temperature"
        value={`${planet.meanTemp}°C`}
        icon={Thermometer}
      />

      <h3 className="mb-4 mt-8 font-sans text-lg font-semibold text-foreground">
        Composition & Structure
      </h3>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        {planet.composition}
      </p>
      <DataRow
        label="Magnetic Field"
        value={planet.magneticField}
        icon={Shield}
      />
    </div>
  );
}

function OrbitalTab({ planet }: { planet: Planet }) {
  return (
    <div>
      <h3 className="mb-4 font-sans text-lg font-semibold text-foreground">
        Orbital Data
      </h3>
      <DataRow
        label="Distance from Sun"
        value={`${planet.distanceFromSun} million km`}
        icon={Orbit}
      />
      <DataRow
        label="Orbital Period"
        value={
          planet.orbitalPeriod > 365
            ? `${(planet.orbitalPeriod / 365.25).toFixed(2)} Earth years`
            : `${planet.orbitalPeriod} Earth days`
        }
        icon={Orbit}
      />
      <DataRow
        label="Rotation Period"
        value={`${Math.abs(planet.rotationPeriod).toFixed(1)} hours${planet.rotationPeriod < 0 ? " (retrograde)" : ""}`}
        icon={RotateCcw}
      />
      <DataRow
        label="Axial Tilt"
        value={`${planet.axialTilt}°`}
        icon={RotateCcw}
      />
      <DataRow
        label="Orbit Eccentricity"
        value={planet.orbitEccentricity.toFixed(4)}
        icon={Orbit}
      />

      <div className="mt-6 rounded-xl border border-border/50 bg-secondary/30 p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Light Travel Time from Sun
        </h4>
        <p className="font-mono text-lg font-bold text-primary">
          {((planet.distanceFromSun * 1e6) / 299792.458 / 60).toFixed(1)}{" "}
          minutes
        </p>
        <p className="text-xs text-muted-foreground">
          At the speed of light (299,792 km/s)
        </p>
      </div>
    </div>
  );
}

function AtmosphereTab({ planet }: { planet: Planet }) {
  return (
    <div>
      <h3 className="mb-4 font-sans text-lg font-semibold text-foreground">
        Atmospheric Composition
      </h3>
      {planet.atmosphere.length > 0 ? (
        <div className="flex flex-col gap-3">
          {planet.atmosphere.map((gas, i) => {
            const match = gas.match(/\(([^)]+)\)/);
            const percentage = match ? parseFloat(match[1]) : null;
            return (
              <div key={i}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <Wind className="h-4 w-4 text-muted-foreground" />
                    {gas.replace(/\s*\([^)]*\)/, "")}
                  </span>
                  {match && (
                    <span className="font-mono text-xs text-muted-foreground">
                      {match[1]}
                    </span>
                  )}
                </div>
                {percentage !== null && (
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          This body has virtually no atmosphere (exosphere only).
        </p>
      )}
    </div>
  );
}

function MoonsTab({ planet }: { planet: Planet }) {
  return (
    <div>
      <h3 className="mb-4 font-sans text-lg font-semibold text-foreground">
        Moon Catalog ({planet.moons.length})
      </h3>
      {planet.moons.length > 0 ? (
        <div className="flex flex-col gap-4">
          {planet.moons.map((moon) => (
            <div
              key={moon.name}
              className="rounded-xl border border-border/50 bg-secondary/30 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <MoonIcon className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-sans text-base font-semibold text-foreground">
                  {moon.name}
                </h4>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                {moon.description}
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Diameter</p>
                  <p className="font-mono text-xs font-medium text-foreground">
                    {formatNumber(moon.diameter)} km
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Orbital Period
                  </p>
                  <p className="font-mono text-xs font-medium text-foreground">
                    {Math.abs(moon.orbitalPeriod).toFixed(2)} days
                    {moon.orbitalPeriod < 0 ? " (retro)" : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="font-mono text-xs font-medium text-foreground">
                    {formatNumber(moon.distanceFromPlanet)} km
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {planet.name} has no known natural satellites.
        </p>
      )}
    </div>
  );
}

function MissionsTab({ planet }: { planet: Planet }) {
  return (
    <div>
      <h3 className="mb-4 font-sans text-lg font-semibold text-foreground">
        Space Missions
      </h3>
      <div className="flex flex-col gap-3">
        {planet.missions.map((mission, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/30 px-4 py-3"
          >
            <Rocket className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {mission}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Source: NASA JPL Mission Database, ESA Science Programme
      </p>
    </div>
  );
}

export default function PlanetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const planet = allBodies.find((p) => p.id === id);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showMoonOrbits, setShowMoonOrbits] = useState(true);

  const planet3DElement = useMemo(
    () => <Planet3D planet={planet!} showMoonOrbits={showMoonOrbits} />,
    [planet, showMoonOrbits],
  );

  if (!planet) {
    notFound();
  }

  // Get previous and next planet for navigation
  const currentIndex = allBodies.findIndex((p) => p.id === id);
  const prevPlanet = currentIndex > 0 ? allBodies[currentIndex - 1] : null;
  const nextPlanet =
    currentIndex < allBodies.length - 1 ? allBodies[currentIndex + 1] : null;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-border/50">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-sm text-muted-foreground lg:px-8">
          <Link
            href="/planets"
            className="hover:text-foreground transition-colors"
          >
            Planets
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{planet.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Back */}
        <Link
          href="/planets"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Planets
        </Link>

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          {(() => {
            const thumb = planetThumbUrl(planet.id);
            return (
              <div
                className="h-14 w-14 rounded-full overflow-hidden border border-border/60 bg-cover bg-center lg:h-16 lg:w-16"
                style={{
                  backgroundImage: thumb ? `url(${thumb})` : undefined,
                  backgroundColor: thumb ? undefined : planet.color,
                  boxShadow: `0 0 30px ${planet.color}60`,
                }}
                aria-hidden
              />
            );
          })()}
          <div>
            <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              {planet.name}
            </h1>
            <p className="text-sm capitalize text-muted-foreground">
              {planet.type.replace("-", " ")} planet
              {planet.discoveredBy &&
                ` \u2022 Discovered ${planet.discoveryYear}`}
            </p>
          </div>
        </div>

        {/* Split view */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* 3D Model */}
          <div className="relative aspect-square overflow-hidden rounded-xl border border-border/50 bg-card/50 lg:sticky lg:top-24 lg:aspect-auto lg:h-[calc(100vh-10rem)]">
            {planet3DElement}
            {planet.moons.length > 0 && (
              <div className="absolute bottom-4 left-4 z-10">
                <button
                  onClick={() => setShowMoonOrbits(!showMoonOrbits)}
                  className="rounded-lg bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm border border-border/50 hover:bg-card transition-colors"
                >
                  {showMoonOrbits ? "Hide" : "Show"} Moon Orbits
                </button>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div>
            {/* Tabs */}
            <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-border/50 bg-card/50 p-1 backdrop-blur-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {tab.id === "moons" && planet.moons.length > 0
                    ? ` (${planet.moons.length})`
                    : ""}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
              {activeTab === "overview" && <OverviewTab planet={planet} />}
              {activeTab === "physical" && <PhysicalTab planet={planet} />}
              {activeTab === "orbital" && <OrbitalTab planet={planet} />}
              {activeTab === "atmosphere" && <AtmosphereTab planet={planet} />}
              {activeTab === "moons" && <MoonsTab planet={planet} />}
              {activeTab === "missions" && <MissionsTab planet={planet} />}
              {activeTab === "compare" && (
                <PlanetComparison planetId={planet.id} />
              )}
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">
              {prevPlanet ? (
                <Link
                  href={`/planets/${prevPlanet.id}`}
                  className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {prevPlanet.name}
                </Link>
              ) : (
                <div />
              )}
              {nextPlanet && (
                <Link
                  href={`/planets/${nextPlanet.id}`}
                  className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                >
                  {nextPlanet.name}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            {/* Source citation */}
            <p className="mt-8 text-xs text-muted-foreground">
              Data sources: NASA Jet Propulsion Laboratory, ESA, International
              Astronomical Union. Orbital mechanics from NASA/JPL Horizons
              system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
