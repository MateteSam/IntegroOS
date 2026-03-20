import { useState } from "react";
import { AppLayout } from "@/components/integro-mail/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Globe,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Zap,
  Loader,
} from "lucide-react";
import { useSearchLeads } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Leads = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDomain, setSearchDomain] = useState("");
  const { data: foundLeads = [], isLoading } = useSearchLeads(searchDomain);

  const handleSearch = () => {
    if (!searchQuery) return;
    setSearchDomain(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Lead Finder</h1>
            <p className="text-muted-foreground">
              Discover email addresses from company domains.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">250 credits remaining</span>
            </div>
          </div>
        </div>

        {/* Search Card */}
        <Card className="glass mb-6 gradient-border">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-foreground">
                Search by Domain
              </h3>
              <p className="text-sm text-muted-foreground">
                Enter a company domain to find associated email addresses.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g., company.com"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-muted/50 border-border h-12"
                    onKeyDown={handleKeyPress}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery}
                  className="h-12 px-8 bg-gradient-primary hover:opacity-90 text-white border-0"
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Find Emails
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {searchDomain && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Found Emails for {searchDomain}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : foundLeads.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No leads found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {foundLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground">
                            {lead.email}
                          </h4>
                          {lead.verified ? (
                            <Badge className="bg-success/20 text-success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge className="bg-warning/20 text-warning">
                              <XCircle className="h-3 w-3 mr-1" />
                              Unverified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-lg font-semibold text-foreground">
                            {Math.round(lead.confidence * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Confidence
                          </p>
                        </div>
                        <Button size="sm" className="gap-1">
                          <Plus className="h-3 w-3" />
                          Add to Contacts
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Leads;
