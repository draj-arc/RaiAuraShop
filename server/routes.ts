import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema, insertCartItemSchema, insertOrderSchema, insertUserSchema, loginUserSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Stripe from "stripe";

const JWT_SECRET = process.env.SESSION_SECRET || "dev-secret-key-change-in-production";

// In-memory OTP storage (use Redis in production)
const otpStore: Map<string, { otp: string; expiresAt: number; isNewUser?: boolean; username?: string }> = new Map();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-09-30.clover" })
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.updateCategory(req.params.id, req.body);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ message: "Category deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/cart", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const sessionId = req.query.sessionId as string | undefined;
      const items = await storage.getCartItems(userId, sessionId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const data = insertCartItemSchema.parse(req.body);
      const item = await storage.addToCart(data);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      const item = await storage.updateCartItem(req.params.id, quantity);
      if (!item) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.json({ message: "Item removed from cart" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const sessionId = req.query.sessionId as string | undefined;
      await storage.clearCart(userId, sessionId);
      res.json({ message: "Cart cleared" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { order, items } = req.body;
      
      // Validate stock for each item before creating order
      for (const item of items) {
        const product = await storage.getProductById(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product not found: ${item.productName}` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${item.productName}. Available: ${product.stock}, Requested: ${item.quantity}` 
          });
        }
      }

      const validatedOrder = insertOrderSchema.parse(order);
      const newOrder = await storage.createOrder(validatedOrder, items);
      
      // Reduce stock for each ordered item
      for (const item of items) {
        const product = await storage.getProductById(item.productId);
        if (product) {
          await storage.updateProduct(item.productId, {
            stock: product.stock - item.quantity
          });
        }
      }
      
      res.json(newOrder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      res.json({ 
        user: { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin, role: user.isAdmin ? 'admin' : 'user' },
        token 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const data = loginUserSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      res.json({ 
        user: { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin, role: user.isAdmin ? 'admin' : 'user' },
        token 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/user", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await storage.getUser(decoded.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin });
    } catch (error: any) {
      res.status(401).json({ message: "Invalid token" });
    }
  });

  // OTP Request endpoint
  app.post("/api/otp/request", async (req, res) => {
    try {
      const { email, isNewUser, username } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      
      // For signup, check if user already exists
      if (isNewUser && existingUser) {
        return res.status(400).json({ message: "Email already registered. Please sign in instead." });
      }

      // For login, check if user exists
      if (!isNewUser && !existingUser) {
        return res.status(404).json({ message: "No account found with this email. Please sign up first." });
      }

      const otp = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
      
      // Store OTP
      otpStore.set(email, { otp, expiresAt, isNewUser, username });
      
      // In production, send OTP via email service (SendGrid, Resend, etc.)
      // For now, we'll log it and return success
      console.log(`\n📧 OTP for ${email}: ${otp}\n`);
      
      res.json({ 
        message: "OTP sent successfully",
        // Remove this in production - only for demo purposes
        demo_otp: otp 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // OTP Verify endpoint
  app.post("/api/otp/verify", async (req, res) => {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
      }

      const storedData = otpStore.get(email);
      
      if (!storedData) {
        return res.status(400).json({ message: "OTP expired or not requested. Please request a new OTP." });
      }

      if (Date.now() > storedData.expiresAt) {
        otpStore.delete(email);
        return res.status(400).json({ message: "OTP has expired. Please request a new one." });
      }

      if (storedData.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP. Please try again." });
      }

      // OTP is valid, clear it
      otpStore.delete(email);

      let user = await storage.getUserByEmail(email);
      
      // If new user signup via OTP
      if (!user && storedData.isNewUser) {
        // Create user with a random password (they'll use OTP to login)
        const randomPassword = Math.random().toString(36).slice(-12);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        
        user = await storage.createUser({
          username: storedData.username || email.split('@')[0],
          email,
          password: hashedPassword,
        });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      res.json({ 
        user: { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin, role: user.isAdmin ? 'admin' : 'user' },
        token,
        message: storedData.isNewUser ? "Account created successfully!" : "Logged in successfully!"
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Google Auth endpoint
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { email, username, googleId, photoURL } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user from Google auth
        const randomPassword = Math.random().toString(36).slice(-12);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        
        user = await storage.createUser({
          username: username || email.split('@')[0],
          email,
          password: hashedPassword,
        });
        
        console.log(`✅ New Google user created: ${email}`);
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      res.json({ 
        user: { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin, role: user.isAdmin ? 'admin' : 'user' },
        token 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  if (stripe) {
    app.post("/api/create-payment-intent", async (req, res) => {
      try {
        const { amount } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: "usd",
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        res.status(500).json({ message: "Error creating payment intent: " + error.message });
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
