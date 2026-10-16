import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Distance & Travel Time Calculator",
  description:
    "Compare distances between solar system bodies and see how long the trip would take on foot, by plane, aboard historic spacecraft, or at the speed of light.",
};

export default function DistancesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
