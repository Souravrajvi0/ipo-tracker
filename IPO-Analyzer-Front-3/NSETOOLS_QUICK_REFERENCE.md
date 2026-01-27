# NSETools Integration - Quick Reference

## 📦 What Was Added

### New File: `server/services/scrapers/nsetools.ts`
Official NSE API scraper using NSETools library from the monolith project.

**Key Methods:**
- `fetchIpos()` - Returns upcoming + current IPOs
- `fetchSubscriptions()` - Returns subscription data
- `fetchGmp()` - Returns empty (GMP handled by other scrapers)
- `testConnection()` - Tests NSE API connectivity

## 🔄 Integration Points

### 1. **Scrapers Index** (`scrapers/index.ts`)
```typescript
export { nseToolsScraper, NseToolsScraper } from "./nsetools";
```

### 2. **Aggregator** (`scrapers/aggregator.ts`)
- **Import:** Added `import { nseToolsScraper } from "./nsetools";`
- **Default Sources:** Changed to `["nsetools", "groww", "chittorgarh"]`
- **Methods Updated:**
  - `getIpos()` - Primary source: nsetools
  - `getSubscriptions()` - Added nsetools 
  - `testConnection()` - Handles "nsetools" case
  - `testAllConnections()` - Includes nsetools

## 🚀 Usage

### Fetch IPOs with NSETools (automatic)
```typescript
import { fetchAllIpos } from "./services/scrapers";
const result = await fetchAllIpos();
// Automatically uses ["nsetools", "groww", "chittorgarh"]
```

### Fetch from specific source
```typescript
import { fetchAllIpos } from "./services/scrapers";
const result = await fetchAllIpos(["nsetools"]);
```

### Test NSETools connection
```typescript
import { testScraperConnection } from "./services/scrapers";
const isConnected = await testScraperConnection("nsetools");
```

### Get aggregated data
```typescript
import { scraperAggregator } from "./services/scrapers";
const result = await scraperAggregator.getIpos();
// Returns data with:
// - Deduplicated IPOs
// - Merged data from multiple sources
// - Confidence ratings
// - Source attribution
```

## 📊 Data Structure

**Returns AggregatedIpoData:**
```typescript
{
  // Standard IPO data
  symbol: "TECHCORP",
  companyName: "Tech Corp Ltd",
  openDate: "25-Jan-2026",
  closeDate: "29-Jan-2026",
  priceRange: "₹250 - ₹300",
  status: "upcoming" | "open" | "closed" | "listed",
  
  // Aggregation metadata
  sources: ["nsetools", "groww"],
  confidence: "high" | "medium" | "low",
  lastUpdated: Date
}
```

## ✅ Features

- ✅ Official NSE APIs as primary source
- ✅ Automatic fallback to other sources
- ✅ Data deduplication by symbol
- ✅ Confidence scoring
- ✅ Multi-source merging
- ✅ Consistent data format
- ✅ Error handling & retries
- ✅ Connection testing

## 🔗 Architecture

```
Main Service
    ↓
Aggregator (scraperAggregator)
    ├─ NseToolsScraper ← NSETools APIs
    ├─ GrowwScraper ← Groww.in
    ├─ ChittorgarhScraper ← Chittorgarh.com
    ├─ InvestorGainScraper ← InvestorGain.com
    └─ NseScraper ← NSE direct
    ↓
Merged Results (deduplicated, confidence-scored)
    ↓
Database / API / Frontend
```

## 🧪 Testing

All sources tested via:
```typescript
await testAllScrapers()
```

Returns:
```typescript
[
  { source: "nsetools", success: true, responseTimeMs: 234 },
  { source: "groww", success: true, responseTimeMs: 567 },
  // ...
]
```

## 📝 Notes

- NSETools is now the **primary/default source**
- Other sources provide enrichment and fallback
- Automatic deduplication by symbol
- Confidence increases with source agreement
- No changes needed to existing code - transparent integration
