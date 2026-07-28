"use client";

import Link from "next/link";
import {
  Globe,
  Compass,
  Ruler,
  ArrowRight,
  Rocket,
  Satellite,
  Star,
  Zap,
  Radio,
} from "lucide-react";
import { HeroScene } from "@/components/hero-scene";

const features = [
  {
    href: "/explorer",
    icon: Globe,
    title: "3D Solar System Explorer",
    description:
      "Navigate an interactive 3D model of our solar system. Orbit, zoom, and click on planets to discover their secrets.",
    color: "text-primary",
    borderColor: "border-primary/30 hover:border-primary/60",
    glowColor: "hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
  },
  {
    href: "/planets",
    icon: Compass,
    title: "Planetary Encyclopedia",
    description:
      "Deep-dive into each planet with 3D models, scientific data, moon catalogs, mission histories, and atmospheric compositions.",
    color: "text-accent",
    borderColor: "border-accent/30 hover:border-accent/60",
    glowColor: "hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
  },
  {
    href: "/distances",
    icon: Ruler,
    title: "Distance & Travel Calculator",
    description:
      "Visualize the scale of space. Calculate travel times at different speeds and track historical spacecraft positions.",
    color: "text-chart-3",
    borderColor: "border-chart-3/30 hover:border-chart-3/60",
    glowColor: "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
  },
];

const stats = [
  { label: "Planets", value: "8", icon: Globe },
  { label: "Known Moons", value: "290+", icon: Star },
  { label: "Active Missions", value: "40+", icon: Rocket },
  { label: "Spacecraft Tracked", value: "5", icon: Satellite },
];

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden">
        <HeroScene />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Decorative grid overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <div className="max-w-2xl">
            {/* Badge with glow */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-4 py-1.5 text-sm text-primary shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <div className="relative h-1.5 w-1.5">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/50" />
                <div className="absolute inset-0 rounded-full bg-primary" />
              </div>
              <span className="font-medium tracking-wide">
                Interactive Solar System Encyclopedia
              </span>
            </div>

            <h1 className="mb-6 font-sans text-5xl font-bold leading-tight tracking-tight text-foreground lg:text-7xl">
              <span className="text-balance">
                Explore the{" "}
                <span className="bg-gradient-to-r from-primary via-cyan-300 to-primary bg-clip-text text-transparent">
                  Solr
                </span>
              </span>
            </h1>

            <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Journey through our solar system with scientifically accurate 3D
              visualizations, real NASA data, and interactive tools that bring
              the universe to your screen.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/explorer"
                className="pointer-events-auto group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]"
              >
                <span className="relative z-10">Launch Explorer</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              </Link>
              <Link
                href="/planets"
                className="pointer-events-auto inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-secondary/50"
              >
                Browse Planets
              </Link>
            </div>
          </div>
        </div>

        {/* Side decoration */}
        <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex">
          <div className="h-20 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
          <Radio className="h-4 w-4 text-primary/50" />
          <div className="h-20 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
        </div>
      </section>

      {/* Stats */}
      <section className="relative border-y border-border/30 bg-card/30 backdrop-blur-xl">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 h-4 w-4 border-t border-l border-primary/30" />
        <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-primary/30" />
        <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-primary/30" />
        <div className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-primary/30" />

        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border/30 md:grid-cols-4">
          {stats.map((stat, _i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group flex flex-col items-center gap-2 px-6 py-10 transition-colors hover:bg-primary/5"
              >
                <Icon className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
                <span className="font-mono text-3xl font-bold text-foreground tracking-tight">
                  {stat.value}
                </span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative mx-auto max-w-7xl px-4 py-24 lg:px-8">
        {/* Background decoration */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-px w-1/2 bg-gradient-to-r from-primary/30 to-transparent" />

        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            <Zap className="h-3 w-3" />
            Features
          </div>
          <h2 className="mb-4 font-sans text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            <span className="text-balance">Discover Our Solar System</span>
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground leading-relaxed">
            Three powerful tools to explore, learn, and understand the vast
            expanse of our cosmic neighborhood.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className={`group relative flex flex-col rounded-xl border bg-card/30 p-8 backdrop-blur-sm transition-all duration-300 ${feature.borderColor} ${feature.glowColor}`}
              >
                {/* Corner accents */}
                <div
                  className={`absolute -top-px -left-px h-3 w-3 border-t border-l ${feature.borderColor.split(" ")[0]}`}
                />
                <div
                  className={`absolute -top-px -right-px h-3 w-3 border-t border-r ${feature.borderColor.split(" ")[0]}`}
                />
                <div
                  className={`absolute -bottom-px -left-px h-3 w-3 border-b border-l ${feature.borderColor.split(" ")[0]}`}
                />
                <div
                  className={`absolute -bottom-px -right-px h-3 w-3 border-b border-r ${feature.borderColor.split(" ")[0]}`}
                />

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-border/50 bg-secondary/50">
                  <Icon
                    className={`h-6 w-6 ${feature.color} transition-transform group-hover:scale-110`}
                  />
                </div>

                <h3 className="mb-3 font-sans text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>

                <span
                  className={`inline-flex items-center gap-2 text-sm font-medium ${feature.color} transition-colors`}
                >
                  Explore
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Data Sources */}
      <section className="relative border-t border-border/30">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <Satellite className="h-3 w-3" />
              Data Sources
            </div>
            <h3 className="mb-4 font-sans text-lg font-semibold text-foreground">
              Powered by Science
            </h3>
            <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              All data sourced from NASA Jet Propulsion Laboratory, European
              Space Agency (ESA), International Astronomical Union (IAU), and
              peer-reviewed astronomical research. Orbital mechanics calculated
              using NASA/JPL Horizons system data.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              {[
                "NASA JPL",
                "ESA",
                "IAU",
                "Cassini Mission",
                "Juno Mission",
                "New Horizons",
              ].map((source, i) => (
                <span key={source} className="flex items-center gap-2">
                  {i > 0 && <span className="text-border">|</span>}
                  <span className="hover:text-primary transition-colors">
                    {source}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-1/2 h-px w-1/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </section>
    </div>
  );
}
