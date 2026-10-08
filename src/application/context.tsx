import {
  createContext,
  useContext,
  ParentComponent,
} from "solid-js";
import { ItemRepositoryPort } from "@/ports/item.repository.port";
import { ConfigRepositoryPort } from "@/ports/config.repository.port";
import { BackupPort } from "@/ports/backup.port";
import { WaveRepositoryPort } from "@/ports/wave.repository.port";
import { DraftRepositoryPort } from "@/ports/draft.repository.port";
import { DexieItemRepository } from "@/adapters/storage/dexie/dexie-item.repository";
import { DexieConfigRepository } from "@/adapters/storage/dexie/dexie-config.repository";
import { DexieBackupAdapter } from "@/adapters/storage/dexie/dexie-backup.adapter";
import { DexieWaveRepository } from "@/adapters/storage/dexie/dexie-wave.repository";
import { DexieDraftRepository } from "@/adapters/storage/dexie/dexie-draft.repository";
import { ItemService } from "./item.service";
import { WaveService } from "./wave.service";
import { createThemeService, ThemeService } from "./theme.service";

interface AppContextValue {
  itemRepo: ItemRepositoryPort;
  configRepo: ConfigRepositoryPort;
  backup: BackupPort;
  itemService: ItemService;
  waveRepo: WaveRepositoryPort;
  waveService: WaveService;
  draftRepo: DraftRepositoryPort;
  themeService: ThemeService;
}

const AppContext = createContext<AppContextValue>();

export const AppProvider: ParentComponent = (props) => {
  const itemRepo = new DexieItemRepository();
  const configRepo = new DexieConfigRepository();
  const backup = new DexieBackupAdapter();
  const waveRepo = new DexieWaveRepository();
  const draftRepo = new DexieDraftRepository();
  const itemService = new ItemService(itemRepo);
  const waveService = new WaveService(waveRepo, itemRepo);
  const themeService = createThemeService(configRepo);

  const value: AppContextValue = {
    itemRepo,
    configRepo,
    backup,
    itemService,
    waveRepo,
    waveService,
    draftRepo,
    themeService,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
