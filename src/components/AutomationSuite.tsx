import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Zap, Users, Calendar, Mail, DollarSign, BarChart3, Settings, Play, Pause, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useAgenticOrchestrator } from '@/hooks/useAgenticOrchestrator';

const AutomationSuite = () => {
  const { activeTasks, runTask } = useAgenticOrchestrator();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [automations, setAutomations] = useState({
    leadGeneration: { active: true, leads: 1247 },
    emailMarketing: { active: true, sent: 3456 },
    socialScheduling: { active: false, posts: 89 },
    invoicing: { active: true, invoices: 234 },
    crm: { active: true, contacts: 2891 },
    analytics: { active: true, reports: 45 }
  });

  const automationModules = [
    {
      id: 'leads',
      title: 'Lead Generation',
      description: 'Automated lead capture and qualification system',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      metrics: { primary: '1,247', secondary: 'Leads Generated', trend: '+23%' },
      features: ['Contact Forms', 'Lead Scoring', 'Auto-Qualification', 'CRM Integration']
    },
    {
      id: 'email',
      title: 'Email Marketing',
      description: 'Automated email sequences and campaigns',
      icon: Mail,
      color: 'from-green-500 to-emerald-500',
      metrics: { primary: '3,456', secondary: 'Emails Sent', trend: '+18%' },
      features: ['Drip Campaigns', 'Personalization', 'A/B Testing', 'Analytics']
    },
    {
      id: 'social',
      title: 'Social Media',
      description: 'Automated social media posting and engagement',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      metrics: { primary: '89', secondary: 'Posts Scheduled', trend: '+45%' },
      features: ['Content Scheduling', 'Auto-Posting', 'Engagement Tracking', 'Hashtag Optimization']
    },
    {
      id: 'invoicing',
      title: 'Invoicing & Billing',
      description: 'Automated invoice generation and payment tracking',
      icon: DollarSign,
      color: 'from-orange-500 to-red-500',
      metrics: { primary: '$234K', secondary: 'Invoiced', trend: '+31%' },
      features: ['Auto-Invoicing', 'Payment Reminders', 'Recurring Billing', 'Tax Calculations']
    },
    {
      id: 'crm',
      title: 'CRM Automation',
      description: 'Customer relationship management automation',
      icon: BarChart3,
      color: 'from-indigo-500 to-purple-500',
      metrics: { primary: '2,891', secondary: 'Contacts Managed', trend: '+12%' },
      features: ['Contact Management', 'Sales Pipeline', 'Follow-up Reminders', 'Deal Tracking']
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      description: 'Automated reporting and business intelligence',
      icon: BarChart3,
      color: 'from-teal-500 to-cyan-500',
      metrics: { primary: '45', secondary: 'Reports Generated', trend: '+67%' },
      features: ['Auto-Reports', 'KPI Tracking', 'Custom Dashboards', 'Data Insights']
    }
  ];

  const workflowTemplates = [
    {
      name: 'New Lead Nurturing',
      trigger: 'Form Submission',
      actions: ['Send Welcome Email', 'Add to CRM', 'Schedule Follow-up', 'Assign to Sales Rep'],
      active: true
    },
    {
      name: 'Invoice Follow-up',
      trigger: 'Overdue Invoice',
      actions: ['Send Reminder Email', 'Schedule Call', 'Update Status', 'Notify Manager'],
      active: true
    },
    {
      name: 'Social Media Engagement',
      trigger: 'New Mention',
      actions: ['Auto-Reply', 'Tag Team Member', 'Track Sentiment', 'Add to CRM'],
      active: false
    },
    {
      name: 'Customer Onboarding',
      trigger: 'New Customer',
      actions: ['Send Welcome Package', 'Schedule Training', 'Create Account', 'Assign Success Manager'],
      active: true
    }
  ];

  const toggleAutomation = async (module: string) => {
    const isCurrentlyActive = automations[module as keyof typeof automations].active;

    setAutomations(prev => ({
      ...prev,
      [module]: { ...prev[prev.hasOwnProperty(module) ? (module as keyof typeof prev) : 'leadGeneration' as keyof typeof prev], active: !isCurrentlyActive }
    }));

    if (!isCurrentlyActive) {
      // Trigger an agentic task when enabling
      await runTask(`Activate ${module.toUpperCase()} Agent`, {
        module,
        action: 'initialize',
        timestamp: new Date().toISOString()
      });
    }

    toast({
      title: `Automation ${isCurrentlyActive ? 'Disabled' : 'Enabled'}`,
      description: `${module.charAt(0).toUpperCase() + module.slice(1)} automation has been ${isCurrentlyActive ? 'disabled' : 'enabled'}.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 rounded-full">
          <Zap className="h-5 w-5 text-violet-600" />
          <span className="text-violet-800 font-medium">NEXUS AUTOMATION SUITE</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Business Process Automation
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Automate your sales leads, invoicing, CRM, social media scheduling, and more with intelligent workflows.
        </p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Status Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">6</p>
                    <p className="text-sm text-muted-foreground">Active Automations</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">12,458</p>
                    <p className="text-sm text-muted-foreground">Tasks Automated</p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">847h</p>
                    <p className="text-sm text-muted-foreground">Time Saved</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Automations Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {automationModules.map(module => (
              <Card key={module.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${module.color} flex items-center justify-center`}>
                      <module.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant={automations[Object.keys(automations)[automationModules.indexOf(module)]]?.active ? 'default' : 'secondary'}>
                      {automations[Object.keys(automations)[automationModules.indexOf(module)]]?.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <h3 className="font-semibold mb-2">{module.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{module.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{module.metrics.primary}</span>
                      <span className="text-sm text-green-600">{module.metrics.trend}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{module.metrics.secondary}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Live Agentic Tasks (Project BEAST) */}
          {Object.values(activeTasks).length > 0 && (
            <Card className="border-primary/20 bg-primary/5 glass mb-6">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest font-bold flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  Active Neural Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.values(activeTasks).map(task => (
                  <div key={task.id} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-foreground">{task.name}</span>
                      <span className="text-muted-foreground">{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-1" />
                    <p className="text-[10px] text-muted-foreground italic">{task.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="bg-card/50 glass border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Automation Operations Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Lead captured from website contact form', time: '2 minutes ago', type: 'success' },
                  { action: 'Invoice #INV-2024-001 sent automatically', time: '15 minutes ago', type: 'info' },
                  { action: 'Follow-up email sent to 47 prospects', time: '1 hour ago', type: 'success' },
                  { action: 'Social media post scheduled for tomorrow', time: '2 hours ago', type: 'info' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-border/30 rounded-lg bg-background/30">
                    <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-success' : 'bg-blue-500'} glow`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          {/* Modules Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {automationModules.map(module => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${module.color} flex items-center justify-center`}>
                        <module.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={automations[Object.keys(automations)[automationModules.indexOf(module)]]?.active}
                      onCheckedChange={() => toggleAutomation(Object.keys(automations)[automationModules.indexOf(module)])}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold">{module.metrics.primary}</p>
                        <p className="text-sm text-muted-foreground">{module.metrics.secondary}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">{module.metrics.trend}</p>
                        <p className="text-sm text-muted-foreground">This month</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {module.features.map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure Module
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Automation Workflows</h2>
              <p className="text-muted-foreground">Manage your automated business processes</p>
            </div>
            <Button>
              <Zap className="mr-2 h-4 w-4" />
              Create New Workflow
            </Button>
          </div>

          {/* Workflow Templates */}
          <div className="space-y-4">
            {workflowTemplates.map((workflow, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{workflow.name}</h3>
                        <Badge variant={workflow.active ? 'default' : 'secondary'}>
                          {workflow.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <span>Trigger:</span>
                        <Badge variant="outline">{workflow.trigger}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        {workflow.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      {workflow.actions.map((action, actionIndex) => (
                        <Badge key={actionIndex} variant="secondary">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Workflow Builder */}
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Workflow</CardTitle>
              <CardDescription>Build your own automation workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workflowName">Workflow Name</Label>
                <Input id="workflowName" placeholder="Enter workflow name" />
              </div>

              <div>
                <Label htmlFor="trigger">Trigger Event</Label>
                <select className="w-full p-2 border rounded-md">
                  <option>Form Submission</option>
                  <option>New Customer</option>
                  <option>Payment Received</option>
                  <option>Email Opened</option>
                  <option>Social Media Mention</option>
                </select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this workflow should do..."
                  rows={3}
                />
              </div>

              <Button className="w-full">
                <Zap className="mr-2 h-4 w-4" />
                Create Workflow
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>Configure your automation preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive notifications when automations run</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-retry Failed Actions</h4>
                    <p className="text-sm text-muted-foreground">Automatically retry failed automation steps</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekend Processing</h4>
                    <p className="text-sm text-muted-foreground">Allow automations to run on weekends</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Advanced Analytics</h4>
                    <p className="text-sm text-muted-foreground">Enable detailed automation analytics</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Integration Settings</h3>

                <div>
                  <Label htmlFor="crmApi">CRM API Key</Label>
                  <Input id="crmApi" type="password" placeholder="Enter your CRM API key" />
                </div>

                <div>
                  <Label htmlFor="emailProvider">Email Service Provider</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Mailchimp</option>
                    <option>Constant Contact</option>
                    <option>SendGrid</option>
                    <option>Mailgun</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="socialMedia">Social Media Accounts</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked />
                      <span>Facebook Business</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked />
                      <span>Instagram Business</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" />
                      <span>LinkedIn Company</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" />
                      <span>Twitter Business</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationSuite;