import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Heart, ShoppingCart, Trash2, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";

interface WishlistItem {
  productId: string;
  addedAt: string;
}

export default function WishlistPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/.netlify/functions/products"],
  });

  useEffect(() => {
    // Load wishlist from localStorage
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  }, []);

  const removeFromWishlist = (productId: string) => {
    const updated = wishlist.filter(item => item.productId !== productId);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    toast({
      title: "Removed from Wishlist",
      description: "Item has been removed from your wishlist.",
    });
  };

  const addToCart = (product: Product) => {
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = existingCart.find((item: any) => item.productId === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      existingCart.push({
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.images?.[0] || "",
        quantity: 1,
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(existingCart));
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const wishlistProducts = products.filter(p => 
    wishlist.some(w => w.productId === p.id)
  );

  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen py-12 md:py-20 bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover-elevate">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-light">My Wishlist</h1>
            <p className="text-muted-foreground">{wishlistProducts.length} items saved</p>
          </div>
        </div>

        {wishlistProducts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="h-20 w-20 mx-auto text-muted-foreground/30 mb-6" />
              <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Save items you love by clicking the heart icon on products
              </p>
              <Link href="/shop">
                <Button className="hover-elevate">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Explore Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover-elevate group">
                <div className="aspect-square relative bg-accent/20">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFromWishlist(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-medium hover:text-primary transition-colors cursor-pointer">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-primary font-semibold mt-1">₹{product.price}</p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      className="flex-1 hover-elevate"
                      onClick={() => addToCart(product)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
