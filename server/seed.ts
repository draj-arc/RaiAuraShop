import { db } from "./db";
import { categories, products, users } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const categoriesData = [
    {
      name: "Earrings",
      slug: "earrings",
      description: "Elegant earrings for every occasion",
      displayOrder: 1,
    },
    {
      name: "Rings",
      slug: "rings",
      description: "Beautiful rings to adorn your fingers",
      displayOrder: 2,
    },
    {
      name: "Bracelets",
      slug: "bracelets",
      description: "Stunning bracelets for your wrists",
      displayOrder: 3,
    },
    {
      name: "Necklaces",
      slug: "necklaces",
      description: "Exquisite necklaces to complement any outfit",
      displayOrder: 4,
    },
    {
      name: "Hair Accessories",
      slug: "hair-accessories",
      description: "Delicate accessories for your hair",
      displayOrder: 5,
    },
  ];

  const insertedCategories = await db.insert(categories).values(categoriesData).returning();
  console.log(`Inserted ${insertedCategories.length} categories`);

  const earringsCat = insertedCategories.find(c => c.slug === "earrings")!;
  const ringsCat = insertedCategories.find(c => c.slug === "rings")!;
  const braceletsCat = insertedCategories.find(c => c.slug === "bracelets")!;
  const necklacesCat = insertedCategories.find(c => c.slug === "necklaces")!;

  const productsData = [
    {
      name: "Rose Gold Drop Earrings",
      slug: "rose-gold-drop-earrings",
      description: "Elegant rose gold drop earrings featuring delicate chains and a contemporary design. Perfect for both casual and formal occasions.",
      price: "89.99",
      categoryId: earringsCat.id,
      images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80"],
      stock: 15,
      material: "Rose Gold",
      featured: true,
    },
    {
      name: "Pearl Stud Earrings",
      slug: "pearl-stud-earrings",
      description: "Classic pearl stud earrings set in sterling silver. Timeless elegance for everyday wear.",
      price: "65.00",
      categoryId: earringsCat.id,
      images: ["https://images.unsplash.com/photo-1596944946407-cf89c93b1149?w=800&q=80"],
      stock: 20,
      material: "Sterling Silver, Pearl",
      featured: false,
    },
    {
      name: "Diamond Solitaire Ring",
      slug: "diamond-solitaire-ring",
      description: "A stunning solitaire diamond ring set in 14k white gold. The perfect symbol of eternal love.",
      price: "1299.00",
      categoryId: ringsCat.id,
      images: ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80"],
      stock: 5,
      material: "14k White Gold, Diamond",
      featured: true,
    },
    {
      name: "Stackable Rose Gold Rings",
      slug: "stackable-rose-gold-rings",
      description: "Set of three delicate stackable rings in rose gold. Mix and match for a personalized look.",
      price: "149.00",
      categoryId: ringsCat.id,
      images: ["https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80"],
      stock: 12,
      material: "Rose Gold",
      featured: true,
    },
    {
      name: "Charm Bracelet",
      slug: "charm-bracelet",
      description: "Sterling silver charm bracelet with customizable charms. Tell your unique story.",
      price: "179.00",
      categoryId: braceletsCat.id,
      images: ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80"],
      stock: 10,
      material: "Sterling Silver",
      featured: false,
    },
    {
      name: "Gold Bangle Bracelet",
      slug: "gold-bangle-bracelet",
      description: "Classic 18k gold bangle bracelet with a sleek, modern design. A wardrobe essential.",
      price: "399.00",
      categoryId: braceletsCat.id,
      images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80"],
      stock: 8,
      material: "18k Gold",
      featured: true,
    },
    {
      name: "Layered Chain Necklace",
      slug: "layered-chain-necklace",
      description: "Delicate layered chain necklace in rose gold. Perfect for adding dimension to any outfit.",
      price: "129.00",
      categoryId: necklacesCat.id,
      images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80"],
      stock: 18,
      material: "Rose Gold",
      featured: false,
    },
    {
      name: "Pearl Pendant Necklace",
      slug: "pearl-pendant-necklace",
      description: "Elegant pearl pendant on a delicate gold chain. Sophisticated and timeless.",
      price: "199.00",
      categoryId: necklacesCat.id,
      images: ["https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80"],
      stock: 14,
      material: "Gold, Pearl",
      featured: false,
    },
  ];

  const insertedProducts = await db.insert(products).values(productsData).returning();
  console.log(`Inserted ${insertedProducts.length} products`);

  const hashedPassword = await bcrypt.hash("admin123", 10);
  const [adminUser] = await db.insert(users).values({
    username: "admin",
    email: "admin@raiaura.com",
    password: hashedPassword,
    isAdmin: true,
  }).returning();
  console.log(`Created admin user: ${adminUser.email}`);

  console.log("Seeding complete!");
}

seed()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
