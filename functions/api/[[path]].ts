// Hono API Handler for Cloudflare Pages Functions
// This provides all the API routes for the RaiAuraShop e-commerce site

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/cloudflare-pages';
import { storage } from '../../server/storage';
import { sendOTPEmail } from '../../server/email';
import {
    insertProductSchema,
    insertCategorySchema,
    insertCartItemSchema,
    insertOrderSchema,
    insertUserSchema,
    loginUserSchema
} from '../../shared/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Types
interface Env {
    SESSION_SECRET?: string;
    STRIPE_SECRET_KEY?: string;
    RESEND_API_KEY?: string;
}

interface Variables {
    user?: any;
}

// Create Hono app
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// CORS middleware
app.use('*', cors({
    origin: [
        'http://localhost:5500',
        'http://localhost:5173',
        'http://localhost:3000',
        'https://raiaura.in',
        'https://www.raiaura.in',
        'https://raiaurashop.netlify.app',
        'https://rai-aura-shop.vercel.app',
        'https://raiaurashop.pages.dev',
    ],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
}));

// Helper to get JWT secret
const getJwtSecret = (env: Env) => env.SESSION_SECRET || 'dev-secret-key-change-in-production';

// Auth middleware
const checkAdmin = async (c: any, next: any) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return c.json({ message: 'Not authenticated' }, 401);
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret(c.env)) as { id: string };
        const user = await storage.getUser(decoded.id);
        if (!user || !user.isAdmin) {
            return c.json({ message: 'Admin access required' }, 403);
        }
        c.set('user', user);
        await next();
    } catch (err) {
        return c.json({ message: 'Invalid token' }, 401);
    }
};

// ============= Health Check =============
app.get('/api/ping', (c) => {
    return c.json({ message: 'pong', time: new Date().toISOString(), status: 'ok' });
});

app.get('/api/health', (c) => {
    return c.json({ message: 'pong', time: new Date().toISOString(), status: 'ok' });
});

