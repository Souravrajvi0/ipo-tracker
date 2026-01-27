import * as cheerio from "cheerio";
import {
  BaseScraper,
  IpoData,
  SubscriptionData,
  GmpData,
  ScraperResult,
  normalizeSymbol,
  parseSubscriptionValue,
} from "./base";

const URLS = {
  subscriptionLive: "https://www.investorgain.com/report/ipo-subscription-live/333/all/",
  gmpPage: "https://www.investorgain.com/report/ipo-gmp/333/",
};

export class InvestorGainScraper extends BaseScraper {
  constructor() {
    super("InvestorGain");
  }

  async getIpos(): Promise<ScraperResult<IpoData>> {
    const startTime = Date.now();
    this.log("IPO list not available from InvestorGain - use other sources");
    return this.wrapResult([], startTime);
  }

  async getSubscriptions(): Promise<ScraperResult<SubscriptionData>> {
    const startTime = Date.now();

    try {
      const html = await this.fetchPage(URLS.subscriptionLive);
      const $ = cheerio.load(html);
      const subscriptions: SubscriptionData[] = [];

      $("table.dataTable, table.table").each((_, table) => {
        $(table).find("tbody tr, tr").each((_, row) => {
          const cells = $(row).find("td");
          if (cells.length < 5) return;

          const companyName = cells.eq(0).text().trim();
          if (!companyName || companyName.length < 3) return;
          if (companyName.toLowerCase().includes("company") || companyName.toLowerCase().includes("ipo name")) return;

          const symbol = normalizeSymbol(companyName);

          subscriptions.push({
            symbol,
            companyName,
            qib: parseSubscriptionValue(cells.eq(1).text()),
            nii: parseSubscriptionValue(cells.eq(2).text()),
            hni: parseSubscriptionValue(cells.eq(2).text()),
            retail: parseSubscriptionValue(cells.eq(3).text()),
            total: parseSubscriptionValue(cells.eq(4).text()),
            applications: cells.length > 5 ? parseSubscriptionValue(cells.eq(5).text()) : null,
          });
        });
      });

      this.log(`Found ${subscriptions.length} subscription records`);
      return this.wrapResult(subscriptions, startTime);
    } catch (err: any) {
      this.error("Failed to get subscriptions", err);
      return this.wrapResult([], startTime, err.message);
    }
  }

  async getGmp(): Promise<ScraperResult<GmpData>> {
    const startTime = Date.now();

    try {
      const html = await this.fetchPage(URLS.gmpPage);
      const $ = cheerio.load(html);
      const gmpData: GmpData[] = [];

      $("table.dataTable, table.table").each((_, table) => {
        $(table).find("tbody tr, tr").each((_, row) => {
          const cells = $(row).find("td");
          if (cells.length < 3) return;

          const companyName = cells.eq(0).text().trim();
          if (!companyName || companyName.length < 3) return;
          if (companyName.toLowerCase().includes("company") || companyName.toLowerCase().includes("ipo name")) return;

          const symbol = normalizeSymbol(companyName);

          const gmpText = cells.eq(1).text().trim();
          const gmpMatch = gmpText.match(/[+-]?\s*₹?\s*(\d+)/);
          const gmp = gmpMatch ? parseInt(gmpMatch[1], 10) : 0;

          const priceText = cells.eq(2).text().trim();
          const priceMatch = priceText.match(/₹?\s*(\d+)/);
          const expectedListing = priceMatch ? parseInt(priceMatch[1], 10) : null;

          const percentMatch = gmpText.match(/\(([+-]?\d+\.?\d*)%\)/);
          const gmpPercent = percentMatch ? parseFloat(percentMatch[1]) : null;

          gmpData.push({
            symbol,
            companyName,
            gmp,
            expectedListing,
            gmpPercent,
          });
        });
      });

      this.log(`Found ${gmpData.length} GMP records`);
      return this.wrapResult(gmpData, startTime);
    } catch (err: any) {
      this.error("Failed to get GMP data", err);
      return this.wrapResult([], startTime, err.message);
    }
  }
}

export const investorGainScraper = new InvestorGainScraper();
