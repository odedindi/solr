import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D Solar System Explorer",
  description:
    "Fly through an interactive 3D model of the solar system. Control simulation speed, toggle orbits and labels, and jump to any planet or dwarf planet.",
};

export default function ExplorerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
