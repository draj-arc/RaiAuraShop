import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useContext } from "react";
import { CartContext } from "@/App";

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  image: string;
  slug: string;
}

export function ProductCard({ id, name, price, image, slug }: ProductCardProps) {
  const cart = useContext(CartContext);
  const [, setLocation] = useLocation();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    const success = cart?.addToCart({ id, name, price, image });
    // If addToCart returns false, user is not logged in - redirect to login
    if (success === false) {
      setLocation("/login");
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover-elevate" data-testid={`card-product-${id}`}>
      <CardContent className="p-0">
        <Link href={`/product/${slug}`}>
          <div className="aspect-square overflow-hidden bg-muted relative">
            {image ? (
              <img
                src={image}
                alt={name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
            <Button
              variant="default"
              size="icon"
              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10"
              onClick={handleAddToCart}
              data-testid={`button-quick-add-${id}`}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </Link>
        <div className="p-3">
          <Link href={`/product/${slug}`}>
            <h3 className="font-medium text-sm text-foreground mb-1 hover:text-primary transition-colors truncate" data-testid={`text-product-name-${id}`}>
              {name}
            </h3>
          </Link>
          <p className="font-serif text-base text-primary font-semibold" data-testid={`text-product-price-${id}`}>
            ₹{price}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
