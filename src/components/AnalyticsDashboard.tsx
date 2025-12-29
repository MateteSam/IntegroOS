import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Zap, Image, Download } from "lucide-react";

export const AnalyticsDashboard = () => {
  // Mock analytics data
  const assetTypeData = [
    { name: "Logo", count: 45 },
    { name: "Social Posts", count: 78 },
    { name: "Posters", count: 23 },
    { name: "Banners", count: 34 },
  ];

  const generationTrends = [
    { day: "Mon", count: 12 },
    { day: "Tue", count: 19 },
    { day: "Wed", count: 15 },
    { day: "Thu", count: 25 },
    { day: "Fri", count: 22 },
    { day: "Sat", count: 8 },
    { day: "Sun", count: 10 },
  ];

  const stylePreferences = [
    { name: "Minimalist", value: 35, color: "hsl(var(--primary))" },
    { name: "Bold", value: 28, color: "hsl(var(--secondary))" },
    { name: "Vintage", value: 20, color: "hsl(var(--accent))" },
    { name: "Modern", value: 17, color: "hsl(var(--success))" },
  ];

  const stats = [
    {
      title: "Total Generations",
      value: "342",
      change: "+12%",
      icon: Image,
      trend: "up"
    },
    {
      title: "Downloads",
      value: "256",
      change: "+8%",
      icon: Download,
      trend: "up"
    },
    {
      title: "Avg. Quality Score",
      value: "4.7/5",
      change: "+0.3",
      icon: TrendingUp,
      trend: "up"
    },
    {
      title: "AI Credits Used",
      value: "1,245",
      change: "-5%",
      icon: Zap,
      trend: "down"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="glass hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground glow" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.trend === 'up' ? 'text-success' : 'text-warning'}`}>
                {stat.change} from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Asset Types Bar Chart */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Asset Types Generated</CardTitle>
            <CardDescription>Most popular asset types this month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assetTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Style Preferences Pie Chart */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Style Preferences</CardTitle>
            <CardDescription>Your most used design styles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stylePreferences}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stylePreferences.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))"
                  }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Generation Trends Line Chart */}
        <Card className="glass md:col-span-2">
          <CardHeader>
            <CardTitle>Generation Trends</CardTitle>
            <CardDescription>Daily asset generation over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={generationTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tips */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-sm"><strong>Top Performer:</strong> Your social media posts get downloaded 85% of the time!</p>
          </div>
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm"><strong>Trending Style:</strong> Minimalist designs are 40% more popular in your industry this month.</p>
          </div>
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-sm"><strong>Cost Optimization:</strong> Using batch generation saved you 120 credits this week.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
