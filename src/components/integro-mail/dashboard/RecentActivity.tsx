import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, MousePointer, UserPlus, XCircle } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "open",
    message: "John Doe opened 'Summer Sale Newsletter'",
    time: "2 minutes ago",
    icon: Mail,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: 2,
    type: "click",
    message: "Sarah Smith clicked CTA in 'Product Launch'",
    time: "5 minutes ago",
    icon: MousePointer,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    id: 3,
    type: "subscribe",
    message: "New subscriber: mike@example.com",
    time: "12 minutes ago",
    icon: UserPlus,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    id: 4,
    type: "unsubscribe",
    message: "jane@company.com unsubscribed",
    time: "25 minutes ago",
    icon: XCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    id: 5,
    type: "open",
    message: "Alex Johnson opened 'Weekly Digest'",
    time: "32 minutes ago",
    icon: Mail,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: 6,
    type: "click",
    message: "Emma Wilson clicked link in 'Welcome Email'",
    time: "1 hour ago",
    icon: MousePointer,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
];

export function RecentActivity() {
  return (
    <Card className="glass h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px] px-6">
          <div className="space-y-4 pb-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${activity.bgColor} shrink-0`}>
                    <Icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
