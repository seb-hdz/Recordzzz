import type { Wave, WaveItem } from "@/domain/types";
import type { WaveRepositoryPort, CreateWaveInput } from "@/ports/wave.repository.port";
import type { ItemRepositoryPort } from "@/ports/item.repository.port";

export class WaveService {
  constructor(
    private readonly waveRepo: WaveRepositoryPort,
    private readonly itemRepo: ItemRepositoryPort
  ) {}

  async getAllWaves(): Promise<Wave[]> {
    return await this.waveRepo.listAll();
  }

  async getWaveById(id: number): Promise<Wave | undefined> {
    return await this.waveRepo.getById(id);
  }

  async listLines(waveId: number): Promise<WaveItem[]> {
    return await this.waveRepo.listLines(waveId);
  }

  async listAllLines(): Promise<WaveItem[]> {
    return await this.waveRepo.listAllLines();
  }

  async createWave(input: CreateWaveInput): Promise<number> {
    return await this.waveRepo.create(await this.prepare(input));
  }

  async updateWave(id: number, input: CreateWaveInput): Promise<void> {
    const existing = await this.waveRepo.getById(id);
    if (!existing) {
      throw new Error("La importación ya no existe.");
    }
    await this.waveRepo.update(id, await this.prepare(input));
  }

  async deleteWave(id: number): Promise<void> {
    await this.waveRepo.delete(id);
  }

  private async prepare(input: CreateWaveInput): Promise<CreateWaveInput> {
    const name = input.name.trim();
    if (!name) {
      throw new Error("El nombre de la importación es obligatorio.");
    }

    if (input.lines.length === 0) {
      throw new Error("Selecciona al menos un artículo.");
    }

    const seen = new Set<number>();
    for (const line of input.lines) {
      if (!Number.isInteger(line.quantity) || line.quantity < 1) {
        throw new Error("La cantidad de cada artículo debe ser al menos 1.");
      }
      if (seen.has(line.item_id)) {
        throw new Error("Cada artículo solo puede aparecer una vez en la importación.");
      }
      seen.add(line.item_id);
      const item = await this.itemRepo.getById(line.item_id);
      if (!item) {
        throw new Error("Uno de los artículos seleccionados ya no existe.");
      }
    }

    const shippingAmount = input.shipping_amount_cents;
    const hasCurrency = input.shipping_currency !== undefined;
    const hasAmount = shippingAmount !== undefined;
    if (hasCurrency !== hasAmount) {
      throw new Error("El envío necesita moneda y monto, o ninguno de los dos.");
    }
    if (hasAmount && (!Number.isInteger(shippingAmount) || shippingAmount <= 0)) {
      throw new Error("El costo de envío debe ser mayor a cero.");
    }

    return {
      ...input,
      name,
    };
  }
}
