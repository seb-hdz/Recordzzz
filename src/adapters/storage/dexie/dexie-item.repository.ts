import { Item } from "@/domain/types";
import {
  ItemFilters,
  ItemRepositoryPort,
} from "@/ports/item.repository.port";
import { db } from "./db";

export class DexieItemRepository implements ItemRepositoryPort {
  async getAll(): Promise<Item[]> {
    return await db.items.orderBy("created_at").reverse().toArray();
  }

  async getById(id: number): Promise<Item | undefined> {
    return await db.items.get(id);
  }

  async find(filters: ItemFilters): Promise<Item[]> {
    let collection = db.items.toCollection();

    let items = await collection.reverse().sortBy("created_at");

    if (filters.category) {
      items = items.filter((item) =>
        item.categories.includes(filters.category!)
      );
    }

    if (filters.status) {
      items = items.filter((item) => item.status === filters.status);
    }

    if (filters.tag) {
      items = items.filter((item) =>
        item.tags?.some(
          (t) => t.toLowerCase() === filters.tag!.toLowerCase()
        )
      );
    }

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return items;
  }

  async create(
    itemData: Omit<Item, "id" | "created_at" | "updated_at">
  ): Promise<number> {
    const now = new Date().toISOString();
    const newItem = JSON.parse(
      JSON.stringify({
        ...itemData,
        created_at: now,
        updated_at: now,
      })
    ) as Item;
    const id = await db.items.add(newItem);
    return id as number;
  }

  async update(
    id: number,
    itemData: Partial<Omit<Item, "id" | "created_at">>
  ): Promise<void> {
    const now = new Date().toISOString();
    await db.items.update(
      id,
      JSON.parse(
        JSON.stringify({
          ...itemData,
          updated_at: now,
        })
      )
    );
  }

  async delete(id: number): Promise<void> {
    await db.items.delete(id);
  }

  async count(): Promise<number> {
    return await db.items.count();
  }
}
