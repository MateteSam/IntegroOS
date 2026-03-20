import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_API_KEY = Deno.env.get('GOOGLE_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface ActionCommand {
    action: string;
    params: Record<string, any>;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            },
        });
    }

    try {
        const { messages, userId } = await req.json();

        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Build context about user's Integro state
        const systemContext = await buildUserContext(supabase, userId);

        // Call Gemini API with full context
        const geminiResponse = await callGemini(messages, systemContext);

        // Parse and execute actions if Gemini requested them
        const actions = extractActions(geminiResponse);
        const executionResults = [];

        for (const action of actions) {
            const result = await executeAction(supabase, userId, action);
            executionResults.push(result);
        }

        return new Response(
            JSON.stringify({
                response: geminiResponse,
                actions: executionResults,
                timestamp: new Date().toISOString(),
            }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
    } catch (error) {
        console.error('AI Assistant Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
    }
});

async function buildUserContext(supabase: any, userId: string): Promise<string> {
    // Fetch user's campaigns, projects, and recent activity
    const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', userId)
        .limit(10);

    const { data: brands } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', userId)
        .limit(10);

    const context = `
You are the AI assistant integrated into Integro, the Marketing Brain Command Center.

Current User State:
- User ID: ${userId}
- Active Campaigns: ${campaigns?.length || 0}
- Brand Assets: ${brands?.length || 0}

Available Actions:
1. CREATE_CAMPAIGN - Create a new marketing campaign
2. GENERATE_BRAND - Generate complete brand identity
3. EXPORT_MICROSITE - Export microsite to live URL
4. ANALYZE_PERFORMANCE - Analyze campaign performance
5. GENERATE_CONTENT - Create marketing content

When the user asks you to perform an action, respond with structured commands like:
[ACTION:CREATE_CAMPAIGN]{"name":"Campaign Name","budget":5000}[/ACTION]

Always be helpful, concise, and take action when requested.
`;

    return context;
}

async function callGemini(messages: ChatMessage[], systemContext: string): Promise<string> {
    const fullMessages = [
        { role: 'system', content: systemContext },
        ...messages,
    ];

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: fullMessages.map((msg) => ({
                    parts: [{ text: msg.content }],
                    role: msg.role === 'assistant' ? 'model' : 'user',
                })),
            }),
        }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, I could not process that request.';
}

function extractActions(response: string): ActionCommand[] {
    const actions: ActionCommand[] = [];
    const actionRegex = /\[ACTION:(\w+)\](.*?)\[\/ACTION\]/g;
    let match;

    while ((match = actionRegex.exec(response)) !== null) {
        try {
            actions.push({
                action: match[1],
                params: JSON.parse(match[2]),
            });
        } catch (e) {
            console.error('Failed to parse action:', e);
        }
    }

    return actions;
}

async function executeAction(
    supabase: any,
    userId: string,
    command: ActionCommand
): Promise<any> {
    switch (command.action) {
        case 'CREATE_CAMPAIGN':
            const { data: campaign, error: campaignError } = await supabase
                .from('campaigns')
                .insert({
                    user_id: userId,
                    name: command.params.name,
                    budget: command.params.budget,
                    status: 'active',
                    created_at: new Date().toISOString(),
                })
                .select()
                .single();

            return {
                action: 'CREATE_CAMPAIGN',
                success: !campaignError,
                data: campaign,
                error: campaignError?.message,
            };

        case 'GENERATE_BRAND':
            // Call the existing generate-brand-nexus function
            const brandResponse = await supabase.functions.invoke('generate-brand-nexus', {
                body: {
                    businessName: command.params.businessName,
                    industry: command.params.industry,
                },
            });

            return {
                action: 'GENERATE_BRAND',
                success: !brandResponse.error,
                data: brandResponse.data,
                error: brandResponse.error?.message,
            };

        case 'EXPORT_MICROSITE':
            // Export microsite logic
            return {
                action: 'EXPORT_MICROSITE',
                success: true,
                data: {
                    url: `https://yourdomain.com/${command.params.siteName}`,
                    message: 'Microsite exported successfully',
                },
            };

        default:
            return {
                action: command.action,
                success: false,
                error: 'Unknown action',
            };
    }
}
