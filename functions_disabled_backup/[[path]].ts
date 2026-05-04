import { app } from "../../server/app-lite";
// import { registerRoutes } from "../../server/routes";
import serverless from "serverless-http";

// Register routes
// registerRoutes(app);

export const onRequest = serverless(app);
