import { 
  Users, 
  Target, 
  Clock, 
  TrendingUp, 
  RefreshCw 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardStats, useGlobalSchedulerMutation } from "@/hooks/use-spat-api";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip as RechartsTooltip, Cell } from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const schedulerMutation = useGlobalSchedulerMutation();

  const handleRunScheduler = () => {
    schedulerMutation.mutate();
  };

  const statCards = [
    {
      title: "Total Alumni",
      value: stats?.totalAlumni ?? 0,
      icon: Users,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-900/50"
    },
    {
      title: "Teridentifikasi",
      value: stats?.tracked ?? 0,
      icon: Target,
      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-900/50"
    },
    {
      title: "Perlu Verifikasi",
      value: stats?.pendingVerification ?? 0,
      icon: Clock,
      color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-900/50"
    },
    {
      title: "Success Rate",
      value: `${stats?.successRate ?? 0}%`,
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-900/50"
    }
  ];

  const chartData = stats ? [
    { name: "Teridentifikasi", value: stats.tracked, color: "hsl(var(--primary))" },
    { name: "Pending", value: stats.pendingVerification, color: "#f59e0b" },
    { name: "Belum Ditemukan", value: stats.totalAlumni - stats.tracked - stats.pendingVerification, color: "#94a3b8" }
  ] : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Ringkasan statistik pelacakan alumni universitas.</p>
        </div>
        <Button 
          onClick={handleRunScheduler} 
          disabled={schedulerMutation.isPending}
          className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
          size="lg"
        >
          <RefreshCw className={`mr-2 h-5 w-5 ${schedulerMutation.isPending ? 'animate-spin' : ''}`} />
          {schedulerMutation.isPending ? "Sedang Memproses..." : "Jalankan Pelacakan Global"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : (
          statCards.map((stat, index) => (
            <Card key={index} className={`border ${stat.border} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-3xl font-display font-bold mt-2">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {!isLoading && stats && (
        <Card className="border-border/50 shadow-lg shadow-black/5 overflow-hidden rounded-2xl">
          <div className="p-6 border-b border-border/50 bg-secondary/20">
            <h3 className="text-lg font-bold">Distribusi Status Pelacakan</h3>
          </div>
          <CardContent className="p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 14}} />
                <RechartsTooltip 
                  cursor={{fill: 'hsl(var(--secondary))'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
