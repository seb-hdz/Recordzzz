import { Item, ItemCategory, ItemStatus, Currency } from "@/domain/types";
import { ItemRepositoryPort, ItemFilters } from "@/ports/item.repository.port";

export interface CollectionStats {
  totalItems: number;
  byCategory: Record<ItemCategory, number>;
  byStatus: Record<ItemStatus, number>;
  totalCentsByCurrency: Record<Currency, number>;
  recentItems: Item[];
}

export class ItemService {
  constructor(private readonly itemRepo: ItemRepositoryPort) {}

  async getAllItems(): Promise<Item[]> {
    return await this.itemRepo.getAll();
  }

  async getItemById(id: number): Promise<Item | undefined> {
    return await this.itemRepo.getById(id);
  }

  async filterItems(filters: ItemFilters): Promise<Item[]> {
    return await this.itemRepo.find(filters);
  }

  async createItem(
    itemData: Omit<Item, "id" | "created_at" | "updated_at">
  ): Promise<number> {
    return await this.itemRepo.create(itemData);
  }

  async updateItem(
    id: number,
    itemData: Partial<Omit<Item, "id" | "created_at">>
  ): Promise<void> {
    await this.itemRepo.update(id, itemData);
  }

  async deleteItem(id: number): Promise<void> {
    await this.itemRepo.delete(id);
  }

  async getCollectionStats(): Promise<CollectionStats> {
    const items = await this.itemRepo.getAll();

    const byCategory: Record<ItemCategory, number> = {
      cd: 0,
      vinyl: 0,
      boxset: 0,
      other: 0,
    };

    const byStatus: Record<ItemStatus, number> = {
      new: 0,
      openbox: 0,
      used: 0,
    };

    const totalCentsByCurrency: Record<Currency, number> = {
      PEN: 0,
      USD: 0,
      EUR: 0,
      JPY: 0,
      CAD: 0,
      AUD: 0,
      GBP: 0,
    };

    for (const item of items) {
      // Categories
      for (const cat of item.categories) {
        if (byCategory[cat] !== undefined) {
          byCategory[cat]++;
        }
      }

      // Status
      if (byStatus[item.status] !== undefined) {
        byStatus[item.status]++;
      }

      // Currency Totals
      const curr = item.price_currency;
      if (totalCentsByCurrency[curr] !== undefined) {
        totalCentsByCurrency[curr] += item.price_amount_cents || 0;
      }
    }

    return {
      totalItems: items.length,
      byCategory,
      byStatus,
      totalCentsByCurrency,
      recentItems: items.slice(0, 5),
    };
  }
}
