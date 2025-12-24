import { useQuery } from "@tanstack/react-query";
import { Product, Category } from "@shared/schema";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";

export default function ShopPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const categoryFilter = searchParams.get("category");
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFilter);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/.netlify/functions/categories"],
  });

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/.netlify/functions/products", selectedCategory],
  });

  const filteredProducts = selectedCategory
    ? products.filter((p) => {
        const category = categories.find((c) => c.id === p.categoryId);
        return category?.slug === selectedCategory;
      })
    : products;

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">
            Shop Our Collection
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover timeless pieces that celebrate your unique style
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="hover-elevate active-elevate-2"
            data-testid="button-category-all"
          >
            All Products
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.slug)}
              className="hover-elevate active-elevate-2"
              data-testid={`button-category-${category.slug}`}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.images?.[0] || ""}
                slug={product.slug}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
