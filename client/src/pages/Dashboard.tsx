import { useState, useMemo } from "react";
import { useIpos } from "@/hooks/use-ipos";
import { IpoCardDark } from "@/components/IpoCardDark";
import { IpoTable } from "@/components/IpoTable";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Search, Loader2, LayoutGrid, Table } from "lucide-react";

type ViewMode = "cards" | "table";

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [search, setSearch] = useState("");
  const [showSme, setShowSme] = useState(true);

  const { data: ipos, isLoading } = useIpos();

  const filteredIpos = useMemo(() => {
    if (!ipos) return [];
    
    return ipos.filter(ipo => {
      const matchesSearch = 
        ipo.symbol.toLowerCase().includes(search.toLowerCase()) || 
        ipo.companyName.toLowerCase().includes(search.toLowerCase());
      
      if (!showSme) {
        const isSme = ipo.sector?.toLowerCase().includes("sme") || 
                      (ipo.issueSize && !ipo.issueSize.includes("Cr"));
        if (isSme) return false;
      }
      
      return matchesSearch;
    });
  }, [ipos, search, showSme]);

  const stats = useMemo(() => {
    if (!ipos) return { open: 0, upcoming: 0, pending: 0, listed: 0 };
    
    return {
      open: ipos.filter(i => i.status === "open").length,
      upcoming: ipos.filter(i => i.status === "upcoming").length,
      pending: ipos.filter(i => i.status === "pending").length,
      listed: ipos.filter(i => i.status === "closed" || i.status === "listed").length,
    };
  }, [ipos]);

  const openIpos = filteredIpos.filter(i => i.status === "open");
  const upcomingIpos = filteredIpos.filter(i => i.status === "upcoming");
  const listedIpos = filteredIpos.filter(i => i.status === "closed" || i.status === "listed");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          Track live IPO GMPs, subscription status, and investment opportunities for {ipos?.length || 0} IPOs. 
          Updated every 10 minutes with accurate grey market premium data.
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <div className="bg-zinc-900 rounded-xl px-8 py-4 text-center min-w-[140px]">
          <div className="text-2xl font-bold text-green-500">{stats.open}</div>
          <div className="text-zinc-400 text-sm">Open IPOs</div>
        </div>
        <div className="bg-zinc-900 rounded-xl px-8 py-4 text-center min-w-[140px]">
          <div className="text-2xl font-bold text-amber-500">{stats.upcoming}</div>
          <div className="text-zinc-400 text-sm">Upcoming</div>
        </div>
        <div className="bg-zinc-900 rounded-xl px-8 py-4 text-center min-w-[140px]">
          <div className="text-2xl font-bold text-blue-500">{stats.pending}</div>
          <div className="text-zinc-400 text-sm">Pending</div>
        </div>
        <div className="bg-zinc-900 rounded-xl px-8 py-4 text-center min-w-[140px]">
          <div className="text-2xl font-bold text-zinc-400">{stats.listed}</div>
          <div className="text-zinc-400 text-sm">Listed</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-1">
          <button
            onClick={() => setViewMode("cards")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "cards" 
                ? "bg-green-500 text-black" 
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Cards
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "table" 
                ? "bg-green-500 text-black" 
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Table className="w-4 h-4" />
            Table
          </button>
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search IPOs..." 
              className="pl-10 bg-zinc-900 border-green-500 text-white placeholder:text-zinc-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm whitespace-nowrap">
            <span className="text-zinc-400">Show SME IPOs:</span>
            <Switch 
              checked={showSme} 
              onCheckedChange={setShowSme}
              className="data-[state=checked]:bg-green-500"
            />
            <span className={showSme ? "text-green-500" : "text-zinc-500"}>
              {showSme ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      ) : viewMode === "table" ? (
        <IpoTable ipos={filteredIpos} />
      ) : (
        <div className="space-y-8">
          {openIpos.length > 0 && (
            <section>
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-6 py-3 mb-4">
                <h2 className="text-green-500 text-lg font-semibold">
                  Open for Bidding
                  <span className="ml-3 text-sm font-normal bg-green-500/20 px-2 py-0.5 rounded">
                    {openIpos.length} IPOs
                  </span>
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {openIpos.map((ipo) => (
                  <IpoCardDark key={ipo.id} ipo={ipo} />
                ))}
              </div>
            </section>
          )}

          {upcomingIpos.length > 0 && (
            <section>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-6 py-3 mb-4">
                <h2 className="text-blue-400 text-lg font-semibold">
                  Upcoming IPOs
                  <span className="ml-3 text-sm font-normal bg-blue-500/20 px-2 py-0.5 rounded">
                    {upcomingIpos.length} IPOs
                  </span>
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingIpos.map((ipo) => (
                  <IpoCardDark key={ipo.id} ipo={ipo} />
                ))}
              </div>
            </section>
          )}

          {listedIpos.length > 0 && (
            <section>
              <div className="bg-zinc-500/10 border border-zinc-500/20 rounded-xl px-6 py-3 mb-4">
                <h2 className="text-zinc-400 text-lg font-semibold">
                  Recently Listed
                  <span className="ml-3 text-sm font-normal bg-zinc-500/20 px-2 py-0.5 rounded">
                    {listedIpos.length} IPOs
                  </span>
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {listedIpos.map((ipo) => (
                  <IpoCardDark key={ipo.id} ipo={ipo} />
                ))}
              </div>
            </section>
          )}

          {filteredIpos.length === 0 && (
            <div className="text-center py-16 bg-zinc-900 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <Search className="w-5 h-5 text-zinc-500" />
              </div>
              <p className="text-white font-medium">No IPOs found</p>
              <p className="text-sm text-zinc-500 mt-1">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
