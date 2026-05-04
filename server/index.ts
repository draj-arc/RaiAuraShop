import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { app } from "./app";

const startServer = async () => {
  // Routes are already registered in app.ts, but registerRoutes returns the server instance (http.Server).
  // We need that server instance for WebSocket or just listen?
  // registerRoutes creates http.createServer(app) and returns it.
  // We need to capture that server instance.
  // But app.ts called registerRoutes(app).
  // So app already has routes.
  // But we didn't capture the return value in app.ts.
  // Wait, registerRoutes creates a NEW httpServer instance: `const httpServer = createServer(app); return httpServer;`
  // It does NOT attach the http server to app, it wraps app.
  // If we want to use that specific http server instance, we need it.
  // Express `app.listen` creates a NEW http server.
  // `registerRoutes` returns a server instance that might have WebSocket attached (if any? routes.ts content?).
  // routes.ts doesn't seem to have WS setup in the snippet I saw.
  // But if it did, we'd need that instance.

  // Actually, registerRoutes returns `httpServer`.
  // If we run `app.listen` in `server/index.ts`, we are correct.
  // BUT `registerRoutes` does `createServer(app)`.
  // If we call `registerRoutes(app)` in `app.ts`, it works for attaching routes to `app`.
  // The returned `httpServer` is discarded.

  // In `server/index.ts`, we want to start the server.
  // We can call `registerRoutes` again? No, duplicate routes.

  // We should modify `app.ts` to NOT call registerRoutes? 
  // OR export the `registerRoutes` function from `routes` and call it here.

  // But `functions/api/[[path]].ts` needs the routes registered on the `app`.
  // So `app.ts` MUST register routes.

  // If `server/index.ts` needs the `httpServer` created by `registerRoutes` (e.g. for WS), then we have a problem if we discard it.
  // Let's check `routes.ts` again.
  // It imports `createServer`.
  // It does `const httpServer = createServer(app); return httpServer;`
  // It doesn't seem to attach WS upgrade handlers or anything.
  // `package.json` has `ws`.
  // If WS is used, it would be attached to httpServer.
  // The snippet I saw of `routes.ts` didn't show WS usage, but it was long.

  // Assuming `registerRoutes` just attaches Express routes:
  // We can ignore the returned server in `server/index.ts` and just use `app.listen`? 
  // No, `app.listen` creates a server.
  // If `registerRoutes` sets up something on the *server* instance it returns, we lose it.

  // Ideally: `app.ts` exports `app`.
  // `functions` calls `registerRoutes(app)`.
  // `server/index.ts` calls `registerRoutes(app)` and uses the returned server.
  // BUT `functions` must await it?

  // Let's change `app.ts` to NOT call registerRoutes.
  // `app.ts` --> exports bare `app` with middleware.

  // `functions/api/[[path]].ts`:
  // import { app } from ...
  // import { registerRoutes } from ...
  // registerRoutes(app);
  // export const onRequest = serverless(app);

  // `server/index.ts`:
  // import { app } from ...
  // ...
  // const server = await registerRoutes(app);
  // ...

  // This feels safer and cleaner.

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
};

// Check if this module is being run directly
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
// If running via tsx or node directly
const isMainModule = process.argv[1] === __filename || process.argv[1].endsWith('index.ts');

if (isMainModule) {
  startServer().catch(console.error);
}
