"use client";

import Link from "next/link";
import { planets, dwarfPlanets, formatNumber } from "@/lib/planet-data";
import { ArrowRight, Thermometer, Scale, Orbit } from "lucide-react";

const _allBodies = [...planets, ...dwarfPlanets];

export default function PlanetsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-12">
        <h1 className="mb-3 font-sans text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
          <span className="text-balance">Planetary Encyclopedia</span>
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Explore every planet in our solar system. Each entry features 3D
          models, scientific data, moon catalogs, and mission histories sourced
          from NASA and ESA.
        </p>
      </div>

      {/* Main planets */}
      <div className="mb-16">
        <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          The 8 Planets
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {planets.map((planet) => (
            <Link
              key={planet.id}
              href={`/planets/${planet.id}`}
              className="group flex flex-col rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card"
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full"
                  style={{
                    backgroundColor: planet.color,
                    boxShadow: `0 0 20px ${planet.color}40`,
                  }}
                />
                <div>
                  <h3 className="font-sans text-lg font-semibold text-foreground">
                    {planet.name}
                  </h3>
                  <span className="text-xs capitalize text-muted-foreground">
                    {planet.type.replace("-", " ")}
                  </span>
                </div>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Diameter</p>
                    <p className="font-mono text-xs font-medium text-foreground">
                      {formatNumber(planet.diameter)} km
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Temp</p>
                    <p className="font-mono text-xs font-medium text-foreground">
                      {planet.meanTemp}&deg;C
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Orbit className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Orbit</p>
                    <p className="font-mono text-xs font-medium text-foreground">
                      {planet.orbitalPeriod > 365
                        ? `${(planet.orbitalPeriod / 365.25).toFixed(1)}y`
                        : `${planet.orbitalPeriod}d`}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Moons</p>
                  <p className="font-mono text-xs font-medium text-foreground">
                    {planet.moons.length}
                  </p>
                </div>
              </div>
              <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {planet.description}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors group-hover:text-primary/80">
                Explore
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Dwarf planets */}
      <div>
        <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Dwarf Planets
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dwarfPlanets.map((planet) => (
            <Link
              key={planet.id}
              href={`/planets/${planet.id}`}
              className="group flex flex-col rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card"
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full"
                  style={{
                    backgroundColor: planet.color,
                    boxShadow: `0 0 20px ${planet.color}40`,
                  }}
                />
                <div>
                  <h3 className="font-sans text-lg font-semibold text-foreground">
                    {planet.name}
                  </h3>
                  <span className="text-xs capitalize text-muted-foreground">
                    {planet.type}
                  </span>
                </div>
              </div>
              <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {planet.description}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors group-hover:text-primary/80">
                Explore
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
