import { BackupData, BackupPort } from "@/ports/backup.port";
import { DEFAULT_APP_CONFIG, Item, Wave, WaveItem } from "@/domain/types";
import { parseAndSanitizeBackup } from "@/domain/backup-validation";
import { db } from "./db";

export class DexieBackupAdapter implements BackupPort {
  async exportData(): Promise<BackupData> {
    const items = await db.items.toArray();
    const waves = await db.waves.toArray();
    const waveItems = await db.waveItems.toArray();
    const config = (await db.config.get("global")) || DEFAULT_APP_CONFIG;

    return {
      version: 2,
      appName: "recordzzz",
      exportedAt: new Date().toISOString(),
      items,
      waves,
      waveItems,
      config,
    };
  }

  async importData(
    data: unknown,
    mode: "replace" | "merge"
  ): Promise<{ importedCount: number }> {
    const { items, waves, waveItems, config } = parseAndSanitizeBackup(data);

    if (mode === "replace") {
      await db.transaction(
        "rw",
        db.items,
        db.waves,
        db.waveItems,
        db.config,
        async () => {
          await db.waveItems.clear();
          await db.waves.clear();
          await db.items.clear();
          if (items.length > 0) await db.items.bulkPut(items);
          if (waves.length > 0) await db.waves.bulkPut(waves);
          if (waveItems.length > 0) await db.waveItems.bulkPut(waveItems);
          await db.config.put(config);
        }
      );
      return { importedCount: items.length };
    }

    let importedCount = 0;
    await db.transaction("rw", db.items, db.waves, db.waveItems, async () => {
      const itemIdMap = new Map<number, number>();
      for (const item of items) {
        const { id: previousId, ...withoutId } = item;
        const newId = (await db.items.add(withoutId as Item)) as number;
        if (previousId) itemIdMap.set(previousId, newId);
        importedCount++;
      }

      const waveIdMap = new Map<number, number>();
      for (const wave of waves) {
        const { id: previousId, ...withoutId } = wave;
        const newId = (await db.waves.add(withoutId as Wave)) as number;
        if (previousId) waveIdMap.set(previousId, newId);
      }

      const remapped: WaveItem[] = [];
      for (const line of waveItems) {
        const waveId = waveIdMap.get(line.wave_id);
        const itemId = itemIdMap.get(line.item_id);
        if (!waveId || !itemId) continue;
        remapped.push({
          wave_id: waveId,
          item_id: itemId,
          quantity: line.quantity,
        });
      }
      if (remapped.length > 0) await db.waveItems.bulkAdd(remapped);
    });

    return { importedCount };
  }
}
