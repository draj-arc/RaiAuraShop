import {
  users,
  products,
  categories,
  cartItems,
  orders,
  orderItems,
  wishlistItems,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type WishlistItem,
} from "@shared/schema";
import bcrypt from "bcryptjs";

// Using in-memory storage (no Firebase required)
// Data will be lost on server restart - use Firebase/PostgreSQL for production

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;

  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<void>;

  getCartItems(userId?: string, sessionId?: string): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId?: string, sessionId?: string): Promise<void>;

  getOrders(userId?: string): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder, items: { productId: string; productName: string; productPrice: string; quantity: number }[]): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Wishlist methods
  getWishlist(userId: string): Promise<WishlistItem[]>;
  addToWishlist(userId: string, productId: string): Promise<WishlistItem>;
  removeFromWishlist(userId: string, productId: string): Promise<void>;
  isInWishlist(userId: string, productId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const docRef = await addDoc(collection(db, "users"), insertUser);
    return { id: docRef.id, ...insertUser } as User;
  }

  async getProducts(): Promise<Product[]> {
    const querySnapshot = await getDocs(collection(db, "products"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const q = query(collection(db, "products"), where("featured", "==", true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return undefined;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const q = query(collection(db, "products"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Product;
    }
    return undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const docRef = await addDoc(collection(db, "products"), product);
    return { id: docRef.id, ...product } as Product;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const docRef = doc(db, "products", id);
    await updateDoc(docRef, product);
    const updatedDoc = await getDoc(docRef);
    if (updatedDoc.exists()) {
      return { id: updatedDoc.id, ...updatedDoc.data() } as Product;
    }
    return undefined;
  }

  async deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc(db, "products", id));
  }

  async getCategories(): Promise<Category[]> {
    const querySnapshot = await getDocs(collection(db, "categories"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const docRef = doc(db, "categories", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Category;
    }
    return undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const q = query(collection(db, "categories"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Category;
    }
    return undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const docRef = await addDoc(collection(db, "categories"), category);
    return { id: docRef.id, ...category } as Category;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const docRef = doc(db, "categories", id);
    await updateDoc(docRef, category);
    const updatedDoc = await getDoc(docRef);
    if (updatedDoc.exists()) {
      return { id: updatedDoc.id, ...updatedDoc.data() } as Category;
    }
    return undefined;
  }

  async deleteCategory(id: string): Promise<void> {
    await deleteDoc(doc(db, "categories", id));
  }

  async getCartItems(userId?: string, sessionId?: string): Promise<CartItem[]> {
    let q;
    if (userId) {
      q = query(collection(db, "cartItems"), where("userId", "==", userId));
    } else if (sessionId) {
      q = query(collection(db, "cartItems"), where("sessionId", "==", sessionId));
    } else {
      return [];
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const docRef = await addDoc(collection(db, "cartItems"), item);
    return { id: docRef.id, ...item } as CartItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const docRef = doc(db, "cartItems", id);
    await updateDoc(docRef, { quantity });
    const updatedDoc = await getDoc(docRef);
    if (updatedDoc.exists()) {
      return { id: updatedDoc.id, ...updatedDoc.data() } as CartItem;
    }
    return undefined;
  }

  async removeFromCart(id: string): Promise<void> {
    await deleteDoc(doc(db, "cartItems", id));
  }

  async clearCart(userId?: string, sessionId?: string): Promise<void> {
    let q;
    if (userId) {
      q = query(collection(db, "cartItems"), where("userId", "==", userId));
    } else if (sessionId) {
      q = query(collection(db, "cartItems"), where("sessionId", "==", sessionId));
    } else {
      return;
    }
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }

  async getOrders(userId?: string): Promise<Order[]> {
    let q = collection(db, "orders");
    if (userId) {
      q = query(q, where("userId", "==", userId));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const docRef = doc(db, "orders", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Order;
    }
    return undefined;
  }

  async createOrder(
    order: InsertOrder,
    items: { productId: string; productName: string; productPrice: string; quantity: number }[]
  ): Promise<Order> {
    const docRef = await addDoc(collection(db, "orders"), order);
    const newOrder = { id: docRef.id, ...order } as Order;

    const orderItemsPromises = items.map(item =>
      addDoc(collection(db, "orderItems"), {
        orderId: newOrder.id,
        productId: item.productId,
        productName: item.productName,
        productPrice: item.productPrice,
        quantity: item.quantity,
      })
    );
    await Promise.all(orderItemsPromises);

    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const docRef = doc(db, "orders", id);
    await updateDoc(docRef, { status });
    const updatedDoc = await getDoc(docRef);
    if (updatedDoc.exists()) {
      return { id: updatedDoc.id, ...updatedDoc.data() } as Order;
    }
    return undefined;
  }

  // Wishlist methods for DatabaseStorage
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    const q = query(collection(db, "wishlistItems"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WishlistItem));
  }

  async addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
    // Check if already exists
    const q = query(
      collection(db, "wishlistItems"), 
      where("userId", "==", userId), 
      where("productId", "==", productId)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as WishlistItem;
    }

    const docRef = await addDoc(collection(db, "wishlistItems"), {
      userId,
      productId,
      createdAt: new Date()
    });
    return { id: docRef.id, userId, productId, createdAt: new Date() } as WishlistItem;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const q = query(
      collection(db, "wishlistItems"), 
      where("userId", "==", userId), 
      where("productId", "==", productId)
    );
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const q = query(
      collection(db, "wishlistItems"), 
      where("userId", "==", userId), 
      where("productId", "==", productId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }
}

// In-memory storage implementation
class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private categories: Map<string, Category> = new Map();
  private cartItems: Map<string, CartItem> = new Map();
  private orders: Map<string, Order> = new Map();
  private orderItems: Map<string, OrderItem> = new Map();
  private wishlistItems: Map<string, WishlistItem> = new Map();
  private idCounter = 1;

  constructor() {
    // Initialize with default categories
    const defaultCategories = [
      { name: "Bracelet", slug: "bracelet", description: "Beautiful bracelets for every occasion", imageUrl: "/images/bracelet.jpg" },
      { name: "Earrings", slug: "earrings", description: "Elegant earrings and studs", imageUrl: "/images/earring.jpg" },
      { name: "Ring", slug: "ring", description: "Exquisite rings for all styles", imageUrl: "/images/ring.jpg" },
      { name: "Neckchain", slug: "neckchain", description: "Stunning neckchains and pendants", imageUrl: "/images/neckchain.jpg" },
    ];

    defaultCategories.forEach((cat, index) => {
      const id = `cat_${index + 1}`;
      this.categories.set(id, { id, ...cat } as Category);
    });
    
    console.log("✅ Default categories loaded: Bracelet, Earrings, Ring, Neckchain");
    
    // Initialize with sample products
    const sampleProducts = [
      {
        name: "Golden Elegance Ring",
        slug: "golden-elegance-ring",
        description: "A stunning 18K gold ring with intricate design, perfect for special occasions.",
        price: "4999",
        categoryId: "cat_3", // Ring
        images: ["/images/products/ring1.jpg"],
        material: "18K Gold",
        stock: 15,
        featured: true
      },
      {
        name: "Diamond Solitaire Ring",
        slug: "diamond-solitaire-ring",
        description: "Classic diamond solitaire ring with brilliant cut stone.",
        price: "12999",
        categoryId: "cat_3", // Ring
        images: ["/images/products/ring2.jpg"],
        material: "Platinum, Diamond",
        stock: 8,
        featured: true
      },
      {
        name: "Pearl Drop Earrings",
        slug: "pearl-drop-earrings",
        description: "Elegant freshwater pearl drop earrings with gold accents.",
        price: "2499",
        categoryId: "cat_2", // Earrings
        images: ["/images/products/earring1.jpg"],
        material: "Gold, Pearl",
        stock: 20,
        featured: true
      },
      {
        name: "Crystal Stud Earrings",
        slug: "crystal-stud-earrings",
        description: "Sparkling crystal studs for everyday elegance.",
        price: "1299",
        categoryId: "cat_2", // Earrings
        images: ["/images/products/earring2.jpg"],
        material: "Sterling Silver, Crystal",
        stock: 30,
        featured: false
      },
      {
        name: "Rose Gold Bracelet",
        slug: "rose-gold-bracelet",
        description: "Delicate rose gold bracelet with heart charm.",
        price: "3499",
        categoryId: "cat_1", // Bracelet
        images: ["/images/products/bracelet1.jpg"],
        material: "Rose Gold",
        stock: 12,
        featured: true
      },
      {
        name: "Silver Chain Necklace",
        slug: "silver-chain-necklace",
        description: "Classic sterling silver chain necklace, versatile and timeless.",
        price: "1999",
        categoryId: "cat_4", // Neckchain
        images: ["/images/products/neckchain1.jpg"],
        material: "Sterling Silver",
        stock: 25,
        featured: true
      }
    ];

    sampleProducts.forEach((product, index) => {
      const id = `prod_${index + 1}`;
      this.products.set(id, { id, ...product, createdAt: new Date() } as Product);
    });

    console.log("✅ Sample products loaded: 6 products across categories");
    
    // Initialize admin user synchronously
    this.initializeAdminSync();
  }

  private initializeAdminSync() {
    const adminEmail = "raiaura.shop@gmail.com";
    const adminPassword = "Deepraj@22";
    
    // Check if admin already exists
    const existingAdmin = Array.from(this.users.values()).find(u => u.email === adminEmail);
    if (!existingAdmin) {
      // Use synchronous hash for constructor
      const hashedPassword = bcrypt.hashSync(adminPassword, 10);
      const adminUser: User = {
        id: "admin_1",
        username: "RaiAura Admin",
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
        createdAt: new Date()
      };
      this.users.set(adminUser.id, adminUser);
      console.log("✅ Admin user initialized: raiaura.shop@gmail.com");
    }
  }

  private generateId(): string {
    return `id_${Date.now()}_${this.idCounter++}`;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.generateId();
    const user: User = { 
      id, 
      ...insertUser, 
      isAdmin: insertUser.isAdmin ?? false,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    console.log(`✅ User created: ${user.email}`);
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.featured);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(p => p.slug === slug);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.generateId();
    const newProduct: Product = { id, ...product, createdAt: new Date() } as Product;
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...product };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    this.products.delete(id);
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(c => c.slug === slug);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.generateId();
    const newCategory: Category = { id, ...category } as Category;
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...category };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    this.categories.delete(id);
  }

  async getCartItems(userId?: string, sessionId?: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => {
      if (userId) return item.userId === userId;
      if (sessionId) return item.sessionId === sessionId;
      return false;
    });
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const id = this.generateId();
    const newItem: CartItem = { id, ...item } as CartItem;
    this.cartItems.set(id, newItem);
    return newItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const existing = this.cartItems.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, quantity };
    this.cartItems.set(id, updated);
    return updated;
  }

  async removeFromCart(id: string): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(userId?: string, sessionId?: string): Promise<void> {
    const toDelete = Array.from(this.cartItems.entries()).filter(([_, item]) => {
      if (userId) return item.userId === userId;
      if (sessionId) return item.sessionId === sessionId;
      return false;
    });
    toDelete.forEach(([id]) => this.cartItems.delete(id));
  }

  async getOrders(userId?: string): Promise<Order[]> {
    const allOrders = Array.from(this.orders.values());
    if (userId) {
      return allOrders.filter(o => o.userId === userId);
    }
    return allOrders;
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(
    order: InsertOrder,
    items: { productId: string; productName: string; productPrice: string; quantity: number }[]
  ): Promise<Order> {
    const id = this.generateId();
    const newOrder: Order = { id, ...order, createdAt: new Date() } as Order;
    this.orders.set(id, newOrder);

    items.forEach(item => {
      const itemId = this.generateId();
      this.orderItems.set(itemId, {
        id: itemId,
        orderId: newOrder.id,
        ...item,
      } as OrderItem);
    });

    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, status };
    this.orders.set(id, updated);
    return updated;
  }

  // Wishlist methods
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    return Array.from(this.wishlistItems.values()).filter(item => item.userId === userId);
  }

  async addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
    // Check if already in wishlist
    const existing = Array.from(this.wishlistItems.values()).find(
      item => item.userId === userId && item.productId === productId
    );
    if (existing) return existing;

    const id = this.generateId();
    const wishlistItem: WishlistItem = {
      id,
      userId,
      productId,
      createdAt: new Date()
    };
    this.wishlistItems.set(id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const item = Array.from(this.wishlistItems.values()).find(
      item => item.userId === userId && item.productId === productId
    );
    if (item) {
      this.wishlistItems.delete(item.id);
    }
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    return Array.from(this.wishlistItems.values()).some(
      item => item.userId === userId && item.productId === productId
    );
  }
}

// Use in-memory storage (works without Firebase)
export const storage = new MemoryStorage();
