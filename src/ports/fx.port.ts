import type { Currency } from "@/domain/types";
import type { FxQuote } from "@/domain/fx";

export interface FxQuoteRepositoryPort {
  get(base: Currency): Promise<FxQuote | undefined>;
  put(quote: FxQuote): Promise<void>;
}

export interface FxRateClientPort {
  fetchRates(base: Currency): Promise<Omit<FxQuote, "day">>;
}
