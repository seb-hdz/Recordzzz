import WaveBackground from "@/components/global/WaveBackground";
import HomeActions from "./HomeActions";
import HomeSummary from "./HomeSummary";

export default function Home() {
  return (
    <main class="relative flex h-full flex-col overflow-hidden">
      <WaveBackground />
      <div class="relative z-10 flex h-full w-full flex-col bg-background/30 px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(1.25rem+env(safe-area-inset-top,0px))] backdrop-blur-xs">
        <HomeSummary />
        <hr class="mb-4 mt-10 h-px shrink-0 border-none bg-ring/20" />
        <HomeActions />
      </div>
    </main>
  );
}
