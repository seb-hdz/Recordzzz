import { Item, ItemCategory, ItemStatus } from "@/domain/types";

export interface ItemFilters {
  category?: ItemCategory;
  status?: ItemStatus;
  searchQuery?: string;
  tag?: string;
}

export interface ItemRepositoryPort {
  getAll(): Promise<Item[]>;
  getById(id: number): Promise<Item | undefined>;
  find(filters: ItemFilters): Promise<Item[]>;
  create(item: Omit<Item, "id" | "created_at" | "updated_at">): Promise<number>;
  update(id: number, item: Partial<Omit<Item, "id" | "created_at">>): Promise<void>;
  delete(id: number): Promise<void>;
  count(): Promise<number>;
}
