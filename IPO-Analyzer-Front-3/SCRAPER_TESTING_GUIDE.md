# Scraper Testing Guide 🧪

Complete guide to test all IPO scrapers in the system.

## 🚀 Quick Start

All endpoints are available at `http://localhost:5000/api/debug/scrapers/...` (development only)

### Test All Scrapers
```bash
curl http://localhost:5000/api/debug/scrapers/test-all
```

### Get All IPOs (Aggregated)
```bash
curl http://localhost:5000/api/debug/scrapers/ipos
```

---

## 📋 Available Endpoints

### 1. **Test All Scrapers**
```
GET /api/debug/scrapers/test-all
```

**Response:**
```json
{
  "timestamp": "2026-01-23T10:30:00.000Z",
  "totalTime": 2345,
  "sources": [
    { "source": "nsetools", "success": true, "responseTimeMs": 234 },
    { "source": "groww", "success": true, "responseTimeMs": 567 },
    { "source": "chittorgarh", "success": true, "responseTimeMs": 123 },
    { "source": "investorgain", "success": false, "responseTimeMs": 456, "error": "..." },
    { "source": "nse", "success": true, "responseTimeMs": 789 }
  ],
  "summary": {
    "total": 5,
    "success": 4,
    "failed": 1,
    "successRate": "80.0%"
  }
}
```

---

### 2. **Test Single Scraper**
```
GET /api/debug/scrapers/test/:source
```

**Sources:** `nsetools`, `groww`, `chittorgarh`, `investorgain`, `nse`

**Example:**
```bash
curl http://localhost:5000/api/debug/scrapers/test/nsetools
```

**Response:**
```json
{
  "timestamp": "2026-01-23T10:30:00.000Z",
  "source": "nsetools",
  "success": true,
  "responseTimeMs": 234,
  "totalTime": 250,
  "error": null
}
```

---

### 3. **Fetch Aggregated IPOs**
```
GET /api/debug/scrapers/ipos?sources=nsetools,groww,chittorgarh
```

**Query Parameters:**
- `sources` (optional) - Comma-separated list of sources to use
  - Default: `nsetools,groww,chittorgarh`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "TECHCORP",
      "companyName": "Tech Corp Ltd",
      "openDate": "25-Jan-2026",
      "closeDate": "29-Jan-2026",
      "priceRange": "₹250 - ₹300",
      "status": "upcoming",
      "sources": ["nsetools", "groww"],
      "confidence": "high",
      "lastUpdated": "2026-01-23T10:30:00.000Z"
    }
  ],
  "sourceResults": [
    { "source": "nsetools", "success": true, "count": 15, "responseTimeMs": 234 },
    { "source": "groww", "success": true, "count": 14, "responseTimeMs": 567 }
  ],
  "totalSources": 2,
  "successfulSources": 2,
  "timestamp": "2026-01-23T10:30:00.000Z",
  "totalTime": 890,
  "dataPoints": {
    "totalIpos": 20,
    "byStatus": {
      "upcoming": 12,
      "open": 5,
      "closed": 3,
      "listed": 0
    },
    "byConfidence": {
      "high": 18,
      "medium": 2,
      "low": 0
    },
    "avgSourcesPerIpo": "1.75"
  }
}
```

---

### 4. **Fetch Aggregated Subscriptions**
```
GET /api/debug/scrapers/subscriptions?sources=nsetools,chittorgarh,groww,investorgain
```

**Query Parameters:**
- `sources` (optional) - Default: `nsetools,chittorgarh,groww,investorgain`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "TECHCORP",
      "companyName": "Tech Corp Ltd",
      "qib": 123.45,
      "nii": null,
      "hni": 56.78,
      "retail": 89.12,
      "total": 189.35,
      "sources": ["nsetools", "chittorgarh"],
      "confidence": "high",
      "lastUpdated": "2026-01-23T10:30:00.000Z"
    }
  ],
  "sourceResults": [
    { "source": "nsetools", "success": true, "count": 8, "responseTimeMs": 234 },
    { "source": "chittorgarh", "success": true, "count": 10, "responseTimeMs": 456 }
  ],
  "totalTime": 745,
  "dataPoints": {
    "totalRecords": 12,
    "byConfidence": {
      "high": 10,
      "medium": 2,
      "low": 0
    },
    "avgSourcesPerRecord": "1.67"
  }
}
```

---

### 5. **Fetch Aggregated GMP Data**
```
GET /api/debug/scrapers/gmp?sources=groww,chittorgarh
```

