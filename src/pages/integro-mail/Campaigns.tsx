import { useState } from "react";
import { AppLayout } from "@/components/integro-mail/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, MoreHorizontal, Send, Clock, CheckCircle, Pause, Loader, Trash2, Edit2, Mail } from "lucide-react";
import { useCampaigns, useDeleteCampaign, useSendCampaign, Campaign } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { CreateCampaignDialog } from "@/components/integro-mail/dialogs/CreateCampaignDialog";
import { EditCampaignDialog } from "@/components/integro-mail/dialogs/EditCampaignDialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusConfig = {
  sending: { label: "Sending", icon: Send, color: "bg-primary/20 text-primary" },
  completed: { label: "Completed", icon: CheckCircle, color: "bg-success/20 text-success" },
  scheduled: { label: "Scheduled", icon: Clock, color: "bg-warning/20 text-warning" },
  draft: { label: "Draft", icon: MoreHorizontal, color: "bg-muted text-muted-foreground" },
  paused: { label: "Paused", icon: Pause, color: "bg-destructive/20 text-destructive" },
};

const Campaigns = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const { data: campaigns = [], isLoading, refetch } = useCampaigns(search);
  const { mutate: deleteCampaign } = useDeleteCampaign();
  const { mutate: sendCampaign, isPending: isSending } = useSendCampaign();
  const { toast } = useToast();

  const handleDelete = (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    deleteCampaign(campaignId, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Campaign deleted successfully",
        });
        refetch();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete campaign",
          variant: "destructive",
        });
      },
    });
  };

  const handleEditClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setEditDialogOpen(true);
  };

  const handleSendCampaign = (campaignId: string, campaignName: string) => {
    if (!confirm(`Are you sure you want to send "${campaignName}" now? This will send emails to all recipients.`)) return;

    sendCampaign(campaignId, {
      onSuccess: (result) => {
        toast({
          title: "Campaign Sent!",
          description: `Successfully sent ${result.sent} emails${result.failed > 0 ? `. ${result.failed} failed.` : ''}`,
        });
        refetch();
      },
      onError: (error) => {
        toast({
          title: "Sending Failed",
          description: error instanceof Error ? error.message : "Failed to connect to backend server.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Campaigns</h1>
            <p className="text-muted-foreground">Create, manage, and track your email campaigns.</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 text-white border-0" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* Filters */}
        <Card className="glass mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-muted/50 border-border"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns List */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">All Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No campaigns found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => {
                  const status = statusConfig[campaign.status as keyof typeof statusConfig];
                  const StatusIcon = status.icon;
                  const openRate = campaign.recipients > 0 ? ((campaign.opens / campaign.recipients) * 100).toFixed(1) : "0";
                  const clickRate = campaign.recipients > 0 ? ((campaign.clicks / campaign.recipients) * 100).toFixed(1) : "0";

                  return (
                    <div
                      key={campaign.id}
                      className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-foreground truncate">{campaign.name}</h4>
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created {campaign.createdAt}
                        </p>
                      </div>

                      {campaign.status !== "draft" && (
                        <div className="flex items-center gap-6 lg:gap-8">
                          <div className="text-center">
                            <p className="text-lg font-semibold text-foreground">
                              {campaign.recipients.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">Recipients</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-foreground">
                              {openRate}%
                            </p>
                            <p className="text-xs text-muted-foreground">Open Rate</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-foreground">
                              {clickRate}%
                            </p>
                            <p className="text-xs text-muted-foreground">Click Rate</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {campaign.status === 'draft' && (
                          <Button
                            className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-sm"
                            size="sm"
                            onClick={() => handleSendCampaign(campaign.id, campaign.name)}
                            disabled={isSending}
                          >
                            <Mail className="h-4 w-4" />
                            Send Now
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass">
                            <DropdownMenuItem onClick={() => handleEditClick(campaign)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {campaign.status === 'draft' && campaign.recipientEmails && campaign.recipientEmails.length > 0 && (
                              <DropdownMenuItem
                                onClick={() => handleSendCampaign(campaign.id, campaign.name)}
                                disabled={isSending}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Send Now
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem>View Analytics</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive cursor-pointer"
                              onClick={() => handleDelete(campaign.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
            }
          </CardContent>
        </Card>

        <CreateCampaignDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={() => refetch()}
        />
        {selectedCampaign && (
          <EditCampaignDialog
            campaign={selectedCampaign}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={() => {
              refetch();
              setSelectedCampaign(null);
            }}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Campaigns;
