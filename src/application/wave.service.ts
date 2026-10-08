import type { Wave } from "@/domain/types";
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

  async createWave(input: CreateWaveInput): Promise<number> {
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

    return await this.waveRepo.create({
      ...input,
      name,
    });
  }
}
