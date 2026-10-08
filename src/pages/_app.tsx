import { ParentComponent } from "solid-js";
import { AppProvider } from "@/application/context";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { PwaUpdatePrompt } from "@/components/pwa/PwaUpdatePrompt";
import { InstallPromptBanner } from "@/components/pwa/InstallPromptBanner";

const App: ParentComponent = (props) => {
  return (
    <AppProvider>
      <div class="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
        {/* <AppHeader /> */}
        <PwaUpdatePrompt />
        {/* <main class="flex-1 max-w-2xl w-full mx-auto px-4 pt-safe-header pb-safe-dock"> */}
        <main class="flex-1 w-full">{props.children}</main>
        <InstallPromptBanner />
        {/* <BottomNavigation /> */}
      </div>
    </AppProvider>
  );
};

export default App;
