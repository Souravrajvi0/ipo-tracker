#!/usr/bin/env node

/**
 * Standalone Scraper Test - Direct Testing Without Server
 * Tests scrapers by directly importing and calling them
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Color codes for console output
const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function log(color, text) {
  console.log(`${COLORS[color]}${text}${COLORS.reset}`);
}

function header(text) {
  console.log("\n" + COLORS.cyan + "═".repeat(60) + COLORS.reset);
  log("cyan", text);
  console.log(COLORS.cyan + "═".repeat(60) + COLORS.reset + "\n");
}

async function testNseTools() {
  header("🧪 Testing NSETools Scraper");

  try {
    // Import NSETools
    const { Nse } = await import(
      "./nsetools-master/nsetools-js/src/index.js"
    );
    const nse = new Nse();

    log("bright", "Testing NSETools Connection...");

    // Test 1: Get IPO Calender
    log("blue", "\n1️⃣  Fetching IPO Calendar...");
    const startTime = Date.now();
    try {
      const calendar = await nse.getIpoCalendar();
      const time = Date.now() - startTime;
      log("green", `   ✅ Success (${time}ms)`);
      log("gray", `   Found: ${calendar?.length || 0} IPOs`);
      if (calendar?.length > 0) {
        log("gray", `   First IPO: ${calendar[0]?.companyName}`);
      }
    } catch (err) {
      log("red", `   ❌ Failed: ${err.message}`);
    }

    // Test 2: Upcoming IPOs
    log("blue", "\n2️⃣  Fetching Upcoming IPOs...");
    const start2 = Date.now();
    try {
      const upcoming = await nse.getUpcomingIpos();
      const time = Date.now() - start2;
      log("green", `   ✅ Success (${time}ms)`);
      log("gray", `   Found: ${upcoming?.length || 0} upcoming IPOs`);
    } catch (err) {
      log("red", `   ❌ Failed: ${err.message}`);
    }

    // Test 3: Current IPOs
    log("blue", "\n3️⃣  Fetching Current IPOs...");
    const start3 = Date.now();
    try {
      const current = await nse.getCurrentIpos();
      const time = Date.now() - start3;
      log("green", `   ✅ Success (${time}ms)`);
      log("gray", `   Found: ${current?.length || 0} current IPOs`);
    } catch (err) {
      log("red", `   ❌ Failed: ${err.message}`);
    }

    // Test 4: GMP Data
    log("blue", "\n4️⃣  Fetching GMP Data...");
    const start4 = Date.now();
    try {
      const gmp = await nse.getGmpData();
      const time = Date.now() - start4;
      log("green", `   ✅ Success (${time}ms)`);
      log("gray", `   Found: ${gmp?.length || 0} GMP entries`);
    } catch (err) {
      log("red", `   ❌ Failed: ${err.message}`);
    }

    // Test 5: IPO Stats
    log("blue", "\n5️⃣  Fetching IPO Stats...");
    const start5 = Date.now();
    try {
      const stats = await nse.getIpoStats();
      const time = Date.now() - start5;
      log("green", `   ✅ Success (${time}ms)`);
      log("gray", `   Stats: ${JSON.stringify(stats).substring(0, 100)}...`);
    } catch (err) {
      log("red", `   ❌ Failed: ${err.message}`);
    }

    header("✨ NSETools Test Complete");
  } catch (err) {
    log("red", `\n❌ Error importing NSETools: ${err.message}`);
    log("gray", err.stack);
  }
}

async function testOtherScrapers() {
  header("🧪 Testing Other Web Scrapers");

  const scrapers = ["groww", "chittorgarh", "investorgain", "nse"];

  for (const scraper of scrapers) {
    log("blue", `\nTesting ${scraper}...`);
    const filePath = `./server/services/scrapers/${scraper}.ts`;

    if (!fs.existsSync(filePath)) {
      log("yellow", `   ⚠️  File not found: ${filePath}`);
      continue;
    }

    try {
      // Read the file to check it exists
      const content = fs.readFileSync(filePath, "utf8");
      log("green", `   ✅ File exists (${content.length} bytes)`);

      // Check for fetchIpos method
      if (content.includes("fetchIpos")) {
        log("gray", "   ✓ Has fetchIpos() method");
      }
      if (content.includes("fetchSubscriptions")) {
        log("gray", "   ✓ Has fetchSubscriptions() method");
      }
    } catch (err) {
      log("red", `   ❌ Error: ${err.message}`);
    }
  }

  header("✨ Scraper File Scan Complete");
}

async function testAggregator() {
  header("🧪 Testing Scraper Aggregator");

  const aggregatorPath = "./server/services/scrapers/aggregator.ts";

  try {
    const content = fs.readFileSync(aggregatorPath, "utf8");
    log("green", `✅ Aggregator file found (${content.length} bytes)`);

    const features = [];
    if (content.includes("nsetools")) features.push("NSETools integration");
    if (content.includes("getIpos")) features.push("getIpos() method");
    if (content.includes("getSubscriptions")) features.push("getSubscriptions() method");
    if (content.includes("dedup")) features.push("Deduplication logic");
    if (content.includes("confidence")) features.push("Confidence scoring");

    log("gray", "\nFeatures detected:");
    features.forEach((f) => log("gray", `  ✓ ${f}`));

    log("green", `\n✅ Aggregator has ${features.length} features`);
  } catch (err) {
    log("red", `❌ Error: ${err.message}`);
  }

  header("✨ Aggregator Check Complete");
}

async function showSystemInfo() {
  header("📊 System Information");

  log("gray", `Node.js version: ${process.version}`);
  log("gray", `Platform: ${process.platform}`);
  log("gray", `Architecture: ${process.arch}`);

  // Check if dependencies are installed
  const nodeModulesPath = path.join(__dirname, "node_modules");
  if (fs.existsSync(nodeModulesPath)) {
    const modules = fs.readdirSync(nodeModulesPath).length;
    log("green", `✓ Dependencies installed: ${modules} modules`);
  } else {
    log("red", `✗ node_modules not found - run: npm install`);
  }

  // Check scraper files
  const scraperDir = path.join(__dirname, "server/services/scrapers");
  const scraperFiles = fs.readdirSync(scraperDir).filter((f) => f.endsWith(".ts"));
  log("gray", `\nScraper files found: ${scraperFiles.length}`);
  scraperFiles.forEach((f) => log("gray", `  • ${f}`));

  console.log("");
}

async function main() {
  console.clear();
  log("bright", "\n🚀 IPO Analyzer - Scraper Test Suite\n");

  await showSystemInfo();

  // Test NSETools
  await testNseTools();

  // Test other scrapers
  await testOtherScrapers();

  // Test aggregator
  await testAggregator();

  header("📋 Test Summary");
  log("green", "✅ All tests completed!");
  log("gray", "\nTo run the full server with debug endpoints:");
  log("cyan", "  1. Set DATABASE_URL environment variable");
  log("cyan", "  2. Run: npm run dev");
  log("cyan", "  3. Test endpoints: http://localhost:5000/api/debug/scrapers/test-all");

  console.log("");
}

main().catch((err) => {
  log("red", `Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
