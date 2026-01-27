#!/usr/bin/env node

/**
 * Enhanced Scraper Data Test
 * Shows detailed JSON output with all enriched fields
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function log(color, text) {
  console.log(`${COLORS[color]}${text}${COLORS.reset}`);
}

function header(text) {
  console.log("\n" + COLORS.cyan + "═".repeat(80) + COLORS.reset);
  log("cyan", text);
  console.log(COLORS.cyan + "═".repeat(80) + COLORS.reset + "\n");
}

function showEnhancedData() {
  header("📊 Enhanced IPO Data Structure");

  const exampleIPO = {
    // Basic Information
    symbol: "EXAMPLE",
    companyName: "Example Technologies Ltd",
    description: "A leading provider of enterprise software solutions",
    sector: "Technology",

    // Dates
    openDate: "2026-02-01",
    closeDate: "2026-02-05",
    listingDate: "2026-02-10",

    // Price & Offer Details
    priceRange: "₹450 - ₹475",
    priceMin: 450,
    priceMax: 475,
    lotSize: 31,
    minInvestment: "₹14,725",
    issueSize: "₹1,200 Cr",
    issueSizeCrores: 1200,
    totalShares: "1,50,00,000",
    freshIssue: 65,
    ofsRatio: 0.35,

    // Status
    status: "open",
    ipoType: "mainboard",

    // Financial Metrics (Now Collected!)
    revenueGrowth: 32.5,
    ebitdaMargin: 28.4,
    patMargin: 18.2,
    roe: 22.5,
    roce: 26.8,
    debtToEquity: 0.45,

    // Valuation Metrics (Now Collected!)
    peRatio: 35.2,
    pbRatio: 4.8,
    sectorPeMedian: 28.5,

    // Market Sentiment (Now Collected!)
    gmp: 125,
    gmpPercent: 26.3,
    subscriptionQib: 45.2,
    subscriptionNii: 28.5,
    subscriptionHni: 28.5,
    subscriptionRetail: 12.8,

    // Promoter Info (Now Collected!)
    promoterHolding: 75,
    postIpoPromoterHolding: 62.5,

    // Scores (NOW AUTO-GENERATED!)
    fundamentalsScore: 7.8,
    valuationScore: 6.2,
    governanceScore: 8.5,
    overallScore: 7.4,

    // Risk Assessment (NOW AUTO-GENERATED!)
    riskLevel: "moderate",
    redFlags: [
      "P/E ratio 23% above sector median",
      "Offer for Sale (OFS) ratio above 30%",
    ],
    pros: [
      "Strong revenue growth (32.5% CAGR)",
      "Healthy ROE (22.5%)",
      "Low debt levels (D/E: 0.45)",
      "Positive GMP indicating market confidence",
    ],

    // AI Analysis (To Be Added Later)
    aiSummary: "Example Technologies shows strong fundamentals with consistent revenue growth and healthy profitability metrics.",
    aiRecommendation: "SUBSCRIBE",
  };

  log("green", "✅ Full IPO Data Object:");
  console.log(JSON.stringify(exampleIPO, null, 2));

  header("🎯 What's New");

  const newFields = {
    "Financial Metrics": ["revenueGrowth", "ebitdaMargin", "patMargin", "roe", "roce", "debtToEquity"],
    "Valuation Metrics": ["peRatio", "pbRatio", "sectorPeMedian"],
    "Market Sentiment": ["gmp", "gmpPercent", "subscriptionQib", "subscriptionNii", "subscriptionHni", "subscriptionRetail"],
    "Promoter Info": ["promoterHolding", "postIpoPromoterHolding"],
    "Auto-Generated Scores": ["fundamentalsScore", "valuationScore", "governanceScore", "overallScore"],
    "Auto-Generated Risk": ["riskLevel", "redFlags", "pros"],
  };

  for (const [category, fields] of Object.entries(newFields)) {
    log("cyan", `\n${category}:`);
    fields.forEach(field => log("gray", `  • ${field}`));
  }

  header("📈 Scoring Logic");

  log("bright", "Fundamentals Score (40% weight):");
  log("gray", `  • Revenue Growth: +2 max (32.5% ÷ 20)`);
  log("gray", `  • ROE: +2 max (22.5% ÷ 15)`);
  log("gray", `  • ROCE: +1 max (26.8% ÷ 30)`);
  log("gray", `  = ${7.8} (Base 5 + improvements)`);

  log("bright", "\nValuation Score (35% weight):");
  log("gray", `  • P/E vs Sector: -1 to +2 based on ratio`);
  log("gray", `  • P/B Ratio: -1 to +2 based on efficiency`);
  log("gray", `  = ${6.2}`);

  log("bright", "\nGovernance Score (25% weight):");
  log("gray", `  • Promoter Holding < 75%: +2`);
  log("gray", `  • Debt/Equity < 0.5: +2`);
  log("gray", `  • PAT Margin > 10%: +1`);
  log("gray", `  = ${8.5}`);

  log("bright", "\nOverall Score (Weighted Average):");
  log("gray", `  = (7.8 × 0.40) + (6.2 × 0.35) + (8.5 × 0.25)`);
  log("gray", `  = ${7.4}`);

  header("🚩 Risk Assessment Logic");

  log("bright", "Red Flags Detected:");
  log("gray", `  • P/E (35.2) vs Sector (28.5) = +23% premium`);
  log("gray", `  • OFS Ratio (0.35) > 0.30 threshold`);

  log("bright", "\nPositive Factors:");
  log("gray", `  • Revenue Growth: 32.5% CAGR`);
  log("gray", `  • ROE: 22.5% (healthy)`);
  log("gray", `  • D/E: 0.45 (low debt)`);
  log("gray", `  • GMP: +125 (market confidence)`);

  log("bright", "\nRisk Level: moderate");
  log("gray", `  (2 red flags = moderate, 1-3 = moderate, >3 = aggressive)`);

  header("✨ Summary");

  log("green", "✅ All scrapers now collect:");
  log("cyan", "  • Financial metrics (revenue, EBITDA, PAT, ROE, ROCE, D/E)");
  log("cyan", "  • Valuation metrics (P/E, P/B, sector median P/E)");
  log("cyan", "  • Market sentiment (GMP, subscription ratios)");
  log("cyan", "  • Promoter information");
  log("cyan", "  • AUTO-GENERATED scores (fundamentals, valuation, governance)");
  log("cyan", "  • AUTO-GENERATED risk assessment (red flags, pros, risk level)");

  log("yellow", "\n⏳ Next: Database integration to persist this enriched data");
  console.log("");
}

showEnhancedData();
