#!/usr/bin/env node

/**
 * Scraper Test CLI Tool
 * 
 * Usage:
 *   node test-scrapers.js test-all          # Test all scrapers
 *   node test-scrapers.js test nsetools     # Test single scraper
 *   node test-scrapers.js ipos              # Fetch aggregated IPOs
 *   node test-scrapers.js subscriptions     # Fetch subscriptions
 *   node test-scrapers.js gmp               # Fetch GMP data
 *   node test-scrapers.js stats             # Get statistics
 *   node test-scrapers.js compare           # Compare sources
 */

import http from "http";
import { URL } from "url";

const BASE_URL = "http://localhost:5000/api/debug/scrapers";
const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(color, text) {
  console.log(`${COLORS[color]}${text}${COLORS.reset}`);
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const request = http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    request.on("error", reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

async function testAll() {
  log("cyan", "\n🧪 Testing All Scrapers...\n");

  try {
    const result = await makeRequest("/test-all");

    console.table(
      result.sources.map((s) => ({
        Source: s.source,
        Status: s.success ? "✅ OK" : "❌ FAILED",
        Time: formatTime(s.responseTimeMs),
        Error: s.error || "-",
      }))
    );

    log("bright", `\n📊 Summary:`);
    console.table({
      Total: result.summary.total,
      Success: result.summary.success,
      Failed: result.summary.failed,
      "Success Rate": result.summary.successRate,
      "Total Time": formatTime(result.totalTime),
    });
  } catch (error) {
    log("red", `❌ Error: ${error.message}`);
  }
}

async function testOne(source) {
  log("cyan", `\n🧪 Testing Scraper: ${source}\n`);

  try {
    const result = await makeRequest(`/test/${source}`);

    if (result.success) {
      log("green", `✅ ${source} is online`);
    } else {
      log("red", `❌ ${source} failed`);
    }

    console.table({
      Source: result.source,
      Status: result.success ? "✅ OK" : "❌ FAILED",
      "Response Time": formatTime(result.responseTimeMs),
      Error: result.error || "-",
    });
  } catch (error) {
    log("red", `❌ Error: ${error.message}`);
  }
}

async function getIPOs(sources) {
  const query = sources ? `?sources=${sources.join(",")}` : "";
  log("cyan", `\n📋 Fetching IPOs${sources ? ` (${sources.join(", ")})` : ""}...\n`);

  try {
    const result = await makeRequest(`/ipos${query}`);

    log("bright", `✅ Found ${result.dataPoints.totalIpos} IPOs\n`);

    log("bright", "📊 By Status:");
    console.table(result.dataPoints.byStatus);

    log("bright", "\n📊 By Confidence:");
    console.table(result.dataPoints.byConfidence);

    log("bright", `\n📊 Average Sources per IPO: ${result.dataPoints.avgSourcesPerIpo}`);
    log("bright", `⏱️  Total Time: ${formatTime(result.totalTime)}`);
  } catch (error) {
    log("red", `❌ Error: ${error.message}`);
  }
}

async function getSubscriptions(sources) {
  const query = sources ? `?sources=${sources.join(",")}` : "";
  log(
    "cyan",
    `\n📋 Fetching Subscriptions${sources ? ` (${sources.join(", ")})` : ""}...\n`
  );

  try {
    const result = await makeRequest(`/subscriptions${query}`);

    log("bright", `✅ Found ${result.dataPoints.totalRecords} subscription records\n`);

    log("bright", "📊 By Confidence:");
    console.table(result.dataPoints.byConfidence);

    log("bright", `\n📊 Average Sources per Record: ${result.dataPoints.avgSourcesPerRecord}`);
    log("bright", `⏱️  Total Time: ${formatTime(result.totalTime)}`);
  } catch (error) {
    log("red", `❌ Error: ${error.message}`);
  }
}

async function getGMP(sources) {
  const query = sources ? `?sources=${sources.join(",")}` : "";
  log("cyan", `\n📋 Fetching GMP Data${sources ? ` (${sources.join(", ")})` : ""}...\n`);

  try {
    const result = await makeRequest(`/gmp${query}`);

    log("bright", `✅ Found ${result.dataPoints.totalRecords} GMP records\n`);

    log("bright", "📊 By Trend:");
    console.table(result.dataPoints.byTrend);

    log("bright", "\n📊 By Confidence:");
    console.table(result.dataPoints.byConfidence);

    log("bright", `\n⏱️  Total Time: ${formatTime(result.totalTime)}`);
  } catch (error) {
    log("red", `❌ Error: ${error.message}`);
  }
}

async function getStats() {
  log("cyan", "\n📈 Scraper Statistics\n");

  try {
    const result = await makeRequest("/stats");

    log("bright", "📡 Scraper Status:");
    console.table(
      result.scrapers.map((s) => ({
        Name: s.name,
        Online: s.online ? "✅" : "❌",
        "Response Time": formatTime(s.responseTime),
        Error: s.error || "-",
      }))
    );

    log("bright", "\n📊 Summary:");
    console.table({
      "Total Scrapers": result.summary.totalScrapers,
      "Online Scrapers": result.summary.onlineScrapers,
      "Average Response Time": formatTime(parseInt(result.summary.avgResponseTime)),
      "All Online": result.summary.allOnline ? "✅ Yes" : "❌ No",
    });
  } catch (error) {
    log("red", `❌ Error: ${error.message}`);
  }
}

async function compare() {
  log("cyan", "\n📊 Comparing Data Across Sources\n");

  const sources = ["nsetools", "groww", "chittorgarh", "investorgain", "nse"];
  const results = [];

  for (const source of sources) {
    try {
      const data = await makeRequest(`/source/${source}/ipos`);
      results.push({
        Source: source.charAt(0).toUpperCase() + source.slice(1),
        IPOs: data.data?.length || 0,
        Success: data.success ? "✅" : "❌",
        Time: formatTime(data.responseTimeMs),
      });
    } catch (error) {
      results.push({
        Source: source.charAt(0).toUpperCase() + source.slice(1),
        IPOs: "-",
        Success: "❌",
        Time: "-",
      });
    }
  }

  console.table(results);

  const totalIPOs = results.reduce(
    (sum, r) => sum + (typeof r.IPOs === "number" ? r.IPOs : 0),
    0
  );
  const avgIPOs = totalIPOs / results.filter((r) => r.Success === "✅").length;

  log("bright", `\n📊 Summary:`);
  console.table({
    "Total IPOs (all sources)": totalIPOs,
    "Average per source": Math.round(avgIPOs),
    "Sources online": results.filter((r) => r.Success === "✅").length,
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  try {
    switch (command) {
      case "test-all":
        await testAll();
        break;
      case "test":
        if (!args[1]) {
          log("yellow", "Usage: node test-scrapers.js test <source>");
          break;
        }
        await testOne(args[1]);
        break;
      case "ipos":
        await getIPOs(args.slice(1));
        break;
      case "subscriptions":
        await getSubscriptions(args.slice(1));
        break;
      case "gmp":
        await getGMP(args.slice(1));
        break;
      case "stats":
        await getStats();
        break;
      case "compare":
        await compare();
        break;
      default:
        log("cyan", "\n🧪 IPO Scraper Test CLI\n");
        log("bright", "Commands:");
        console.log(`
  test-all              Test all scrapers
  test <source>         Test specific scraper (nsetools, groww, chittorgarh, etc.)
  ipos                  Fetch aggregated IPOs
  subscriptions         Fetch aggregated subscriptions
  gmp                   Fetch GMP data
  stats                 Get scraper statistics
  compare               Compare data across sources
        `);
    }
  } catch (error) {
    log("red", `\n❌ Fatal Error: ${error.message}`);
    process.exit(1);
  }
}

main().then(() => {
  process.exit(0);
});
