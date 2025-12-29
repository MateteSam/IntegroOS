import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get today's leads
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: leads } = await supabaseClient
      .from('metrics')
      .select('value')
      .eq('user_id', user.id)
      .eq('metric_type', 'daily_leads')
      .gte('recorded_at', yesterday.toISOString());

    const todayLeads = leads?.reduce((sum, l) => sum + Number(l.value), 0) || 0;

    // Get weekly engagement
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const { data: engagement } = await supabaseClient
      .from('metrics')
      .select('value')
      .eq('user_id', user.id)
      .eq('metric_type', 'engagement_rate')
      .gte('recorded_at', lastWeek.toISOString());

    const weekEngagement = engagement?.length 
      ? engagement.reduce((sum, e) => sum + Number(e.value), 0) / engagement.length 
      : 0;

    // Get conversion rate
    const { data: conversions } = await supabaseClient
      .from('metrics')
      .select('value')
      .eq('user_id', user.id)
      .eq('metric_type', 'conversion_rate')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    const conversionRate = conversions?.value || 0;

    // Get active team members
    const { data: teamMetrics } = await supabaseClient
      .from('metrics')
      .select('value')
      .eq('user_id', user.id)
      .eq('metric_type', 'team_size')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    const activeTeam = teamMetrics?.value || 0;

    // Get total content
    const { data: content, count } = await supabaseClient
      .from('content')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    const metrics = {
      todayLeads,
      weekEngagement: Math.round(weekEngagement),
      conversionRate: Math.round(Number(conversionRate)),
      activeTeam: Math.round(Number(activeTeam)),
      totalContent: count || 0
    };

    return new Response(JSON.stringify({
      success: true,
      metrics
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching MLM metrics:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
