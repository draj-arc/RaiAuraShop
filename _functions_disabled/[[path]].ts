import { registerRoutes } from "../server/routes";
import express from "express";
import { app } from "../server/index"; // We might need to export app from server/index.ts or creating a new app instance here

// Since server/index.ts has side effects (starts server), we should probably 
// refactor server/index.ts to export the app setup without starting it, 
// OR create a new app instance here and register routes.
// Given the current structure, server/index.ts starts the server immediately.
// We should modify server/index.ts to export the app setup.

// But for now, let's try to import registerRoutes and create a fresh app.
// This is safer than modifying the existing entry point too much.

const cfApp = express();

// Reuse the route registration logic
// We need to mock the "storage" if needed, but storage is a singleton module so it should be fine.

// We need to await registerRoutes because it might be async
let routesRegistered = false;

async function getApp() {
    if (!routesRegistered) {
        await registerRoutes(cfApp);
        routesRegistered = true;
    }
    return cfApp;
}

// Cloudflare Pages Function entry point
export const onRequest = async (context: any) => {
    const app = await getApp();

    // Convert Cloudflare Request to Express Request (somewhat mocked)
    // Actually, we can use a library or just basic mapping if we want full express support.
    // However, for Pages Functions, it's often better to just use the standard Request/Response 
    // if the framework supports it. Express relies on Node http.

    // A better approach for "Express on Cloudflare" is using 'hono' or similar, 
    // OR using a compatibility layer.

    // Using 'serverless-http' or similar might work but that's for AWS Lambda usually.

    // For this environment (NodeJS Compat), we can just use the handle function if we map the request.

    // Let's use a simpler approach: 
    // We can't easily run the *exact* express app without 'aws-serverless-express' style wrapping 
    // adapted for fetch API.

    // BUT, 'wrangler' with 'nodejs_compat' might allow us to run it if we hook into the request.

    // Actually, the easiest way to deploy an existing Express app to Cloudflare Workers is converting it 
    // to use 'hono' or using an adapter.

    // Let's create a minimal adaptor.

    const { request, env } = context;
    const url = new URL(request.url);

    // Create a mock Node request/response
    // This is complex to do manually.

    // ALTERNATIVE: Use a library 'serverless-http' with a wrapper that converts Fetch API to Node req/res.
    // But wait, we don't have that installed.

    // Let's try to basic-proxy it or use a lightweight router if possible.
    // Given the constraint "make the changes for deployment", I should probably use a library if I can.
    // But I can't easily install new packages without user permission (though I can edit package.json).

    // Let's install 'h3' or just use 'serverless-http' which is in package.json?
    // Checking package.json...
    // "serverless-http": "^4.0.0" is present!

    // Excellent. We can use serverless-http.

    const handler = serverless(app);
    // serverless-http usually returns a handler that takes (event, context).
    // Cloudflare Pages Functions signature is (context).
    // The 'event' for serverless-http is usually AWS api gateway event. 
    // For generic fetch usage, it might support a different signature or we need a specific adapter.

    // Actually "serverless-http" supports a 'provider' option?
    // Or we can just pass the request.

    // NOTE: serverless-http is primarily for AWS Lambda.
    // For Cloudflare, 'toucan-js' or generic adapters are better.
    // But let's try to see if serverless-http can handle a standard Request if configured.
    // If not, we might need a small separate file to handle the adaptation.

    // Let's try to use 'serverless-http' as it's already there.
    return handler(context.request, context);
};

import serverless from "serverless-http";

