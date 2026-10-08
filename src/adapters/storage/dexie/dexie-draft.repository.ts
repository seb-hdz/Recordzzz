import type { DraftId } from "@/domain/drafts";
import type { DraftRepositoryPort, DraftRow } from "@/ports/draft.repository.port";
import { db } from "./db";

export class DexieDraftRepository implements DraftRepositoryPort {
  async get<T>(id: DraftId): Promise<DraftRow<T> | undefined> {
    const row = await db.drafts.get(id);
    if (!row) return undefined;
    return row as DraftRow<T>;
  }

  async put<T>(id: DraftId, payload: T): Promise<void> {
    await db.drafts.put({
      id,
      payload,
      updated_at: new Date().toISOString(),
    });
  }

  async delete(id: DraftId): Promise<void> {
    await db.drafts.delete(id);
  }
}
