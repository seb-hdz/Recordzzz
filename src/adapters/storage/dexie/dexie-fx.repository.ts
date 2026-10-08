import type { Currency } from "@/domain/types";
import type { FxQuote } from "@/domain/fx";
import { db } from "./db";

export class DexieFxQuoteRepository {
  async get(base: Currency): Promise<FxQuote | undefined> {
    return await db.fxQuotes.get(base);
  }

  async put(quote: FxQuote): Promise<void> {
    await db.fxQuotes.put(JSON.parse(JSON.stringify(quote)) as FxQuote);
  }
}
