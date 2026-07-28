"use client"

import { useState, useMemo } from "react"
import {
  ArrowRight,
  ArrowLeftRight,
  Zap,
  Rocket,
  Footprints,
  Car,
  Plane,
  Crosshair,
  Timer,
  Ruler,
} from "lucide-react"
import {
  planets,
  dwarfPlanets,
  travelSpeeds,
  historicalSpacecraft,
  formatTravelTime,
  formatNumber,
} from "@/lib/planet-data"

const allBodies = [...planets, ...dwarfPlanets]

const speedIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  walking: Footprints,
  car: Car,
  plane: Plane,
  bullet: Crosshair,
  rocket: Rocket,
  newHorizons: Rocket,
  light: Zap,
}

function DistanceBar({
  fromName,
  toName,
  distanceKm,
  maxDistance,
  color,
}: {
  fromName: string
  toName: string
  distanceKm: number
  maxDistance: number
  color: string
}) {
  const pct = Math.max(2, (distanceKm / maxDistance) * 100)
  return (
    <div className="group">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {fromName} to {toName}
        </span>
        <span className="font-mono font-medium text-foreground">
          {distanceKm >= 1e9
            ? (distanceKm / 1e9).toFixed(2) + " B km"
            : distanceKm >= 1e6
              ? (distanceKm / 1e6).toFixed(2) + " M km"
              : formatNumber(distanceKm) + " km"}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function TravelCard({
  speedKey,
  distanceKm,
}: {
  speedKey: keyof typeof travelSpeeds
  distanceKm: number
}) {
  const sp = travelSpeeds[speedKey]
  const hours = distanceKm / sp.speed
  const Icon = speedIcons[speedKey] ?? Rocket

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">{sp.name}</h4>
      </div>
      <p className="mb-1 text-xs text-muted-foreground">
        {formatNumber(sp.speed)} {sp.unit}
      </p>
      <p className="font-mono text-lg font-bold text-accent">
        {formatTravelTime(hours)}
      </p>
    </div>
  )
}

export default function DistancesPage() {
  const [fromId, setFromId] = useState("earth")
  const [toId, setToId] = useState("mars")

  const fromPlanet = allBodies.find((p) => p.id === fromId)!
  const toPlanet = allBodies.find((p) => p.id === toId)!

  const distanceKm = useMemo(() => {
    return (
      Math.abs(fromPlanet.distanceFromSun - toPlanet.distanceFromSun) * 1e6
    )
  }, [fromPlanet, toPlanet])

  const allDistances = useMemo(() => {
    return allBodies.map((b) => ({
      name: b.name,
      color: b.color,
      distanceKm: Math.abs(fromPlanet.distanceFromSun - b.distanceFromSun) * 1e6,
    }))
      .filter((d) => d.distanceKm > 0)
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }, [fromPlanet])

  const maxDistance = useMemo(
    () => Math.max(...allDistances.map((d) => d.distanceKm), 1),
    [allDistances]
  )

  const swapPlanets = () => {
    setFromId(toId)
    setToId(fromId)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="mb-3 font-sans text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
          <span className="text-balance">Cosmic Distance Calculator</span>
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Compare distances between planets and see how long it would take to
          travel between them at different speeds -- from walking to the speed
          of light.
        </p>
      </div>

      {/* Selector */}
      <div className="mb-10 rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          {/* From */}
          <div className="flex-1 w-full">
            <label
              htmlFor="from-planet"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              From
            </label>
            <select
              id="from-planet"
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm font-medium text-foreground focus:border-primary focus:outline-none"
            >
              {allBodies.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap */}
          <button
            onClick={swapPlanets}
            className="mt-5 rounded-full border border-border/50 bg-secondary/50 p-3 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Swap origin and destination"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </button>

          {/* To */}
          <div className="flex-1 w-full">
            <label
              htmlFor="to-planet"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              To
            </label>
            <select
              id="to-planet"
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm font-medium text-foreground focus:border-primary focus:outline-none"
            >
              {allBodies.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Distance result */}
        <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 p-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: fromPlanet.color }}
            />
            {fromPlanet.name}
            <ArrowRight className="h-4 w-4 text-accent" />
            {toPlanet.name}
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: toPlanet.color }}
            />
          </div>
          {fromId === toId ? (
            <p className="font-mono text-2xl font-bold text-foreground lg:text-3xl">
              Same planet -- 0 km
            </p>
          ) : (
            <>
              <p className="font-mono text-2xl font-bold text-foreground lg:text-3xl">
                {distanceKm >= 1e9
                  ? (distanceKm / 1e9).toFixed(2) + " billion km"
                  : distanceKm >= 1e6
                    ? (distanceKm / 1e6).toFixed(2) + " million km"
                    : formatNumber(distanceKm) + " km"}
              </p>
              <p className="text-xs text-muted-foreground">
                Average distance (based on mean orbital radii)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Travel times */}
      {fromId !== toId && (
        <div className="mb-12">
          <div className="mb-6 flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            <h2 className="font-sans text-xl font-semibold text-foreground">
              Travel Time Comparison
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(travelSpeeds) as Array<keyof typeof travelSpeeds>).map(
              (key) => (
                <TravelCard key={key} speedKey={key} distanceKm={distanceKm} />
              )
            )}
          </div>
        </div>
      )}

      {/* Relative distance bars */}
      <div className="mb-12">
        <div className="mb-6 flex items-center gap-2">
          <Ruler className="h-5 w-5 text-primary" />
          <h2 className="font-sans text-xl font-semibold text-foreground">
            Distances from {fromPlanet.name}
          </h2>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <div className="flex flex-col gap-4">
            {allDistances.map((d) => (
              <DistanceBar
                key={d.name}
                fromName={fromPlanet.name}
                toName={d.name}
                distanceKm={d.distanceKm}
                maxDistance={maxDistance}
                color={d.color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Spacecraft tracker */}
      <div>
        <div className="mb-6 flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          <h2 className="font-sans text-xl font-semibold text-foreground">
            Historic Deep-Space Spacecraft
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {historicalSpacecraft.map((sc) => (
            <div
              key={sc.name}
              className="rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm"
            >
              <h3 className="mb-1 text-base font-semibold text-foreground">
                {sc.name}
              </h3>
              <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                {sc.description}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Launch</p>
                  <p className="text-xs font-medium text-foreground">{sc.launchDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Speed</p>
                  <p className="font-mono text-xs font-medium text-foreground">
                    {formatNumber(sc.speed)} km/h
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Distance</p>
                  <p className="font-mono text-xs font-medium text-foreground">
                    {sc.currentDistance} B km
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-xs font-medium text-foreground">{sc.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-12 text-xs text-muted-foreground">
        Distances shown are approximate averages based on mean orbital radii.
        Actual distances vary with orbital positions. Source: NASA/JPL Horizons
        System.
      </p>
    </div>
  )
}
