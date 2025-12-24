import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ProductCard } from "@/components/product/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Sparkles } from "lucide-react";
import { Product, Category } from "@shared/schema";
import { useState } from "react";

// Toggle this to switch between animated and static hero
const USE_ANIMATED_HERO = true;

// Original static hero image (kept for reverting)
const STATIC_HERO_IMAGE = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=80";

export default function HomePage() {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/.netlify/functions/categories"],
  });

  const { data: featuredProducts = [] } = useQuery<Product[]>({
    queryKey: ["/.netlify/functions/products/featured"],
  });

  return (
    <div className="min-h-screen">
      {USE_ANIMATED_HERO ? (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-background">
          {/* Animated Background with jewellery image */}
          <div className="absolute inset-0">
            {/* Background image with overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${STATIC_HERO_IMAGE}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-accent/30" />
            
            {/* Floating particles/sparkles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(25)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-primary/60 rounded-full animate-float"
                  style={{
                    left: `${(i * 4) % 100}%`,
                    top: `${(i * 7) % 100}%`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: `${5 + (i % 4)}s`,
                  }}
                />
              ))}
            </div>
            
            {/* Animated gradient orbs */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/25 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-spin-very-slow" />
            
            {/* Diamond pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="diamond-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M30 5L55 30L30 55L5 30Z" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#diamond-pattern)" />
              </svg>
            </div>

            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <div className="mb-6 inline-flex items-center gap-2 text-primary animate-fade-in">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span className="text-sm tracking-widest uppercase">Timeless Elegance</span>
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-foreground mb-6 animate-fade-in-up">
              Discover Your
              <br />
              <span className="text-primary bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text">Perfect Piece</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-300">
              Handcrafted jewellery that celebrates your unique beauty and style. Each piece tells a story of elegance and craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-500">
              <Link href="/shop">
                <Button size="lg" className="hover-elevate active-elevate-2 text-sm tracking-widest group" data-testid="button-shop-now">
                  <Sparkles className="mr-2 h-4 w-4 group-hover:animate-spin" />
                  SHOP COLLECTION
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="hover-elevate active-elevate-2 text-sm tracking-widest" data-testid="button-learn-more">
                  LEARN MORE
                </Button>
              </Link>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-8 w-8 text-muted-foreground" />
          </div>
        </section>
      ) : (
        /* Original Static Hero - Set USE_ANIMATED_HERO to false to use this */
        <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-accent/20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=80')] bg-cover bg-center opacity-20"></div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <div className="mb-6 inline-flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm tracking-widest uppercase">Timeless Elegance</span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-foreground mb-6">
              Discover Your
              <br />
              <span className="text-primary">Perfect Piece</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Handcrafted jewellery that celebrates your unique beauty and style. Each piece tells a story of elegance and craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop">
                <Button size="lg" className="hover-elevate active-elevate-2 text-sm tracking-widest" data-testid="button-shop-now">
                  SHOP COLLECTION
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="hover-elevate active-elevate-2 text-sm tracking-widest" data-testid="button-learn-more">
                  LEARN MORE
                </Button>
              </Link>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-8 w-8 text-muted-foreground" />
          </div>
        </section>
      )}

      <section className="py-20 md:py-32 container mx-auto px-4 md:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">
            Shop by Category
          </h2>
          <p className="text-muted-foreground text-lg">
            Explore our curated collections
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/shop?category=${category.slug}`}>
              <div className="group cursor-pointer" data-testid={`category-${category.slug}`}>
                <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3 hover:shadow-lg transition-all hover-elevate">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-4xl text-muted-foreground">{category.name[0]}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-center text-sm tracking-widest uppercase text-muted-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="py-20 md:py-32 bg-accent/10">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">
                New Arrivals
              </h2>
              <p className="text-muted-foreground text-lg">
                Discover our latest pieces
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {featuredProducts.slice(0, 4).map((product) => (
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

            <div className="text-center mt-12">
              <Link href="/shop">
                <Button variant="outline" size="lg" className="hover-elevate active-elevate-2 text-sm tracking-widest" data-testid="button-view-all">
                  VIEW ALL PRODUCTS
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 md:py-32 container mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-6">
              Crafted with Love
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Every piece in our collection is meticulously handcrafted by skilled artisans. We believe in creating jewellery that not only looks beautiful but also carries the warmth of human touch and dedication.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              From selecting the finest materials to the final polish, each step is guided by our commitment to excellence and your satisfaction.
            </p>
            <Link href="/about">
              <Button variant="outline" className="hover-elevate active-elevate-2" data-testid="button-our-story">
                Our Story
              </Button>
            </Link>
          </div>
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80"
              alt="Craftsmanship"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
