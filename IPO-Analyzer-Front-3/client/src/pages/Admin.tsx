import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Database, Activity, BarChart3, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SyncResult {
  success: boolean;
  message?: string;
  created?: number;
  updated?: number;
  total?: number;
  markedAsListed?: number;
  error?: string;
}

interface Stats {
  total: number;
  upcoming: number;
  open: number;
  closed: number;
  listed?: number;
  withScores: number;
  avgScore: number;
}

interface TestResult {
  success: boolean;
  count: number;
  sample: Array<{
    symbol: string;
    companyName: string;
    status: string;
  }>;
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastSync, setLastSync] = useState<SyncResult | null>(null);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
  });

  const testMutation = useMutation<TestResult>({
    mutationFn: async () => {
      const res = await fetch("/api/admin/sync/test");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Test Successful",
          description: `Found ${data.count} IPOs from Chittorgarh`,
        });
      } else {
        toast({
          title: "Test Failed",
          description: "Could not connect to data source",
          variant: "destructive",
        });
      }
    },
  });

  const syncMutation = useMutation<SyncResult>({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/sync");
      return res.json();
    },
    onSuccess: (data) => {
      setLastSync(data);
      if (data.success) {
        toast({
          title: "Sync Complete",
          description: `${data.created} new, ${data.updated} updated IPOs`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/ipos"] });
        refetchStats();
      }
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const cleanSyncMutation = useMutation<SyncResult>({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/sync/clean");
      return res.json();
    },
    onSuccess: (data) => {
      setLastSync(data);
      if (data.success) {
        toast({
          title: "Clean Sync Complete",
          description: `Archived ${data.markedAsListed} old IPOs. ${data.created} new, ${data.updated} updated.`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/ipos"] });
        refetchStats();
      }
    },
    onError: (error) => {
      toast({
        title: "Clean Sync Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">
            Manage IPO data and trigger manual syncs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Total IPOs</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-ipos">
                {statsLoading ? "..." : stats?.total || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Open Now</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500" data-testid="text-open-ipos">
                {statsLoading ? "..." : stats?.open || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500" data-testid="text-upcoming-ipos">
                {statsLoading ? "..." : stats?.upcoming || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500" data-testid="text-avg-score">
                {statsLoading ? "..." : stats?.avgScore?.toFixed(1) || "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data Sync</CardTitle>
            <CardDescription>
              Fetch latest IPO data from Chittorgarh. This will update existing records
              and add new IPOs to the database.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => testMutation.mutate()}
                disabled={testMutation.isPending}
                data-testid="button-test-connection"
              >
                {testMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Activity className="mr-2 h-4 w-4" />
                )}
                Test Connection
              </Button>

              <Button
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
                data-testid="button-sync-data"
              >
                {syncMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Sync IPO Data
              </Button>

              <Button
                onClick={() => cleanSyncMutation.mutate()}
                disabled={cleanSyncMutation.isPending}
                variant="destructive"
                data-testid="button-clean-sync"
              >
                {cleanSyncMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Database className="mr-2 h-4 w-4" />
                )}
                Clean Sync (Reset Data)
              </Button>
            </div>

            {testMutation.data && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center gap-2">
                  {testMutation.data.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {testMutation.data.success
                      ? `Connection OK - Found ${testMutation.data.count} IPOs`
                      : "Connection failed"}
                  </span>
                </div>
                {testMutation.data.sample?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-1">Sample data:</p>
                    <div className="flex flex-wrap gap-2">
                      {testMutation.data.sample.map((ipo, i) => (
                        <Badge key={i} variant="secondary">
                          {ipo.companyName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {lastSync && (
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {lastSync.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {lastSync.success
                      ? `Sync Complete: ${lastSync.created} created, ${lastSync.updated} updated`
                      : lastSync.error || "Sync failed"}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
            <CardDescription>
              Current data providers used for IPO information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Chittorgarh IPO Dashboard</p>
                  <p className="text-sm text-muted-foreground">
                    Main source for IPO listings, dates, and basic info
                  </p>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Grey Market Premium (GMP)</p>
                  <p className="text-sm text-muted-foreground">
                    Live GMP data from Chittorgarh GMP page
                  </p>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
