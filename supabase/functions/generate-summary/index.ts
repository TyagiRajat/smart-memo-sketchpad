
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// The Euron API key will be securely stored in Supabase Edge Function Secrets
// You'll need to add it using the Supabase CLI or Dashboard
// Using: supabase secrets set EURON_API_KEY=your_api_key_here

serve(async (req) => {
  try {
    // Get the API key from environment variables (securely stored in Supabase)
    const euronApiKey = Deno.env.get("EURON_API_KEY");
    
    if (!euronApiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get the request body
    const requestData = await req.json();
    const { text } = requestData;
    
    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid text provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call the Euron API with our securely stored API key
    const euronResponse = await fetch('https://api.euron.one/api/v1/euri/alpha/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${euronApiKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `Summarize this text in 3-5 sentences. Respond ONLY with the summary:\n\n${text}`
          }
        ],
        model: "gpt-4.1-mini",
        max_tokens: 550,
        temperature: 0.7
      })
    });

    const euronData = await euronResponse.json();
    
    // Process the response similar to the original client-side code
    if (euronData.choices && euronData.choices[0]?.message?.content) {
      return new Response(
        JSON.stringify({ summary: euronData.choices[0].message.content.trim() }),
        { headers: { "Content-Type": "application/json" } }
      );
    } else if (euronData.summary) {
      return new Response(
        JSON.stringify({ summary: euronData.summary.trim() }),
        { headers: { "Content-Type": "application/json" } }
      );
    } else if (euronData.content) {
      return new Response(
        JSON.stringify({ summary: euronData.content.trim() }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    
    // If we can't extract a summary, return an error
    return new Response(
      JSON.stringify({ error: "No summary received from Euron AI" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in generate-summary function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
