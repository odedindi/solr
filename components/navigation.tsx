"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Globe, Compass, Ruler, Home, Menu, X, Satellite } from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explorer", label: "Explorer", icon: Globe },
  { href: "/planets", label: "Planets", icon: Compass },
  { href: "/distances", label: "Distances", icon: Ruler },
]

export function Navigation() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/70 backdrop-blur-2xl">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 transition-all group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Satellite className="h-5 w-5 text-primary" />
            {/* Corner accents */}
            <div className="absolute -top-px -left-px h-2 w-2 border-t border-l border-primary/50" />
            <div className="absolute -top-px -right-px h-2 w-2 border-t border-r border-primary/50" />
            <div className="absolute -bottom-px -left-px h-2 w-2 border-b border-l border-primary/50" />
            <div className="absolute -bottom-px -right-px h-2 w-2 border-b border-r border-primary/50" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-lg font-bold tracking-wide text-foreground">
              Solr
            </span>
            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-primary/70">
              Solar System
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <>
                    <div className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20" />
                    <div className="absolute bottom-0 left-1/2 h-px w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary to-transparent" />
                  </>
                )}
                <Icon className={cn("relative h-4 w-4", isActive && "drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]")} />
                <span className="relative">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Status indicator - decorative */}
        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex items-center gap-2 rounded-full border border-border/50 bg-secondary/30 px-3 py-1.5">
            <div className="relative h-2 w-2">
              <div className="absolute inset-0 animate-ping rounded-full bg-green-500/50" />
              <div className="absolute inset-0 rounded-full bg-green-500" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Systems Online
            </span>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground md:hidden transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border/30 bg-background/95 backdrop-blur-2xl md:hidden">
          <div className="flex flex-col gap-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]")} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
