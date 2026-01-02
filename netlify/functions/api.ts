import express from "express";
import serverless from "serverless-http";
import { registerRoutes } from "../../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
// Note: We don't need the server object here as much as the app
// but registerRoutes returns a Server. We just need the routes registered on 'app'.
await registerRoutes(app);

// For Netlify Functions, the path prefix is often '/.netlify/functions/api'
// but we handle it via redirects in netlify.toml
export const handler = serverless(app);
