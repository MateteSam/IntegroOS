import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const campaigns = [
  {
    id: 1,
    name: "Summer Sale Newsletter",
    sent: 5432,
    openRate: 48.2,
    clickRate: 12.5,
    status: "active",
  },
  {
    id: 2,
    name: "Product Launch Announcement",
    sent: 8921,
    openRate: 52.1,
    clickRate: 18.3,
    status: "completed",
  },
  {
    id: 3,
    name: "Weekly Digest #42",
    sent: 3245,
    openRate: 35.8,
    clickRate: 8.2,
    status: "active",
  },
  {
    id: 4,
    name: "Welcome Email Sequence",
    sent: 1523,
    openRate: 65.4,
    clickRate: 22.1,
    status: "active",
  },
];

export function TopCampaigns() {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Top Performing Campaigns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-foreground truncate">{campaign.name}</h4>
                  <Badge
                    variant={campaign.status === "active" ? "default" : "secondary"}
                    className={
                      campaign.status === "active"
                        ? "bg-success/20 text-success hover:bg-success/30"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {campaign.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {campaign.sent.toLocaleString()} emails sent
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{campaign.openRate}%</p>
                  <p className="text-xs text-muted-foreground">Open Rate</p>
                  <Progress value={campaign.openRate} className="h-1 w-20 mt-1" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{campaign.clickRate}%</p>
                  <p className="text-xs text-muted-foreground">Click Rate</p>
                  <Progress value={campaign.clickRate * 3} className="h-1 w-20 mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
