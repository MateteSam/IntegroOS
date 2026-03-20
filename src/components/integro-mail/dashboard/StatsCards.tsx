import { Send, Users, MousePointer, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    title: "Emails Sent",
    value: "24,521",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: Send,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Total Contacts",
    value: "8,432",
    change: "+5.2%",
    changeType: "positive" as const,
    icon: Users,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    title: "Click Rate",
    value: "18.3%",
    change: "+2.1%",
    changeType: "positive" as const,
    icon: MousePointer,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "Open Rate",
    value: "42.7%",
    change: "-1.2%",
    changeType: "negative" as const,
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-success/10",
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="glass glass-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === "positive" ? "text-success" : "text-destructive"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
