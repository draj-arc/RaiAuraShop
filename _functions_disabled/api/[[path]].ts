// Simple API handler for Cloudflare Pages Functions
// This acts as a proxy to an external API or can be extended with native handlers

interface Env {
    API_URL?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === "/api/ping" || url.pathname === "/api/health") {
        return new Response(JSON.stringify({
            message: "pong",
            time: new Date().toISOString(),
            status: "ok"
        }), {
            headers: { "Content-Type": "application/json" },
        });
    }

    // For API routes, proxy to the backend API if configured
    const backendUrl = env.API_URL || "https://raiaura.in";

    // Rewrite the request to the backend
    const backendRequestUrl = new URL(url.pathname + url.search, backendUrl);

    try {
        const backendResponse = await fetch(backendRequestUrl.toString(), {
            method: request.method,
            headers: request.headers,
            body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
        });

        // Clone the response with CORS headers
        const responseHeaders = new Headers(backendResponse.headers);
        responseHeaders.set("Access-Control-Allow-Origin", "*");
        responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        return new Response(backendResponse.body, {
            status: backendResponse.status,
            statusText: backendResponse.statusText,
            headers: responseHeaders,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({
            error: "Backend unavailable",
            message: error.message
        }), {
            status: 502,
            headers: { "Content-Type": "application/json" },
        });
    }
};
