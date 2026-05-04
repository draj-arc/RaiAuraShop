import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5500",
        "http://localhost:5173",
        "http://localhost:3000",
        "https://raiaura.in",
        "https://www.raiaura.in",
        "https://raiaurashop.netlify.app",
        "https://rai-aura-shop.vercel.app",
        "https://raiaurashop.pages.dev",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get("/api/ping", (req, res) => {
    res.json({ message: "pong", time: new Date().toISOString() });
});

// Register all API routes
let routesRegistered = false;

export async function initApp() {
    if (!routesRegistered) {
        await registerRoutes(app);
        routesRegistered = true;
    }
    return app;
}

export { app };
