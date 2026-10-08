import { AppConfig, Item, Wave, WaveItem } from "@/domain/types";

export interface BackupData {
  version: number;
  appName: "recordzzz";
  exportedAt: string;
  items: Item[];
  waves: Wave[];
  waveItems: WaveItem[];
  config: AppConfig;
}

export interface BackupPort {
  exportData(): Promise<BackupData>;
  importData(
    data: unknown,
    mode: "replace" | "merge"
  ): Promise<{ importedCount: number }>;
}
