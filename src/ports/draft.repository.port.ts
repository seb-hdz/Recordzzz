import type { DraftId } from "@/domain/drafts";

export interface DraftRow<T = unknown> {
  id: DraftId;
  payload: T;
  updated_at: string;
}

export interface DraftRepositoryPort {
  get<T>(id: DraftId): Promise<DraftRow<T> | undefined>;
  put<T>(id: DraftId, payload: T): Promise<void>;
  delete(id: DraftId): Promise<void>;
}
