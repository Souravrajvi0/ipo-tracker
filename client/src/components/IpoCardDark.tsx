import { type Ipo } from "@shared/schema";
import { format } from "date-fns";
import { Link } from "wouter";

interface IpoCardDarkProps {
  ipo: Ipo;
}

function formatPrice(priceRange: string | null): string {
  if (!priceRange || priceRange === "TBA") return "TBA";
  const match = priceRange.match(/₹?\s*(\d+)/);
  return match ? `₹${match[1]}` : priceRange;
}

function getSubscriptionMultiplier(ipo: Ipo): string {
  const total = (ipo.subscriptionQib || 0) + (ipo.subscriptionHni || 0) + (ipo.subscriptionRetail || 0);
  if (total > 0) {
    return `${(total / 3).toFixed(2)}x`;
  }
  return "0.00x";
}

function calculateEstListing(ipo: Ipo): { price: string; percent: string; isPositive: boolean } {
  const priceMatch = ipo.priceRange?.match(/₹?\s*(\d+)/);
  const basePrice = priceMatch ? parseInt(priceMatch[1]) : 0;
  const gmp = ipo.gmp || 0;
  const estPrice = basePrice + gmp;
  const percent = basePrice > 0 ? ((gmp / basePrice) * 100).toFixed(2) : "0.00";
  
  return {
    price: basePrice > 0 ? `₹${estPrice}` : "TBA",
    percent: `${percent}%`,
    isPositive: gmp >= 0
  };
}

function formatBiddingDates(ipo: Ipo): string {
  if (!ipo.expectedDate) return "TBA";
  
  try {
    const openDate = new Date(ipo.expectedDate);
    const closeDate = new Date(openDate);
    closeDate.setDate(closeDate.getDate() + 3);
    
    return `${format(openDate, "d MMM")} - ${format(closeDate, "d MMM")}`;
  } catch {
    return "TBA";
  }
}

export function IpoCardDark({ ipo }: IpoCardDarkProps) {
  const estListing = calculateEstListing(ipo);
  const subscription = getSubscriptionMultiplier(ipo);
  const gmpValue = ipo.gmp || 0;
  const isSme = ipo.sector?.toLowerCase().includes("sme") || ipo.issueSize?.includes("Cr") === false;
  
  return (
    <Link href={`/ipos/${ipo.id}`}>
      <div className="bg-zinc-900 rounded-xl p-4 cursor-pointer hover:bg-zinc-800 transition-colors relative">
        {isSme && (
          <div className="absolute top-3 right-3 bg-zinc-700 text-zinc-300 text-xs px-2 py-0.5 rounded">
            SME
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm truncate pr-12">
              {ipo.companyName}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-400">{subscription}</span>
            <span className="text-green-500">●</span>
            <span className={`font-medium ${gmpValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ₹{gmpValue}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Price:</span>
            <span className="text-green-500 font-medium">{formatPrice(ipo.priceRange)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Issue Size:</span>
            <span className="text-zinc-300">{ipo.issueSize || "TBA"}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-zinc-500">Lot Size:</span>
            <span className="text-zinc-300">{ipo.lotSize || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Est. Listing:</span>
            <span className={estListing.isPositive ? 'text-green-500' : 'text-red-500'}>
              {estListing.price} ({estListing.percent})
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-zinc-500">GMP:</span>
            <span className={`${gmpValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ₹{gmpValue} ({estListing.percent})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Bidding:</span>
            <span className="text-green-500">{formatBiddingDates(ipo)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
