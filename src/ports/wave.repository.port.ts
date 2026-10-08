import type { Currency, Wave, WaveItem } from "@/domain/types";

export interface CreateWaveLine {
  item_id: number;
  quantity: number;
}

export interface CreateWaveInput {
  name: string;
  shipping_currency?: Currency;
  shipping_amount_cents?: number;
  lines: CreateWaveLine[];
}

export interface WaveRepositoryPort {
  create(input: CreateWaveInput): Promise<number>;
  getById(id: number): Promise<Wave | undefined>;
  listAll(): Promise<Wave[]>;
  listLines(waveId: number): Promise<WaveItem[]>;
}
