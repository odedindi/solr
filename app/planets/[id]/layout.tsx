import type { Metadata } from "next";
import { allBodies } from "@/lib/planet-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const body = allBodies.find((b) => b.id === id);
  if (!body) return { title: "Planet not found" };

  return {
    title: body.name,
    description: body.description,
  };
}

export default function PlanetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
