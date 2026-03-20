import { AppLayout } from "@/components/integro-mail/layout/AppLayout";
import { StatsCards } from "@/components/integro-mail/dashboard/StatsCards";
import { CampaignChart } from "@/components/integro-mail/dashboard/CampaignChart";
import { RecentActivity } from "@/components/integro-mail/dashboard/RecentActivity";
import { TopCampaigns } from "@/components/integro-mail/dashboard/TopCampaigns";
import { QuickActions } from "@/components/integro-mail/dashboard/QuickActions";

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your email campaigns.
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Quick Actions */}
        <QuickActions />

        {/* Charts and Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Campaign Performance Chart */}
          <div className="lg:col-span-2">
            <CampaignChart />
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>

        {/* Top Campaigns */}
        <div className="mt-6">
          <TopCampaigns />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