**Query Parameters:**
- `sources` (optional) - Default: `groww,chittorgarh`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "TECHCORP",
      "companyName": "Tech Corp Ltd",
      "gmp": 45,
      "expectedListing": 350,
      "gmpPercent": 15.0,
      "sources": ["groww", "chittorgarh"],
      "trend": "rising",
      "lastUpdated": "2026-01-23T10:30:00.000Z"
    }
  ],
  "sourceResults": [
    { "source": "groww", "success": true, "count": 8, "responseTimeMs": 567 },
    { "source": "chittorgarh", "success": true, "count": 7, "responseTimeMs": 123 }
  ],
  "totalTime": 810,
  "dataPoints": {
    "totalRecords": 12,
    "byTrend": {
      "rising": 7,
      "falling": 3,
      "stable": 2
    },
    "byConfidence": {
      "high": 8,
      "medium": 4
    }
  }
}
```

---

### 6. **Get Scraper Statistics**
```
GET /api/debug/scrapers/stats
```

**Response:**
```json
{
  "timestamp": "2026-01-23T10:30:00.000Z",
  "scrapers": [
    { "name": "nsetools", "online": true, "responseTime": 234, "error": null },
    { "name": "groww", "online": true, "responseTime": 567, "error": null },
    { "name": "chittorgarh", "online": true, "responseTime": 123, "error": null },
    { "name": "investorgain", "online": false, "responseTime": 5000, "error": "Connection timeout" },
    { "name": "nse", "online": true, "responseTime": 789, "error": null }
  ],
  "summary": {
    "totalScrapers": 5,
    "onlineScrapers": 4,
    "avgResponseTime": "540",
    "allOnline": false
  }
}
```

---

### 7. **Fetch from Specific Source (IPOs)**
```
GET /api/debug/scrapers/source/:name/ipos
```

**Names:** `nsetools`, `groww`, `chittorgarh`, `investorgain`, `nse`

**Example:**
```bash
curl http://localhost:5000/api/debug/scrapers/source/nsetools/ipos
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "TECHCORP",
      "companyName": "Tech Corp Ltd",
      "openDate": "25-Jan-2026",
      "closeDate": "29-Jan-2026",
      "priceRange": "₹250 - ₹300",
      "status": "upcoming",
      "ipoType": "mainboard"
    }
  ],
  "source": "NSETools",
  "timestamp": "2026-01-23T10:30:00.000Z",
  "responseTimeMs": 234,
  "totalTime": 250
}
```

---

### 8. **Fetch from Specific Source (Subscriptions)**
```
GET /api/debug/scrapers/source/:name/subscriptions
```

**Names:** `nsetools`, `groww`, `chittorgarh`, `investorgain`, `nse`

**Example:**
```bash
curl http://localhost:5000/api/debug/scrapers/source/chittorgarh/subscriptions
```

---

## 🧪 Test Scenarios

### Scenario 1: Check if All Sources are Online
```bash
curl http://localhost:5000/api/debug/scrapers/test-all | jq '.summary'
```

Expected output:
```json
{
  "total": 5,
  "success": 5,
  "failed": 0,
  "successRate": "100.0%"
}
```

---

### Scenario 2: Compare Data Across Sources
```bash
# Get IPOs from NSETools only
curl "http://localhost:5000/api/debug/scrapers/source/nsetools/ipos" | jq '.data | length'

# Get IPOs from Groww only
curl "http://localhost:5000/api/debug/scrapers/source/groww/ipos" | jq '.data | length'

# Get aggregated (all sources)
curl "http://localhost:5000/api/debug/scrapers/ipos" | jq '.dataPoints.totalIpos'
```

---

### Scenario 3: Check Data Quality
```bash
curl "http://localhost:5000/api/debug/scrapers/ipos" | jq '.dataPoints'
```

Look for:
- High confidence IPOs (high = multiple sources agree)
- Good coverage across statuses (upcoming, open, closed, listed)
- Average sources per IPO (should be > 1 for good redundancy)

---

### Scenario 4: Performance Analysis
```bash
curl "http://localhost:5000/api/debug/scrapers/stats" | jq '.summary'
```

Check:
- Average response time (target < 1000ms)
- All sources online
- No errors

---

## 🔍 What to Look For

### ✅ Good Signs
- ✅ All scrapers returning `success: true`
- ✅ Response times < 1000ms
- ✅ High confidence on IPOs (multiple sources agree)
- ✅ IPO counts similar across sources (±20%)
- ✅ No repeated errors

### ⚠️ Warning Signs
- ⚠️ Single source failing repeatedly
- ⚠️ Very slow response times (> 3000ms)
- ⚠️ Large discrepancies in IPO counts between sources
- ⚠️ All IPOs with "low" confidence (sources don't agree)
- ⚠️ No subscription data available

### ❌ Critical Issues
- ❌ Multiple sources offline
- ❌ Timeout errors (> 5000ms)
- ❌ Empty data (0 IPOs)
- ❌ Consistent errors in logs

---

## 📊 Example Test Flow

```bash
# 1. Check if everything is online
echo "1️⃣ Testing all scrapers..."
curl -s http://localhost:5000/api/debug/scrapers/test-all | jq '.summary'

# 2. Get overall stats
echo -e "\n2️⃣ Getting stats..."
curl -s http://localhost:5000/api/debug/scrapers/stats | jq '.summary'

# 3. Fetch aggregated data
echo -e "\n3️⃣ Fetching aggregated IPOs..."
curl -s http://localhost:5000/api/debug/scrapers/ipos | jq '.dataPoints'

# 4. Check subscription data
echo -e "\n4️⃣ Fetching subscriptions..."
curl -s http://localhost:5000/api/debug/scrapers/subscriptions | jq '.dataPoints'

# 5. Compare single sources
echo -e "\n5️⃣ Comparing sources..."
for source in nsetools groww chittorgarh investorgain nse; do
  count=$(curl -s "http://localhost:5000/api/debug/scrapers/source/$source/ipos" | jq '.data | length')
  echo "$source: $count IPOs"
done
```

---

## 🛠️ Troubleshooting

### Issue: "Connection refused"
- Make sure server is running: `npm run dev`
- Check port: 5000

### Issue: Only some scrapers online
- Check internet connection
- Target website might be blocking requests
- Try again (might be temporary)

### Issue: No data returned
- Sources might not have IPOs in season
- Check query parameters are correct
- View browser console for errors

### Issue: Slow response times
- Network might be slow
- Target websites might be slow
- Try individual source test to isolate problem

---

## 📝 Notes

- All endpoints are **development only** (disabled in production)
- Data is **real-time** (fetched when requested)
- Aggregation happens on-the-fly (no caching)
- Confidence is calculated based on source agreement
- Response times include all network delays
