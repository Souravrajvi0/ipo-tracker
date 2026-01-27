# 🧪 Scraper Testing - Complete Setup

You now have **3 ways to test** all your IPO scrapers (NSETools, Groww, Chittorgarh, InvestorGain, NSE).

---

## ✅ What Was Added

### 1. **Debug Routes** (`server/routes/scraper-debug.ts`)
- REST API endpoints for testing scrapers
- Tests individual sources and aggregated data
- Registered in `server/routes.ts` (dev only)
- 9 endpoints total

### 2. **CLI Test Tool** (`test-scrapers.js`)
- Command-line tool for testing
- Color-coded output
- Summary statistics
- Source comparison

### 3. **Testing Documentation** (`SCRAPER_TESTING_GUIDE.md`)
- Complete API documentation
- Test scenarios
- Troubleshooting guide
- Performance benchmarks

---

## 🚀 Method 1: Browser/cURL (REST API)

### Start the server
```bash
npm run dev
```

### Test in browser or cURL
```bash
# Test all scrapers
curl http://localhost:5000/api/debug/scrapers/test-all

# Get aggregated IPOs
curl http://localhost:5000/api/debug/scrapers/ipos

# Get stats
curl http://localhost:5000/api/debug/scrapers/stats
```

**Endpoints available:**
- `GET /api/debug/scrapers/test-all` - Test all sources
- `GET /api/debug/scrapers/test/:source` - Test single source
- `GET /api/debug/scrapers/ipos` - Aggregated IPOs
- `GET /api/debug/scrapers/subscriptions` - Aggregated subscriptions
- `GET /api/debug/scrapers/gmp` - GMP data
- `GET /api/debug/scrapers/stats` - Statistics
- `GET /api/debug/scrapers/source/:name/ipos` - Single source IPOs
- `GET /api/debug/scrapers/source/:name/subscriptions` - Single source subscriptions

---

## 🚀 Method 2: CLI Tool (Recommended)

### Make executable and run
```bash
chmod +x test-scrapers.js

# Run with Node
node test-scrapers.js test-all
```

### Available commands
```bash
node test-scrapers.js test-all              # Test all scrapers
node test-scrapers.js test nsetools         # Test NSETools
node test-scrapers.js test groww            # Test Groww
node test-scrapers.js test chittorgarh      # Test Chittorgarh
node test-scrapers.js ipos                  # Fetch IPOs
node test-scrapers.js subscriptions         # Fetch subscriptions
node test-scrapers.js gmp                   # Fetch GMP data
node test-scrapers.js stats                 # Get statistics
node test-scrapers.js compare               # Compare sources
```

### Example output
```
🧪 Testing All Scrapers...

┌───────────────┬──────────────┬────────┬────────┐
│ Source        │ Status       │ Time   │ Error  │
├───────────────┼──────────────┼────────┼────────┤
│ nsetools      │ ✅ OK        │ 234ms  │ -      │
│ groww         │ ✅ OK        │ 567ms  │ -      │
│ chittorgarh   │ ✅ OK        │ 123ms  │ -      │
│ investorgain  │ ❌ FAILED    │ 5000ms │ Timeout│
│ nse           │ ✅ OK        │ 789ms  │ -      │
└───────────────┴──────────────┴────────┴────────┘

📊 Summary:
┌──────────────┬────────┐
│ Total        │ 5      │
├──────────────┼────────┤
│ Success      │ 4      │
│ Failed       │ 1      │
│ Success Rate │ 80.0%  │
│ Total Time   │ 2.3s   │
└──────────────┴────────┘
```

---

## 🚀 Method 3: Full Test Flow (Automated)

Create a test script (`test-full-flow.sh`):

```bash
#!/bin/bash

echo "🧪 Running Full Scraper Tests..."

# 1. Test all sources
echo -e "\n1️⃣ Testing all scrapers..."
node test-scrapers.js test-all

# 2. Get statistics
echo -e "\n2️⃣ Getting system statistics..."
node test-scrapers.js stats

# 3. Get aggregated IPOs
echo -e "\n3️⃣ Fetching aggregated IPOs..."
node test-scrapers.js ipos

# 4. Compare sources
echo -e "\n4️⃣ Comparing data across sources..."
node test-scrapers.js compare

echo -e "\n✅ All tests completed!"
```

Run it:
```bash
chmod +x test-full-flow.sh
./test-full-flow.sh
```

---

## 📊 Test Results Interpretation

### ✅ Good Results
```
Status:        4/5 online (80%)
Avg Response:  ~500ms
Confidence:    High (multiple sources agree)
Data Quality:  ✅ All statuses represented
```

### ⚠️ Warning Signs
```
Status:        < 70% online
Response time: > 2000ms
Confidence:    Only 1 source per IPO
Data gaps:     Some statuses missing
```

