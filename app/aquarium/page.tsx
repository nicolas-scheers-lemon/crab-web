import type { Metadata } from "next";
import { Aquarium } from "../../src/components/Aquarium";

export const metadata: Metadata = {
  title: "Aquarium",
};

export default function AquariumPage() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0d365c]">
      <Aquarium />
    </div>
  );
}
