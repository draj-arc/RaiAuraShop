import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ProductCard } from "@/components/product/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Sparkles } from "lucide-react";
import { Product, Category } from "@shared/schema";

export default function HomePage() {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  return (
    <div className="min-h-screen">
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
              src="https://images.unsplash.com/photo-1611652022419-a9419f74343b?w=800&q=80"
              alt="Craftsmanship"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
