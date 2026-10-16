import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Planets & Dwarf Planets",
    template: "%s | Solr",
  },
  description:
    "Encyclopedia of the eight planets and the dwarf planets: size, mass, gravity, temperature, orbit and moons, sourced from NASA JPL, ESA and the IAU.",
};

export default function PlanetsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
