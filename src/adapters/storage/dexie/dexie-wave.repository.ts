import type { Wave, WaveItem } from "@/domain/types";
import type {
  CreateWaveInput,
  WaveRepositoryPort,
} from "@/ports/wave.repository.port";
import { db } from "./db";

export class DexieWaveRepository implements WaveRepositoryPort {
  async create(input: CreateWaveInput): Promise<number> {
    const now = new Date().toISOString();
    const lines = JSON.parse(JSON.stringify(input.lines)) as CreateWaveInput["lines"];

    return await db.transaction("rw", db.waves, db.waveItems, async () => {
      const waveId = (await db.waves.add({
        name: input.name,
        shipping_currency: input.shipping_currency,
        shipping_amount_cents: input.shipping_amount_cents,
        created_at: now,
        updated_at: now,
      })) as number;

      await db.waveItems.bulkAdd(
        lines.map((line) => ({
          wave_id: waveId,
          item_id: line.item_id,
          quantity: line.quantity,
        }))
      );

      return waveId;
    });
  }

  async getById(id: number): Promise<Wave | undefined> {
    return await db.waves.get(id);
  }

  async listAll(): Promise<Wave[]> {
    return await db.waves.orderBy("created_at").reverse().toArray();
  }

  async listLines(waveId: number): Promise<WaveItem[]> {
    return await db.waveItems.where("wave_id").equals(waveId).toArray();
  }
}
