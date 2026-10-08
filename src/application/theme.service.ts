import { createSignal, createEffect, onCleanup } from "solid-js";
import {
  AppConfig,
  ThemePreference,
  ThemeStorageMode,
} from "@/domain/types";
import { ConfigRepositoryPort } from "@/ports/config.repository.port";

const THEME_MODE_STORAGE_KEY = "recordzzz_theme_mode";
const THEME_AUTO_DARK_KEY = "recordzzz_theme_auto_dark_at";

export function resolveTheme(
  mode: ThemeStorageMode,
  autoDarkAt: string = "19:00",
  now: Date = new Date()
): ThemePreference {
  if (mode === "noom") return "noom";
  if (mode === "noom-dark") return "noom-dark";

  if (mode === "system") {
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ) {
      return "noom-dark";
    }
    return "noom";
  }

  const [darkH, darkM] = autoDarkAt.split(":").map((n) => parseInt(n, 10) || 0);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const darkStartMinutes = darkH * 60 + darkM;
  const darkEndMinutes = 6 * 60 + 30;

  const isNight =
    currentMinutes >= darkStartMinutes || currentMinutes < darkEndMinutes;
  return isNight ? "noom-dark" : "noom";
}

function readLocalMode(): ThemeStorageMode {
  if (typeof localStorage === "undefined") return "noom";
  const raw = localStorage.getItem(THEME_MODE_STORAGE_KEY) as ThemeStorageMode | null;
  if (
    raw === "noom" ||
    raw === "noom-dark" ||
    raw === "auto" ||
    raw === "system"
  ) {
    return raw;
  }
  return "noom";
}

function readLocalAutoDark(): string {
  if (typeof localStorage === "undefined") return "19:00";
  const raw = localStorage.getItem(THEME_AUTO_DARK_KEY);
  return raw && /^\d{2}:\d{2}$/.test(raw) ? raw : "19:00";
}

function writeLocal(mode: ThemeStorageMode, autoDarkAt: string) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  localStorage.setItem(THEME_AUTO_DARK_KEY, autoDarkAt);
}

export function createThemeService(configRepo: ConfigRepositoryPort) {
  const [themeMode, setThemeModeState] = createSignal<ThemeStorageMode>(
    readLocalMode()
  );
  const [autoDarkAt, setAutoDarkAtState] = createSignal<string>(
    readLocalAutoDark()
  );
  const [scheduleTick, setScheduleTick] = createSignal(Date.now());
  let skipNextPersist = true;

  void configRepo.getConfig().then(async (config) => {
    const hasLocal =
      typeof localStorage !== "undefined" &&
      localStorage.getItem(THEME_MODE_STORAGE_KEY) !== null;

    if (hasLocal) {
      const mode = readLocalMode();
      const auto = readLocalAutoDark();
      skipNextPersist = true;
      setThemeModeState(mode);
      setAutoDarkAtState(auto);
      if (mode !== config.themeMode || auto !== config.autoDarkAt) {
        await configRepo.updateConfig({ themeMode: mode, autoDarkAt: auto });
      }
      return;
    }

    skipNextPersist = true;
    setThemeModeState(config.themeMode);
    setAutoDarkAtState(config.autoDarkAt);
    writeLocal(config.themeMode, config.autoDarkAt);
  });

  if (typeof window !== "undefined") {
    const timer = setInterval(() => {
      setScheduleTick(Date.now());
    }, 60_000);

    const onVis = () => {
      if (document.visibilityState === "visible") setScheduleTick(Date.now());
    };
    document.addEventListener("visibilitychange", onVis);

    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onScheme = () => setScheduleTick(Date.now());
    media?.addEventListener?.("change", onScheme);

    onCleanup(() => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
      media?.removeEventListener?.("change", onScheme);
    });
  }

  const theme = () =>
    resolveTheme(themeMode(), autoDarkAt(), new Date(scheduleTick()));

  // DOM only — depends on resolved theme (incl. schedule ticks)
  createEffect(() => {
    const currentTheme = theme();
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", currentTheme);
    document.documentElement.classList.toggle(
      "dark",
      currentTheme === "noom-dark"
    );
  });

  // Persist prefs only when mode / autoDarkAt change
  createEffect(() => {
    const currentMode = themeMode();
    const currentAutoDark = autoDarkAt();
    writeLocal(currentMode, currentAutoDark);

    if (skipNextPersist) {
      skipNextPersist = false;
      return;
    }

    void configRepo.updateConfig({
      themeMode: currentMode,
      autoDarkAt: currentAutoDark,
    });
  });

  const setThemeMode = (mode: ThemeStorageMode) => {
    setThemeModeState(mode);
  };

  const setAutoDarkAt = (hhmm: string) => {
    setAutoDarkAtState(hhmm || "19:00");
  };

  const toggleTheme = () => {
    const current = theme();
    setThemeMode(current === "noom-dark" ? "noom" : "noom-dark");
  };

  const hydrateFromConfig = (
    config: Pick<AppConfig, "themeMode" | "autoDarkAt">
  ) => {
    skipNextPersist = true;
    setThemeModeState(config.themeMode);
    setAutoDarkAtState(config.autoDarkAt);
    writeLocal(config.themeMode, config.autoDarkAt);
  };

  return {
    theme,
    themeMode,
    autoDarkAt,
    setThemeMode,
    setAutoDarkAt,
    toggleTheme,
    hydrateFromConfig,
  };
}

export type ThemeService = ReturnType<typeof createThemeService>;
