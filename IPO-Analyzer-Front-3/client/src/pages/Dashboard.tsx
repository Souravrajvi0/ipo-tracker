import { useState } from "react";
import { useIpos } from "@/hooks/use-ipos";
import { IpoCard } from "@/components/IpoCard";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Loader2, TrendingUp, Clock, CheckCircle2, ArrowUpRight } from "lucide-react";

export default function Dashboard() {
  const [filter, setFilter] = useState<'upcoming' | 'open' | 'closed' | 'all'>('all');
  const [sector, setSector] = useState<string>('');
  const [search, setSearch] = useState('');

  const { data: ipos, isLoading } = useIpos(
    filter === 'all' ? undefined : { status: filter }
  );

  const filteredIpos = ipos?.filter(ipo => {
    const matchesSearch = 
      ipo.symbol.toLowerCase().includes(search.toLowerCase()) || 
      ipo.companyName.toLowerCase().includes(search.toLowerCase());
    const matchesSector = sector && sector !== 'all' ? ipo.sector === sector : true;
    return matchesSearch && matchesSector;
  });

  const uniqueSectors = Array.from(new Set(ipos?.map(i => i.sector).filter(Boolean)));

  const stats = [
    { 
      label: "Total IPOs", 
      value: ipos?.length || 0, 
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    { 
      label: "Open Now", 
      value: ipos?.filter(i => i.status === 'open').length || 0, 
      icon: ArrowUpRight,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    { 
      label: "Upcoming", 
      value: ipos?.filter(i => i.status === 'upcoming').length || 0, 
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      label: "Closed", 
      value: ipos?.filter(i => i.status === 'closed').length || 0, 
      icon: CheckCircle2,
      color: "text-muted-foreground",
      bgColor: "bg-muted"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Welcome back
        </h1>
        <p className="text-muted-foreground">
          Manage your IPO watchlist and monitor market opportunities.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-lg border border-border p-4"
            data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3 bg-card p-4 rounded-lg border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by symbol or company..." 
            className="pl-10 bg-background border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
          />
        </div>
        <div className="flex gap-3">
          <Select value={filter} onValueChange={(val: 'upcoming' | 'open' | 'closed' | 'all') => setFilter(val)}>
            <SelectTrigger 
              className="w-[140px] bg-background border-border"
              data-testid="select-status"
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger 
              className="w-[140px] bg-background border-border"
              data-testid="select-sector"
            >
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Sectors</SelectItem>
              {uniqueSectors.map(s => (
                <SelectItem key={s} value={s as string}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIpos?.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-muted/50 rounded-lg border border-dashed border-border">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium">No IPOs found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            filteredIpos?.map((ipo) => (
              <IpoCard key={ipo.id} ipo={ipo} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
