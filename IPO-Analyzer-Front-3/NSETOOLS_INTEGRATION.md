## NSETools Integration into Scrapers Architecture

### ✅ Changes Made

#### 1. **New File: `nsetools.ts`** 
   - **Location:** `server/services/scrapers/nsetools.ts`
   - **Class:** `NseToolsScraper extends BaseScraper`
   - **Purpose:** Official NSE API integration using NSETools library
   
   **Capabilities:**
   - ✅ `fetchIpos()` - Get upcoming + current IPOs
   - ✅ `fetchSubscriptions()` - Get subscription data
   - ✅ `fetchGmp()` - Returns empty (handled by other scrapers)
   - ✅ `testConnection()` - Verify NSE API connectivity

   **Features:**
   - Converts NSETools data to standard `IpoData` format
   - Parses prices, dates, and status
   - Deduplicates IPOs by symbol
   - Follows same pattern as other scrapers

#### 2. **Updated: `index.ts`**
   - Added export: `export { nseToolsScraper, NseToolsScraper } from "./nsetools";`
   - Makes NSETools available to the system

#### 3. **Updated: `aggregator.ts`**
   - Imported: `import { nseToolsScraper } from "./nsetools";`
   - Updated `getIpos()` - Added nsetools as **primary source** (first in defaults)
   - Updated `getSubscriptions()` - Added nsetools for subscription data
   - Updated `testConnection()` - Added "nsetools" case
   - Updated `testAllConnections()` - Includes nsetools in test list

### 📊 Data Flow Architecture

```
NSETools (Official NSE APIs)
    ↓
NseToolsScraper
    ├─ fetchUpcomingIpos() → getUpcomingIpos()
    ├─ fetchCurrentIpos() → getCurrentIpos()
    └─ convertToIpoData() → Standard IpoData format
    ↓
ScraperAggregator
    ├─ Merges with other sources (Groww, Chittorgarh, InvestorGain)
    ├─ Deduplicates by symbol
    ├─ Calculates confidence based on source agreement
    └─ Returns aggregated results
    ↓
Frontend & API
```

### 🔄 Source Priority

When multiple sources have the same IPO:
1. **NSETools** (Most reliable - official APIs)
2. **Groww** (Established platform)
3. **Chittorgarh** (Real-time subscription updates)
4. **InvestorGain** (Live bidding data)
5. **NSE Direct** (Legacy endpoint)

### 💾 Data Format Conversion

**NSETools Input:**
```javascript
{
  symbol: "TECHCORP",
  companyName: "Tech Corp Ltd",
  priceMin: 250,
  priceMax: 300,
  biddingStartDate: "25-Jan-2026",
  biddingEndDate: "29-Jan-2026",
  subscribed: 156.5
}
```

**Standard IpoData Output:**
```typescript
{
  symbol: "TECHCORP",
  companyName: "Tech Corp Ltd",
  openDate: "25-Jan-2026",
  closeDate: "29-Jan-2026",
  listingDate: null,
  priceRange: "₹250 - ₹300",
  priceMin: 250,
  priceMax: 300,
  lotSize: 1,
  issueSize: "TBA",
  issueSizeCrores: null,
  status: "upcoming" | "open" | "closed" | "listed",
  ipoType: "mainboard"
}
```

### 🧪 Testing

**Test Single Source:**
```typescript
import { testScraperConnection } from "./scrapers";
await testScraperConnection("nsetools");
```

**Test All Sources:**
```typescript
import { testAllScrapers } from "./scrapers";
await testAllScrapers();
```

**Fetch IPOs (with NSETools primary):**
```typescript
import { fetchAllIpos } from "./scrapers";
// Uses default sources: ["nsetools", "groww", "chittorgarh"]
const result = await fetchAllIpos();
```

### 📦 Dependencies

NSETools requires:
- `axios` - HTTP requests
- `cheerio` - HTML parsing (for NSE pages)
- `csv-parse` - CSV parsing for stock lists
- `dayjs` - Date utilities
- `jsdom` - DOM manipulation

All already in `nsetools-master/nsetools-js/package.json`

### 🚀 Benefits

✅ **Reliability** - Official NSE APIs as primary source
✅ **Modularity** - Follows existing scraper pattern
✅ **Aggregation** - Automatically merged with other sources
✅ **Fallback** - Other sources fill gaps if NSETools unavailable
✅ **Consistency** - Same data format as other scrapers
✅ **Extensibility** - Easy to add more sources

### 🔌 Integration with Main Service

The scraper service will automatically use NSETools when:
1. Main `scrapeAndTransformIPOs()` is called
2. Data scheduler polls for updates
3. API endpoints fetch IPO data
4. Admin panel syncs database

No changes needed to higher-level services - they get NSETools automatically through the aggregator!
