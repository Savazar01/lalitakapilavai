import type { Metadata } from "next";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { ExhibitionWallViewer } from "@/components/public/exhibition-wall-viewer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Architectural 3D Exhibition Wall Simulator — Lalita Kapilavai",
  description:
    "Mount traditional Thanjavur and Mysore fine art masterworks in authentic Indian temple sanctums, Mysore royal darbars, and contemporary museum halls.",
};

export default function ExhibitionSimulatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        <ExhibitionWallViewer />
      </main>
      <Footer />
    </div>
  );
}
