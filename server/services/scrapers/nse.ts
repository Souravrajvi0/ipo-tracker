import {
  BaseScraper,
  IpoData,
  SubscriptionData,
  GmpData,
  ScraperResult,
  normalizeSymbol,
  parseDate,
} from "./base";

const URLS = {
  currentIpos: "https://www.nseindia.com/api/ipo-current-issue",
  upcomingIpos: "https://www.nseindia.com/api/ipo-upcoming",
  pastIpos: "https://www.nseindia.com/api/ipo-past-issues",
};

const NSE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://www.nseindia.com/market-data/all-upcoming-issues-ipo",
  "Origin": "https://www.nseindia.com",
};

interface NseIpoData {
  symbol: string;
  companyName: string;
  issueStartDate: string;
  issueEndDate: string;
  issuePrice: string;
  issueSizeAmount: string;
  issueType: string;
  listingDate?: string;
}

interface NseCurrentIpo {
  symbol: string;
  companyName: string;
  issueStartDate: string;
  issueEndDate: string;
  issuePrice: string;
  issueSizeAmount: string;
  qibSubscription?: number;
  niiSubscription?: number;
  retailSubscription?: number;
  totalSubscription?: number;
}

export class NseScraper extends BaseScraper {
  private cookies: string = "";

  constructor() {
    super("NSE");
  }

  private async initSession(): Promise<void> {
    try {
      const response = await this.fetchPage("https://www.nseindia.com", {
        headers: NSE_HEADERS,
        maxRedirects: 5,
      });

      this.log("NSE session initialized");
    } catch (err) {
      this.error("Failed to init NSE session", err);
    }
  }

  async getIpos(): Promise<ScraperResult<IpoData>> {
    const startTime = Date.now();

    try {
      await this.initSession();

      const [currentIpos, upcomingIpos] = await Promise.allSettled([
        this.fetchCurrentIpos(),
        this.fetchUpcomingIpos(),
      ]);

      const ipos: IpoData[] = [];

      if (currentIpos.status === "fulfilled") {
        ipos.push(...currentIpos.value);
      }

      if (upcomingIpos.status === "fulfilled") {
        ipos.push(...upcomingIpos.value);
      }

      this.log(`Found ${ipos.length} IPOs from NSE`);
      return this.wrapResult(ipos, startTime);
    } catch (err: any) {
      this.error("Failed to get IPOs from NSE", err);
      return this.wrapResult([], startTime, err.message);
    }
  }

  private async fetchCurrentIpos(): Promise<IpoData[]> {
    try {
      const data = await this.fetchJson<NseCurrentIpo[]>(URLS.currentIpos, {
        headers: NSE_HEADERS,
      });

      return (data || []).map(ipo => this.transformNseIpo(ipo, "open"));
    } catch (err) {
      this.error("Failed to fetch current IPOs", err);
      return [];
    }
  }

  private async fetchUpcomingIpos(): Promise<IpoData[]> {
    try {
      const data = await this.fetchJson<NseIpoData[]>(URLS.upcomingIpos, {
        headers: NSE_HEADERS,
      });

      return (data || []).map(ipo => this.transformNseIpo(ipo, "upcoming"));
    } catch (err) {
      this.error("Failed to fetch upcoming IPOs", err);
      return [];
    }
  }

  private transformNseIpo(ipo: any, defaultStatus: "upcoming" | "open" | "closed"): IpoData {
    const symbol = ipo.symbol ? ipo.symbol.toUpperCase() : normalizeSymbol(ipo.companyName);

    const priceMatch = ipo.issuePrice?.match(/[\d,]+\.?\d*/g);
    let priceMin: number | null = null;
    let priceMax: number | null = null;

    if (priceMatch) {
      const prices = priceMatch.map((p: string) => parseFloat(p.replace(/,/g, "")));
      priceMin = Math.min(...prices);
      priceMax = Math.max(...prices);
    }

    const sizeMatch = ipo.issueSizeAmount?.match(/([\d,]+\.?\d*)/);
    const issueSizeCrores = sizeMatch ? parseFloat(sizeMatch[1].replace(/,/g, "")) : null;

    return {
      symbol,
      companyName: ipo.companyName,
      openDate: parseDate(ipo.issueStartDate),
      closeDate: parseDate(ipo.issueEndDate),
      listingDate: ipo.listingDate ? parseDate(ipo.listingDate) : null,
      priceRange: ipo.issuePrice || "TBA",
      priceMin,
      priceMax,
      lotSize: null,
      issueSize: ipo.issueSizeAmount || "TBA",
      issueSizeCrores,
      status: defaultStatus,
      ipoType: "mainboard",
    };
  }

  async getSubscriptions(): Promise<ScraperResult<SubscriptionData>> {
    const startTime = Date.now();

    try {
      await this.initSession();

      const data = await this.fetchJson<NseCurrentIpo[]>(URLS.currentIpos, {
        headers: NSE_HEADERS,
      });

      const subscriptions: SubscriptionData[] = [];

      for (const ipo of data || []) {
        if (ipo.totalSubscription) {
          subscriptions.push({
            symbol: ipo.symbol?.toUpperCase() || normalizeSymbol(ipo.companyName),
            companyName: ipo.companyName,
            qib: ipo.qibSubscription || null,
            nii: ipo.niiSubscription || null,
            hni: ipo.niiSubscription || null,
            retail: ipo.retailSubscription || null,
            total: ipo.totalSubscription,
            applications: null,
          });
        }
      }

      this.log(`Found ${subscriptions.length} subscription records from NSE`);
      return this.wrapResult(subscriptions, startTime);
    } catch (err: any) {
      this.error("Failed to get subscriptions from NSE", err);
      return this.wrapResult([], startTime, err.message);
    }
  }

  async getGmp(): Promise<ScraperResult<GmpData>> {
    const startTime = Date.now();
    this.log("GMP data not available from NSE (unofficial data)");
    return this.wrapResult([], startTime);
  }
}

export const nseScraper = new NseScraper();
