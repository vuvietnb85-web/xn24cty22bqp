import { createFileRoute } from "@tanstack/react-router";
import { PitchApp } from "@/components/pitch/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <PitchApp />;
}
