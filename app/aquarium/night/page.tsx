import type { Metadata } from "next";
import { Aquarium } from "../../../src/components/Aquarium";

export const metadata: Metadata = {
  title: "Aquarium by night",
};

export default function NightAquariumPage() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#03091e]">
      <Aquarium night />
    </div>
  );
}
