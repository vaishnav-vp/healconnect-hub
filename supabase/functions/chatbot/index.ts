import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a helpful medical information assistant for MediCare+. You provide general medical information about:
- Website usage and navigation
- Disease awareness and information
- Common symptoms and their general meanings
- Prevention tips and healthy lifestyle advice

IMPORTANT RULES:
1. You are NOT a doctor and cannot provide medical diagnoses
2. Always recommend consulting a healthcare professional for specific medical concerns
3. Never provide prescription drug recommendations
4. Be empathetic and supportive in your responses
5. Keep responses concise and easy to understand
6. If asked about emergencies, always recommend calling emergency services immediately

DISCLAIMER: Always remind users that you provide general information only and that they should consult healthcare professionals for medical advice.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, isAuthenticated } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    // Check if the message seems to require personalized assistance
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
    const personalizedKeywords = [
      "my report", "my records", "my prescription", "my appointment",
      "my doctor", "my patient", "my history", "my data", "my profile",
      "book appointment", "schedule", "save", "store", "remember me"
    ];
    
    const needsAuth = personalizedKeywords.some(keyword => lastMessage.includes(keyword));
    
    if (needsAuth && !isAuthenticated) {
      return new Response(
        JSON.stringify({
          requiresAuth: true,
          message: "Please log in to continue personalized assistance.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://medicare-plus.lovable.app",
        "X-Title": "MediCare+ Chatbot",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

    return new Response(
      JSON.stringify({ message: content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chatbot error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
