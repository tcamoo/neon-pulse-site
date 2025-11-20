
export async function onRequest(context) {
  const { request, env } = context;

  // CORS Headers to allow local development or cross-origin if needed
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // KV Binding Check
  const KV = env.SITE_DATA_KV;
  if (!KV) {
    return new Response(JSON.stringify({ error: "Server Error: KV not bound. Please bind SITE_DATA_KV in Cloudflare Pages settings." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // GET: Retrieve data (PUBLIC READ ACCESS)
    // We allow anyone to read the site data so the website content updates for all visitors.
    if (request.method === "GET") {
      const data = await KV.get("ves_site_data");
      // If no data exists in KV, return null (frontend will use defaults)
      return new Response(data || "null", {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT: Save data (PROTECTED WRITE ACCESS)
    if (request.method === "PUT") {
        // Security: Check for a secret key header for WRITE operations
        const authKey = request.headers.get("x-auth-key");
        const expectedKey = env.SYNC_SECRET;

        if (!expectedKey || authKey !== expectedKey) {
            return new Response(JSON.stringify({ error: "Unauthorized: Invalid or missing Sync Secret Key" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const body = await request.text();
        await KV.put("ves_site_data", body);
        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
