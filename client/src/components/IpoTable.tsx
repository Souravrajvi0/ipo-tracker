import { type Ipo } from "@shared/schema";
import { format } from "date-fns";
import { Link } from "wouter";

interface IpoTableProps {
  ipos: Ipo[];
}

function formatPrice(priceRange: string | null): string {
  if (!priceRange || priceRange === "TBA") return "-";
  const match = priceRange.match(/₹?\s*(\d+)/);
  return match ? `₹${match[1]}` : priceRange;
}

function getSubscriptionMultiplier(ipo: Ipo): string {
  const total = (ipo.subscriptionQib || 0) + (ipo.subscriptionHni || 0) + (ipo.subscriptionRetail || 0);
  if (total > 0) {
    return `${(total / 3).toFixed(2)}x`;
  }
  return "-";
}

function calculateEstListing(ipo: Ipo): { price: string; percent: string; isPositive: boolean } {
  const priceMatch = ipo.priceRange?.match(/₹?\s*(\d+)/);
  const basePrice = priceMatch ? parseInt(priceMatch[1]) : 0;
  const gmp = ipo.gmp || 0;
  const estPrice = basePrice + gmp;
  const percent = basePrice > 0 ? ((gmp / basePrice) * 100).toFixed(2) : "0.00";
  
  return {
    price: basePrice > 0 ? `₹${estPrice}` : "-",
    percent: `${percent}%`,
    isPositive: gmp >= 0
  };
}

function formatBiddingDates(ipo: Ipo): { start: string; end: string } {
  if (!ipo.expectedDate) return { start: "-", end: "-" };
  
  try {
    const openDate = new Date(ipo.expectedDate);
    const closeDate = new Date(openDate);
    closeDate.setDate(closeDate.getDate() + 3);
    
    return {
      start: format(openDate, "d MMM"),
      end: format(closeDate, "d MMM")
    };
  } catch {
    return { start: "-", end: "-" };
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-green-500/20 text-green-400 border-green-500/30",
    upcoming: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    closed: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    listed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.closed}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'open' ? 'bg-green-400' : status === 'upcoming' ? 'bg-amber-400' : 'bg-zinc-400'}`}></span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function IpoTable({ ipos }: IpoTableProps) {
  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-zinc-400 text-left border-b border-zinc-800">
            <th className="px-4 py-3 font-medium">IPO DETAILS</th>
            <th className="px-4 py-3 font-medium">STATUS</th>
            <th className="px-4 py-3 font-medium">PRICE</th>
            <th className="px-4 py-3 font-medium">GMP</th>
            <th className="px-4 py-3 font-medium">EST. LISTING</th>
            <th className="px-4 py-3 font-medium">EXPECTED PROFIT</th>
            <th className="px-4 py-3 font-medium">LOT SIZE</th>
            <th className="px-4 py-3 font-medium">ISSUE SIZE</th>
            <th className="px-4 py-3 font-medium">SUBSCRIPTION</th>
            <th className="px-4 py-3 font-medium">BIDDING PERIOD</th>
          </tr>
        </thead>
        <tbody>
          {ipos.map((ipo) => {
            const estListing = calculateEstListing(ipo);
            const subscription = getSubscriptionMultiplier(ipo);
            const biddingDates = formatBiddingDates(ipo);
            const gmpValue = ipo.gmp || 0;
            const isSme = ipo.sector?.toLowerCase().includes("sme") || ipo.issueSize?.includes("Cr") === false;
            
            const priceMatch = ipo.priceRange?.match(/₹?\s*(\d+)/);
            const basePrice = priceMatch ? parseInt(priceMatch[1]) : 0;
            const lotSizeNum = typeof ipo.lotSize === 'number' ? ipo.lotSize : parseInt(String(ipo.lotSize)) || 1;
            const expectedProfit = gmpValue * lotSizeNum;
            
            return (
              <tr 
                key={ipo.id} 
                className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link href={`/ipos/${ipo.id}`}>
                    <div className="flex items-center gap-2 cursor-pointer hover:text-green-400 transition-colors">
                      <span className="text-white font-medium">{ipo.companyName}</span>
                      {isSme && (
                        <span className="bg-zinc-700 text-zinc-300 text-xs px-1.5 py-0.5 rounded">
                          SME
                        </span>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={ipo.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="text-zinc-300">{formatPrice(ipo.priceRange)}</div>
                  <div className="text-xs text-zinc-500">0.00%</div>
                </td>
                <td className="px-4 py-3">
                  <div className={gmpValue >= 0 ? 'text-zinc-300' : 'text-red-400'}>₹{gmpValue}</div>
                  <div className="text-xs text-zinc-500">{estListing.percent}</div>
                </td>
                <td className="px-4 py-3">
                  <div className={gmpValue >= 0 ? 'text-zinc-300' : 'text-red-400'}>{estListing.price}</div>
                  <div className={`text-xs ${estListing.isPositive ? 'text-zinc-500' : 'text-red-400'}`}>
                    ({estListing.percent})
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className={expectedProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                    ₹{expectedProfit.toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-500">Profit</div>
                </td>
                <td className="px-4 py-3 text-zinc-300">{lotSizeNum}</td>
                <td className="px-4 py-3 text-zinc-300">{ipo.issueSize || "-"}</td>
                <td className="px-4 py-3 text-zinc-300">{subscription}</td>
                <td className="px-4 py-3">
                  <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded text-center">
                    <div>{biddingDates.start}</div>
                    <div className="text-zinc-500">to</div>
                    <div>{biddingDates.end}</div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
