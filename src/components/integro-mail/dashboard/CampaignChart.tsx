import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", sends: 4000, opens: 2400, clicks: 1200 },
  { name: "Feb", sends: 3000, opens: 1398, clicks: 800 },
  { name: "Mar", sends: 5000, opens: 3800, clicks: 1800 },
  { name: "Apr", sends: 2780, opens: 1908, clicks: 900 },
  { name: "May", sends: 6890, opens: 4800, clicks: 2300 },
  { name: "Jun", sends: 4390, opens: 3800, clicks: 1700 },
  { name: "Jul", sends: 7490, opens: 4300, clicks: 2100 },
];

export function CampaignChart() {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorSends" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(263, 70%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(263, 70%, 50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(280, 80%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(280, 80%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 20%)" />
              <XAxis dataKey="name" stroke="hsl(240, 5%, 65%)" fontSize={12} />
              <YAxis stroke="hsl(240, 5%, 65%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(240, 10%, 8%)",
                  border: "1px solid hsl(240, 6%, 20%)",
                  borderRadius: "8px",
                  color: "hsl(0, 0%, 95%)",
                }}
              />
              <Area
                type="monotone"
                dataKey="sends"
                stroke="hsl(217, 91%, 60%)"
                fillOpacity={1}
                fill="url(#colorSends)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="opens"
                stroke="hsl(263, 70%, 50%)"
                fillOpacity={1}
                fill="url(#colorOpens)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="hsl(280, 80%, 60%)"
                fillOpacity={1}
                fill="url(#colorClicks)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Sends</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-secondary" />
            <span className="text-sm text-muted-foreground">Opens</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-accent" />
            <span className="text-sm text-muted-foreground">Clicks</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