// ============= Seed Categories Endpoint (One-time use) =============
app.get('/api/seed-categories', async (c) => {
    try {
        // Get existing categories
        const existingCategories = await storage.getCategories();
        const existingSlugs = new Set(existingCategories.map(cat => cat.slug));

        // Seed Categories
        const seedCategories = [
            { name: "Earrings", slug: "earrings", description: "Elegant earrings for every occasion", displayOrder: 1, imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80" },
            { name: "Rings", slug: "rings", description: "Beautiful rings to adorn your fingers", displayOrder: 2, imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80" },
            { name: "Bracelets", slug: "bracelets", description: "Stunning bracelets for your wrists", displayOrder: 3, imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80" },
            { name: "Necklaces", slug: "necklaces", description: "Exquisite necklaces to complement any outfit", displayOrder: 4, imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80" },
            { name: "Hair Accessories", slug: "hair-accessories", description: "Delicate accessories for your hair", displayOrder: 5, imageUrl: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=800&q=80" },
        ];

        // Only add categories that don't already exist
        const newCategories = [];
        for (const cat of seedCategories) {
            if (!existingSlugs.has(cat.slug)) {
                const created = await storage.createCategory(cat);
                newCategories.push(created);
            }
        }

        // Get updated full list
        const allCategories = await storage.getCategories();

        return c.json({
            message: newCategories.length > 0 ? 'Categories added successfully!' : 'All categories already exist',
            added: newCategories.length,
            total: allCategories.length,
            categories: allCategories
        });
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

// ============= Products =============
app.get('/api/products', async (c) => {
    try {
        const products = await storage.getProducts();
        return c.json(products);
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

app.get('/api/products/featured', async (c) => {
    try {
        const products = await storage.getFeaturedProducts();
        return c.json(products);
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

app.get('/api/products/:slug', async (c) => {
    try {
        const product = await storage.getProductBySlug(c.req.param('slug'));
        if (!product) {
            return c.json({ message: 'Product not found' }, 404);
        }
        return c.json(product);
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

app.post('/api/products', checkAdmin, async (c) => {
    try {
        const body = await c.req.json();
        const data = insertProductSchema.parse(body);
        const product = await storage.createProduct(data);
        return c.json(product);
    } catch (error: any) {
        return c.json({ message: error.message }, 400);
    }
});

app.put('/api/products/:id', checkAdmin, async (c) => {
    try {
        const body = await c.req.json();
        const product = await storage.updateProduct(c.req.param('id'), body);
        if (!product) {
            return c.json({ message: 'Product not found' }, 404);
        }
        return c.json(product);
    } catch (error: any) {
        return c.json({ message: error.message }, 400);
    }
});

app.delete('/api/products/:id', checkAdmin, async (c) => {
    try {
        await storage.deleteProduct(c.req.param('id'));
        return c.json({ message: 'Product deleted' });
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

// ============= Categories =============
app.get('/api/categories', async (c) => {
    try {
        const categories = await storage.getCategories();
        return c.json(categories);
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

app.post('/api/categories', checkAdmin, async (c) => {
    try {
        const body = await c.req.json();
        const data = insertCategorySchema.parse(body);
        const category = await storage.createCategory(data);
        return c.json(category);
    } catch (error: any) {
        return c.json({ message: error.message }, 400);
    }
});

app.put('/api/categories/:id', checkAdmin, async (c) => {
    try {
        const body = await c.req.json();
        const category = await storage.updateCategory(c.req.param('id'), body);
        if (!category) {
            return c.json({ message: 'Category not found' }, 404);
        }
        return c.json(category);
    } catch (error: any) {
        return c.json({ message: error.message }, 400);
    }
});

app.delete('/api/categories/:id', checkAdmin, async (c) => {
    try {
        await storage.deleteCategory(c.req.param('id'));
        return c.json({ message: 'Category deleted' });
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

// ============= Cart =============
app.get('/api/cart', async (c) => {
    try {
        const userId = c.req.query('userId');
        const sessionId = c.req.query('sessionId');
        const items = await storage.getCartItems(userId, sessionId);
        return c.json(items);
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

app.post('/api/cart', async (c) => {
    try {
        const body = await c.req.json();
        const data = insertCartItemSchema.parse(body);
        const item = await storage.addToCart(data);
        return c.json(item);
    } catch (error: any) {
        return c.json({ message: error.message }, 400);
    }
});

app.put('/api/cart/:id', async (c) => {
    try {
        const body = await c.req.json();
        const { quantity } = body;
        const item = await storage.updateCartItem(c.req.param('id'), quantity);
        if (!item) {
            return c.json({ message: 'Cart item not found' }, 404);
        }
        return c.json(item);
    } catch (error: any) {
        return c.json({ message: error.message }, 400);
    }
});

app.delete('/api/cart/:id', async (c) => {
    try {
        await storage.removeFromCart(c.req.param('id'));
        return c.json({ message: 'Item removed from cart' });
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

app.delete('/api/cart', async (c) => {
    try {
        const userId = c.req.query('userId');
        const sessionId = c.req.query('sessionId');
        await storage.clearCart(userId, sessionId);
        return c.json({ message: 'Cart cleared' });
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

// ============= Orders =============
app.get('/api/orders', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        const token = authHeader?.split(' ')[1];
        const requestedUserId = c.req.query('userId');

        if (!token && !requestedUserId) {
            return c.json({ message: 'Not authenticated' }, 401);
        }

        let targetUserId: string | undefined;

        if (token) {
            try {
                const decoded = jwt.verify(token, getJwtSecret(c.env)) as { id: string };
                const requester = await storage.getUser(decoded.id);
                if (!requester) {
                    return c.json({ message: 'Invalid token' }, 401);
                }

                if (requester.isAdmin) {
                    targetUserId = requestedUserId !== 'all' ? requestedUserId : undefined;
                } else {
                    targetUserId = requester.id;
                }
            } catch (err) {
                return c.json({ message: 'Invalid token' }, 401);
            }
        } else {
            return c.json({ message: 'Not authenticated' }, 401);
        }

        const orders = await storage.getOrders(targetUserId);
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const items = await storage.getOrderItems(order.id);
            return { ...order, items };
        }));
        return c.json(ordersWithItems);
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

app.post('/api/orders', async (c) => {
    try {
        const body = await c.req.json();
        const { order, items } = body;

        const authHeader = c.req.header('Authorization');
        const token = authHeader?.split(' ')[1];
        let userIdFromToken: string | undefined;

        if (token) {
            try {
                const decoded = jwt.verify(token, getJwtSecret(c.env)) as { id: string };
                const user = await storage.getUser(decoded.id);
                if (user) userIdFromToken = user.id;
            } catch (err) {
                // Ignore invalid token for guest checkout
            }
        }

        // Validate stock
        for (const item of items) {
            const product = await storage.getProductById(item.productId);
            if (!product) {
                return c.json({ message: `Product not found: ${item.productName}` }, 400);
            }
            if (product.stock < item.quantity) {
                return c.json({
                    message: `Insufficient stock for ${item.productName}. Available: ${product.stock}, Requested: ${item.quantity}`
                }, 400);
            }
        }

        const orderWithUser: any = { ...order };
        if (userIdFromToken) {
            orderWithUser.userId = userIdFromToken;
        }

        const validatedOrder = insertOrderSchema.parse(orderWithUser);
        const newOrder = await storage.createOrder(validatedOrder, items);

        // Reduce stock
        for (const item of items) {
            const product = await storage.getProductById(item.productId);
            if (product) {
                await storage.updateProduct(item.productId, {
                    stock: product.stock - item.quantity
                });
            }
        }

        return c.json(newOrder);
    } catch (error: any) {
        return c.json({ message: error.message }, 400);
    }
});

app.put('/api/orders/:id/status', checkAdmin, async (c) => {
    try {
        const body = await c.req.json();
        const { status } = body;
        const order = await storage.updateOrderStatus(c.req.param('id'), status);
        if (!order) {
            return c.json({ message: 'Order not found' }, 404);
        }
        return c.json(order);
    } catch (error: any) {
        return c.json({ message: error.message }, 400);
    }
});

// ============= Auth =============
app.post('/api/register', async (c) => {
    try {
        const body = await c.req.json();
        const data = insertUserSchema.parse(body);

        const existingUser = await storage.getUserByEmail(data.email);
        if (existingUser) {
            return c.json({ message: 'Email already registered' }, 400);
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await storage.createUser({
            ...data,
            password: hashedPassword,
        });

        const token = jwt.sign({ id: user.id }, getJwtSecret(c.env), { expiresIn: '7d' });

        return c.json({
            user: { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin, role: user.isAdmin ? 'admin' : 'user' },
            token
        });
    } catch (error: any) {
        return c.json({ message: error.message }, 400);
    }
});

app.post('/api/login', async (c) => {
    try {
        const body = await c.req.json();
        const data = loginUserSchema.parse(body);

        const user = await storage.getUserByEmail(data.email);
        if (!user) {
            return c.json({ message: 'Invalid credentials' }, 401);
        }

        const validPassword = await bcrypt.compare(data.password, user.password);
        if (!validPassword) {
            return c.json({ message: 'Invalid credentials' }, 401);
        }

        const token = jwt.sign({ id: user.id }, getJwtSecret(c.env), { expiresIn: '7d' });

        return c.json({
            user: { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin, role: user.isAdmin ? 'admin' : 'user' },
            token
        });
    } catch (error: any) {
        return c.json({ message: error.message }, 400);
    }
});

app.get('/api/user', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return c.json({ message: 'Not authenticated' }, 401);
        }

        const decoded = jwt.verify(token, getJwtSecret(c.env)) as { id: string };
        const user = await storage.getUser(decoded.id);

        if (!user) {
            return c.json({ message: 'User not found' }, 404);
        }

        return c.json({ id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin });
    } catch (error: any) {
        return c.json({ message: 'Invalid token' }, 401);
    }
});

// ============= OTP Auth =============
app.post('/api/otp/request', async (c) => {
    try {
        const body = await c.req.json();
        const { email, isNewUser, username } = body;

        if (!email) {
            return c.json({ message: 'Email is required' }, 400);
        }

        const existingUser = await storage.getUserByEmail(email);

        if (isNewUser && existingUser) {
            return c.json({ message: 'Email already registered. Please sign in instead.' }, 400);
        }

        if (!isNewUser && !existingUser) {
            return c.json({ message: 'No account found with this email. Please sign up first.' }, 404);
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await storage.saveOTP({
            email,
            otp,
            expiresAt,
            isNewUser: !!isNewUser,
            username: username || null,
        });

        console.log(`📧 OTP for ${email}: ${otp}`);

        // Send Email using Cloudflare env secret
        const result = await sendOTPEmail(email, otp, c.env.RESEND_API_KEY);

        if (!result.success) {
            return c.json({ message: `Failed to send OTP email: ${result.error || 'Unknown error'}` }, 500);
        }

        return c.json({
            message: 'OTP sent to your email'
        });
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

app.post('/api/otp/verify', async (c) => {
    try {
        const body = await c.req.json();
        const { email, otp } = body;

        if (!email || !otp) {
            return c.json({ message: 'Email and OTP are required' }, 400);
        }

        const storedData = await storage.getOTP(email);

        if (!storedData) {
            return c.json({ message: 'OTP expired or not requested. Please request a new OTP.' }, 400);
        }

        if (new Date() > storedData.expiresAt) {
            await storage.deleteOTP(email);
            return c.json({ message: 'OTP has expired. Please request a new one.' }, 400);
        }

        if (storedData.otp !== otp) {
            return c.json({ message: 'Invalid OTP. Please try again.' }, 400);
        }

        await storage.deleteOTP(email);

        let user = await storage.getUserByEmail(email);

        if (!user && storedData.isNewUser) {
            const randomPassword = Math.random().toString(36).slice(-12);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await storage.createUser({
                username: storedData.username || email.split('@')[0],
                email,
                password: hashedPassword,
            });
        }

        if (!user) {
            return c.json({ message: 'User not found' }, 404);
        }

        // Auto-elevate admin email
        const ADMIN_EMAILS = ['raiaura.shop@gmail.com'];
        if (ADMIN_EMAILS.includes(email.toLowerCase()) && !user.isAdmin) {
            await storage.updateUser(user.id, { isAdmin: true });
            user = await storage.getUser(user.id);
        }

        const token = jwt.sign({ id: user!.id }, getJwtSecret(c.env), { expiresIn: '7d' });

        return c.json({
            user: { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin, role: user.isAdmin ? 'admin' : 'user' },
            token,
            message: storedData.isNewUser ? 'Account created successfully!' : 'Logged in successfully!'
        });
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

// ============= Google Auth =============
app.post('/api/auth/google', async (c) => {
    try {
        const body = await c.req.json();
        const { email, username, googleId } = body;

        if (!email || !googleId) {
            return c.json({ message: 'Email and Google UID are required' }, 400);
        }

        let user = await storage.getUserByFirebaseUid(googleId);

        if (!user) {
            user = await storage.getUserByEmail(email);
        }

        if (user && user.firebaseUid !== googleId) {
            await storage.updateUser(user.id, { firebaseUid: googleId });
            const updatedUser = await storage.getUser(user.id);
            if (updatedUser) user = updatedUser;
        }

        let isNewUserCreated = false;

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-12);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            user = await storage.createUser({
                username: username || email.split('@')[0],
                email,
                password: hashedPassword,
                firebaseUid: googleId,
            });
            isNewUserCreated = true;
        }

        const token = jwt.sign({ id: user.id }, getJwtSecret(c.env), { expiresIn: '7d' });
        return c.json({
            user: { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin, role: user.isAdmin ? 'admin' : 'user' },
            token,
            isNewUserCreated
        });
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

// ============= Firebase Email Auth =============
app.post('/api/auth/firebase-email', async (c) => {
    try {
        const body = await c.req.json();
        const { email, username, firebaseUid, isNewUser } = body;

        if (!email || !firebaseUid) {
            return c.json({ message: 'Email and Firebase UID are required' }, 400);
        }

        let user = await storage.getUserByFirebaseUid(firebaseUid);
        if (!user) {
            user = await storage.getUserByEmail(email);
        }

        if (user && user.firebaseUid !== firebaseUid) {
            await storage.updateUser(user.id, { firebaseUid });
            const updatedUser = await storage.getUser(user.id);
            if (updatedUser) user = updatedUser;
        }

        let isNewUserCreated = false;

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-12);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            user = await storage.createUser({
                username: username || email.split('@')[0],
                email,
                password: hashedPassword,
                firebaseUid,
            });
            isNewUserCreated = true;
        }

        // Auto-elevate admin email
        const ADMIN_EMAILS = ['raiaura.shop@gmail.com'];
        if (ADMIN_EMAILS.includes(email.toLowerCase()) && !user.isAdmin) {
            await storage.updateUser(user.id, { isAdmin: true });
            user = await storage.getUser(user.id);
        }

        const token = jwt.sign({ id: user!.id }, getJwtSecret(c.env), { expiresIn: '7d' });
        return c.json({
            user: { id: user!.id, username: user!.username, email: user!.email, isAdmin: user!.isAdmin, role: user!.isAdmin ? 'admin' : 'user' },
            token,
            isNewUserCreated
        });
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

// ============= Check Email =============
app.post('/api/auth/check-email', async (c) => {
    try {
        const body = await c.req.json();
        const { email } = body;

        if (!email) {
            return c.json({ message: 'Email is required' }, 400);
        }

        const existingUser = await storage.getUserByEmail(email);
        return c.json({ exists: !!existingUser });
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

// ============= Wishlist =============
app.get('/api/wishlist/:userId', async (c) => {
    try {
        const userId = c.req.param('userId');
        const wishlistItems = await storage.getWishlist(userId);

        const itemsWithProducts = await Promise.all(
            wishlistItems.map(async (item) => {
                const product = await storage.getProductById(item.productId);
                return { ...item, product };
            })
        );

        return c.json(itemsWithProducts);
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

app.post('/api/wishlist', async (c) => {
    try {
        const body = await c.req.json();
        const { userId, productId } = body;

        if (!userId || !productId) {
            return c.json({ message: 'User ID and Product ID are required' }, 400);
        }

        const wishlistItem = await storage.addToWishlist(userId, productId);
        return c.json(wishlistItem);
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

app.delete('/api/wishlist/:userId/:productId', async (c) => {
    try {
        const userId = c.req.param('userId');
        const productId = c.req.param('productId');
        await storage.removeFromWishlist(userId, productId);
        return c.json({ success: true });
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

app.get('/api/wishlist/:userId/check/:productId', async (c) => {
    try {
        const userId = c.req.param('userId');
        const productId = c.req.param('productId');
        const isInWishlist = await storage.isInWishlist(userId, productId);
        return c.json({ isInWishlist });
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

// Export handler for Cloudflare Pages Functions
export const onRequest = handle(app);
