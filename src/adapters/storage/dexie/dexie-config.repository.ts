import { AppConfig, DEFAULT_APP_CONFIG } from "@/domain/types";
import { ConfigRepositoryPort } from "@/ports/config.repository.port";
import { db } from "./db";

export class DexieConfigRepository implements ConfigRepositoryPort {
  async getConfig(): Promise<AppConfig> {
    const existing = await db.config.get("global");
    if (!existing) {
      await db.config.add(DEFAULT_APP_CONFIG);
      return DEFAULT_APP_CONFIG;
    }
    return existing;
  }

  async updateConfig(
    updates: Partial<Omit<AppConfig, "id">>
  ): Promise<AppConfig> {
    const current = await this.getConfig();
    const updated: AppConfig = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await db.config.put(updated);
    return updated;
  }
}
