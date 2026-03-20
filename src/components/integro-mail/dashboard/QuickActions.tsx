import { useState } from "react";
import { Plus, Upload, Search, Sparkles, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CreateCampaignDialog } from "@/components/integro-mail/dialogs/CreateCampaignDialog";

const actions = [
  {
    title: "Send Faith Nexus Invites",
    description: "Quick start with VIP template",
    icon: Mail,
    action: "create-campaign",
    color: "bg-gradient-primary hover:opacity-90 text-white",
    featured: true,
  },
  {
    title: "Import Contacts",
    description: "Upload CSV or Excel file",
    icon: Upload,
    href: "/contacts",
    color: "bg-secondary hover:bg-secondary/90",
  },
  {
    title: "Find Leads",
    description: "Discover emails from domains",
    icon: Search,
    href: "/leads",
    color: "bg-accent hover:bg-accent/90",
  },
  {
    title: "Preview Template",
    description: "View Faith Nexus invitation",
    icon: Sparkles,
    href: "/templates",
    color: "bg-primary hover:bg-primary/90",
  },
];

export function QuickActions() {
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);

  const handleActionClick = (action: typeof actions[0]) => {
    if (action.action === "create-campaign") {
      setCampaignDialogOpen(true);
    }
  };

  return (
    <>
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            const content = (
              <Button
                className={`w-full h-auto py-4 flex flex-col items-center gap-2 ${action.color} ${action.featured ? 'ring-2 ring-primary/50' : ''} border-0`}
                onClick={action.action ? () => handleActionClick(action) : undefined}
              >
                <Icon className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-xs opacity-80">{action.description}</p>
                </div>
              </Button>
            );

            if (action.href) {
              return (
                <Link key={action.title} to={action.href}>
                  {content}
                </Link>
              );
            }

            return <div key={action.title}>{content}</div>;
          })}
        </div>
      </div>
      <CreateCampaignDialog
        open={campaignDialogOpen}
        onOpenChange={setCampaignDialogOpen}
        onSuccess={() => { }}
      />
    </>
  );
}
