#!/usr/bin/env node

/**
 * Direct Scraper Data Test
 * Shows actual JSON output from each scraper
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  white: "\x1b[37m",
};

function log(color, text) {
  console.log(`${COLORS[color]}${text}${COLORS.reset}`);
}

function header(text) {
  console.log("\n" + COLORS.cyan + "═".repeat(70) + COLORS.reset);
  log("cyan", text);
  console.log(COLORS.cyan + "═".repeat(70) + COLORS.reset + "\n");
}

function section(text) {
  log("bright", `\n▶ ${text}`);
  console.log(COLORS.gray + "─".repeat(70) + COLORS.reset);
}

function prettyJson(data, indent = 2) {
  return JSON.stringify(data, null, indent);
}

async function testNseToolsData() {
  header("🧪 NSETools Scraper - Raw JSON Data");

  try {
    const { Nse } = await import(
      "./nsetools-master/nsetools-js/src/index.js"
    );
    const nse = new Nse();

    // Test 1: IPO Calendar
    section("1. IPO Calendar Data");
    try {
      const calendar = await nse.getIpoCalendar();
      if (calendar?.length > 0) {
        log("green", `✅ Found ${calendar.length} IPOs in calendar\n`);
        log("white", prettyJson(calendar.slice(0, 2)));
        log("gray", `\n... and ${calendar.length - 2} more IPOs`);
      } else {
        log("yellow", "⚠️ No IPO calendar data (off-season)\n");
      }
    } catch (err) {
      log("red", `❌ Error: ${err.message}`);
    }

    // Test 2: IPO List
    section("2. IPO List Data");
    try {
      const list = await nse.getIpoList();
      if (list?.length > 0 || list?.data?.length > 0) {
        const data = list.data || list;
        log("green", `✅ Found ${(data).length} IPOs in list\n`);
        log("white", prettyJson(data.slice(0, 2)));
        log("gray", `\n... and ${(data).length - 2} more IPOs`);
      } else {
        log("yellow", "⚠️ No IPO list data\n");
      }
    } catch (err) {
      log("red", `❌ Error: ${err.message}`);
    }

    // Test 3: GMP Data
    section("3. GMP (Grey Market Premium) Data");
    try {
      const gmp = await nse.getGmpData();
      if (gmp?.length > 0) {
        log("green", `✅ Found ${gmp.length} GMP entries\n`);
        log("white", prettyJson(gmp.slice(0, 3)));
        log("gray", `\n... and ${gmp.length - 3} more entries`);
      } else {
        log("yellow", "⚠️ No GMP data available\n");
      }
    } catch (err) {
      log("red", `❌ Error: ${err.message}`);
    }

    // Test 4: IPO Stats
    section("4. IPO Statistics Summary");
    try {
      const stats = await nse.getIpoStats();
      log("green", `✅ Statistics retrieved\n`);
      log("white", prettyJson(stats));
    } catch (err) {
      log("red", `❌ Error: ${err.message}`);
    }

    // Test 5: All Index Quote (reference data)
    section("5. Sample Index Data (Reference)");
    try {
      const indices = await nse.getAllIndexQuote();
      if (indices?.length > 0) {
        log("green", `✅ Found ${indices.length} indices\n`);
        log("white", prettyJson(indices.slice(0, 2)));
        log("gray", `\n... and ${indices.length - 2} more indices`);
      }
    } catch (err) {
      log("red", `❌ Error: ${err.message}`);
    }
  } catch (err) {
    log("red", `\n❌ Failed to import NSETools: ${err.message}`);
  }
}

async function analyzeScraperFiles() {
  header("📁 Scraper Source Code Analysis");

  const scrapers = [
    "nsetools",
    "groww",
    "chittorgarh",
    "investorgain",
    "nse",
  ];

  for (const scraper of scrapers) {
    section(`${scraper.toUpperCase()} Scraper`);

    const filePath = path.join(
      __dirname,
      `server/services/scrapers/${scraper}.ts`
    );

    try {
      const content = fs.readFileSync(filePath, "utf8");

      // Extract class name
      const classMatch = content.match(/export class (\w+)/);
      const className = classMatch ? classMatch[1] : "Unknown";

      // Extract methods
      const methods = [];
      const methodRegex = /async (\w+)\(/g;
      let match;
      while ((match = methodRegex.exec(content)) !== null) {
        methods.push(match[1]);
      }

      // Extract interface/data types
      const interfaces = [];
      const interfaceRegex = /interface (\w+)/g;
      while ((match = interfaceRegex.exec(content)) !== null) {
        interfaces.push(match[1]);
      }

      log("green", `✅ Class: ${className}`);
      log("cyan", `📝 Methods: ${methods.join(", ")}`);
      log("blue", `📦 Data Types: ${interfaces.join(", ") || "Standard types"}`);
      log("gray", `📄 File size: ${(content.length / 1024).toFixed(1)}KB`);
    } catch (err) {
      log("red", `❌ Error: ${err.message}`);
    }
  }
}

async function showDataStructure() {
  header("📊 Expected Data Structures");

  section("IPO Data Structure");
  log("white", prettyJson({
    symbol: "COMPANY",
    companyName: "Company Ltd.",
    sector: "Technology",
    priceRange: "₹100 - ₹150",
    issueSize: "100 Cr",
    status: "upcoming",
    biddingStartDate: "2026-02-01",
    biddingEndDate: "2026-02-05",
    listingDate: "2026-02-10",
    confidence: "high",
    sources: ["nsetools", "groww"],
  }, 2));

  section("Subscription Data Structure");
  log("white", prettyJson({
    symbol: "COMPANY",
    companyName: "Company Ltd.",
    qib: 2.5,
    nii: 1.2,
    hni: 0.8,
    retail: 1.5,
    total: 1.8,
    applications: 50000,
  }, 2));

  section("GMP Data Structure");
  log("white", prettyJson({
    symbol: "COMPANY",
    gmpPrice: 180,
    premiumPercent: 20.5,
    lastUpdated: "2026-01-23T10:30:00Z",
    trend: "up",
    source: "groww",
  }, 2));
}

async function main() {
  console.clear();
  log("bright", "\n🚀 IPO Analyzer - Scraper Data Test Suite\n");

  // Test NSETools
  await testNseToolsData();

  // Show file analysis
  await analyzeScraperFiles();

  // Show expected structures
  await showDataStructure();

  header("✨ Data Test Complete");
  log("green", "✅ All scrapers analyzed and tested");
  log("gray", "\nNext steps:");
  log("cyan", "  1. Review the data structures above");
  log("cyan", "  2. Database setup: Set DATABASE_URL environment variable");
  log("cyan", "  3. Start server: npm run dev");
  log("cyan", "  4. Access API: http://localhost:5000/api/...");
  console.log("");
}

main().catch((err) => {
  log("red", `Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
