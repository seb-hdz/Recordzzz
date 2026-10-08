import type { Currency } from "@/domain/types";
import type { FxQuote } from "@/domain/fx";
import type { FxQuoteRepositoryPort, FxRateClientPort } from "@/ports/fx.port";

export class FxService {
  constructor(
    private readonly quotes: FxQuoteRepositoryPort,
    private readonly client: FxRateClientPort
  ) {}

  async getRates(base: Currency, today: string): Promise<FxQuote | null> {
    const cached = await this.quotes.get(base);
    if (cached?.day === today) return cached;

    try {
      const fresh = await this.client.fetchRates(base);
      const quote: FxQuote = { ...fresh, day: today };
      await this.quotes.put(quote);
      return quote;
    } catch {
      return cached ?? null;
    }
  }
}
