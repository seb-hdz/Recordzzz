import { AppConfig } from "@/domain/types";

export interface ConfigRepositoryPort {
  getConfig(): Promise<AppConfig>;
  updateConfig(updates: Partial<Omit<AppConfig, "id">>): Promise<AppConfig>;
}
