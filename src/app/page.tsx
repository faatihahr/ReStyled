import Image from "next/image";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { MeetRestyled } from "@/components/MeetRestyled";
import { HowItWorks } from "@/components/HowItWorks";
import { Contact } from "@/components/Contact";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-0">
        <Hero />
        <MeetRestyled />
        <HowItWorks />
        <Contact />
      </div>
    </div>
  );
}
