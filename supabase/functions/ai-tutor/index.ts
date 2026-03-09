import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Verify User Session via Supabase Auth
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 2. Parse Request
        const { problemContext, messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: 'Invalid messages array' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 3. System Prompt for DSA Tutor
        const systemPrompt = `You are the AlgoForge AI Tutor, an elite competitive programming coach specializing in Python and C++. 
    
Current Problem Context:
${problemContext || "General competitive programming topics."}

Your teaching style:
1. NEVER just give the full code solution immediately. Start with hints, ask guiding questions, and use the Socratic method.
2. When the user asks for the solution, ALWAYS provide BOTH Python and C++ implementations (unless they specifically ask for one).
3. Always explain the Time (O) and Space (O) complexity for every approach discussed.
4. Reference the specific algorithmic pattern clearly (e.g., "This requires a 2-pointer approach where...").
5. Be concise and strictly professional—no fluffy greetings. Talk like a seasoned competitive programmer.
6. Format code clearly in markdown blocks with standard language tags (\`\`\`python, \`\`\`cpp).

Respond directly to the user's latest query while remembering their previous messages.`;

        // 4. OpenAI API Call
        const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openAiApiKey) {
            throw new Error("OPENAI_API_KEY is not set.");
        }

        const openaiMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map((m: any) => ({ role: m.role, content: m.content }))
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: openaiMessages,
                temperature: 0.2, // Low temp for more precise/technical answers
                stream: true, // Request SSE streaming
            }),
        });

        if (!response.ok) {
            const errObj = await response.json();
            throw new Error(`OpenAI API Error: ${errObj.error?.message || response.statusText}`);
        }

        // 5. Stream the response directly to the client
        return new Response(response.body, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/event-stream',
                'Connection': 'keep-alive',
                'Cache-Control': 'no-cache',
            },
        });

    } catch (error: any) {
        console.error('AI Tutor Error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal Server Error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