### ❌ Critical Issues
```
Status:        < 50% online
Response time: > 5000ms
Errors:        Connection failed, timeouts
Data:          Empty or 0 records
```

---

## 🔍 Detailed Testing Checklist

Use this when you want comprehensive verification:

```bash
# 1. Check if server is running
echo "1. Testing server..."
curl -s http://localhost:5000/api/subscription || echo "Server not running!"

# 2. Test each source individually
echo -e "\n2. Testing individual scrapers..."
for source in nsetools groww chittorgarh investorgain nse; do
  echo -n "$source: "
  curl -s "http://localhost:5000/api/debug/scrapers/test/$source" | jq '.success'
done

# 3. Check aggregation
echo -e "\n3. Checking aggregation..."
curl -s http://localhost:5000/api/debug/scrapers/ipos | jq '.dataPoints'

# 4. Verify confidence scoring
echo -e "\n4. Confidence distribution..."
curl -s http://localhost:5000/api/debug/scrapers/ipos | jq '.data[] | select(.confidence == "high") | .symbol' | wc -l
echo "high confidence IPOs found"

# 5. Check for duplicates
echo -e "\n5. Checking for duplicates..."
curl -s http://localhost:5000/api/debug/scrapers/ipos | jq '[.data[].symbol] | unique | length' | jq '. as $unique | input | length as $total | {unique: $unique, total: $total, duplicates: ($total - $unique)}'
```

---

## 🎯 Common Test Scenarios

### Scenario 1: "Is everything working?"
```bash
node test-scrapers.js test-all
# Look for: 5 success, 0 failed
```

### Scenario 2: "Which source is slow?"
```bash
node test-scrapers.js test-all | grep "Time"
# Look for: All < 1000ms
```

### Scenario 3: "Do all sources have same IPOs?"
```bash
node test-scrapers.js compare
# Look for: Similar IPO counts across sources
```

### Scenario 4: "Is data quality good?"
```bash
node test-scrapers.js ipos
# Look for: High confidence, multiple sources per IPO
```

### Scenario 5: "Get latest data"
```bash
curl "http://localhost:5000/api/debug/scrapers/ipos" | jq '.data | length'
# Returns: Total number of aggregated IPOs
```

---

## 🛠️ Troubleshooting

### "Cannot GET /api/debug/scrapers/test-all"
- Make sure server is in development mode
- Check NODE_ENV !== "production"
- Restart server: `npm run dev`

### "Connection refused"
- Server isn't running
- Wrong port (should be 5000)
- Start with: `npm run dev`

### "Empty data returned"
- No IPO season (check dates)
- All sources offline (test individually)
- Network blocked in your area

### "Some sources fail"
- Check internet connection
- Target website might be blocking
- Try again (might be temporary)
- Test individually: `node test-scrapers.js test groww`

### "Slow response (> 3000ms)"
- Network latency
- Target website slow
- Too many requests at once
- Try testing one source at a time

---

## 📈 Performance Benchmarks

**Target metrics:**
- Response time: < 1000ms
- Success rate: > 95%
- Data freshness: < 5 minutes old
- Confidence: > 80% high confidence IPOs

**Healthy system:**
- NSETools: 200-400ms
- Groww: 400-800ms
- Chittorgarh: 100-300ms
- InvestorGain: 500-1500ms (can be slow)
- NSE: 600-1000ms

---

## 🔄 Continuous Testing

For CI/CD or monitoring, use this health check:

```bash
#!/bin/bash
# Check scraper health every 5 minutes

while true; do
  result=$(curl -s http://localhost:5000/api/debug/scrapers/test-all)
  success=$(echo $result | jq '.summary.success')
  total=$(echo $result | jq '.summary.total')
  
  if [ "$success" -lt "$total" ]; then
    echo "⚠️ WARNING: Some scrapers offline ($(($total - $success)) failed)"
    # Send alert, log, etc.
  else
    echo "✅ All scrapers OK"
  fi
  
  sleep 300
done
```

---

## 📞 Support

If tests fail:

1. Check individual sources: `node test-scrapers.js test nsetools`
2. Check logs: `npm run dev` (see server output)
3. Check network: Can you access the websites directly?
4. Check API changes: Target websites may have updated APIs
5. Review: `SCRAPER_TESTING_GUIDE.md` for detailed help

---

## ✨ Summary

You can now:
- ✅ Test all scrapers simultaneously
- ✅ Test individual sources for isolation
- ✅ Get detailed performance metrics
- ✅ Compare data across sources
- ✅ Monitor scraper health
- ✅ Debug integration issues
- ✅ Verify data quality

Start testing now:
```bash
npm run dev
node test-scrapers.js test-all
```
