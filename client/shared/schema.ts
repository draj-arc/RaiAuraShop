
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
	id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
	username: text("username").notNull().unique(),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	isAdmin: boolean("is_admin").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
	id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
	name: text("name").notNull().unique(),
	slug: text("slug").notNull().unique(),
	description: text("description"),
	imageUrl: text("image_url"),
	displayOrder: integer("display_order").default(0).notNull(),
});

export const products = pgTable("products", {
	id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	description: text("description").notNull(),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	categoryId: varchar("category_id").notNull().references(() => categories.id),
	images: jsonb("images").notNull().$type<string[]>(),
	stock: integer("stock").default(0).notNull(),
	material: text("material"),
	featured: boolean("featured").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
	id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
	userId: varchar("user_id").references(() => users.id),
	sessionId: text("session_id"),
	productId: varchar("product_id").notNull().references(() => products.id),
	quantity: integer("quantity").default(1).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
	id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
	userId: varchar("user_id").references(() => users.id),
	customerEmail: text("customer_email").notNull(),
	customerName: text("customer_name").notNull(),
	shippingAddress: jsonb("shipping_address").notNull().$type<{
		line1: string;
		line2?: string;
		city: string;
		state: string;
		postalCode: string;
		country: string;
	}>(),
	total: decimal("total", { precision: 10, scale: 2 }).notNull(),
	status: text("status").notNull().default("pending"),
	paymentIntentId: text("payment_intent_id"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
	id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
	orderId: varchar("order_id").notNull().references(() => orders.id),
	productId: varchar("product_id").notNull().references(() => products.id),
	productName: text("product_name").notNull(),
	productPrice: decimal("product_price", { precision: 10, scale: 2 }).notNull(),
	quantity: integer("quantity").notNull(),
});

export const wishlistItems = pgTable("wishlist_items", {
	id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
	userId: varchar("user_id").notNull().references(() => users.id),
	productId: varchar("product_id").notNull().references(() => products.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id],
	}),
	cartItems: many(cartItems),
	orderItems: many(orderItems),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
	products: many(products),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
	product: one(products, {
		fields: [cartItems.productId],
		references: [products.id],
	}),
	user: one(users, {
		fields: [cartItems.userId],
		references: [users.id],
	}),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
	user: one(users, {
		fields: [orders.userId],
		references: [users.id],
	}),
	items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id],
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id],
	}),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
	user: one(users, {
		fields: [wishlistItems.userId],
		references: [users.id],
	}),
	product: one(products, {
		fields: [wishlistItems.productId],
		references: [products.id],
	}),
}));

export const insertUserSchema = createInsertSchema(users).omit({
	id: true,
	createdAt: true,
}).extend({
	email: z.string().email(),
	password: z.string().min(6),
});

export const loginUserSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
	id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
	id: true,
	createdAt: true,
}).extend({
	price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
	stock: z.coerce.number().int().min(0),
	images: z.array(z.string()).min(1),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
	id: true,
	createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
	id: true,
	createdAt: true,
}).extend({
	total: z.string().regex(/^\d+(\.\d{1,2})?$/),
	shippingAddress: z.object({
		line1: z.string(),
		line2: z.string().optional(),
		city: z.string(),
		state: z.string(),
		postalCode: z.string(),
		country: z.string(),
	}),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;

export type WishlistItem = typeof wishlistItems.$inferSelect;
