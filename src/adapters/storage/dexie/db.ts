import Dexie, { type EntityTable } from "dexie";
import type { DraftId } from "@/domain/drafts";
import type { FxQuote } from "@/domain/fx";
import { Item, AppConfig, DEFAULT_APP_CONFIG, Wave, WaveItem } from "@/domain/types";

export interface DraftRow {
  id: DraftId;
  payload: unknown;
  updated_at: string;
}

export class RecordzzzDatabase extends Dexie {
  items!: EntityTable<Item, "id">;
  config!: EntityTable<AppConfig, "id">;
  waves!: EntityTable<Wave, "id">;
  waveItems!: EntityTable<WaveItem, "id">;
  drafts!: EntityTable<DraftRow, "id">;
  fxQuotes!: EntityTable<FxQuote, "base">;

  constructor() {
    super("recordzzz-db");

    this.version(1).stores({
      items:
        "++id, name, status, price_currency, purchase_datetime, *categories, *tags, created_at, updated_at",
      config: "id",
    });

    this.version(2).stores({
      items:
        "++id, name, status, price_currency, purchase_datetime, *categories, *tags, *barcodes, created_at, updated_at",
      config: "id",
      waves: "++id, name, created_at",
      waveItems: "++id, wave_id, item_id, [wave_id+item_id]",
      drafts: "id",
    });

    this.version(3).stores({
      fxQuotes: "base",
    });

    this.on("populate", async () => {
      await this.config.add(DEFAULT_APP_CONFIG);
    });
  }
}

export const db = new RecordzzzDatabase();
