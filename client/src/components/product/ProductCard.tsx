import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Link } from "wouter";
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    cart?.addToCart({ id, name, price, image });
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
              variant="secondary"
              size="icon"
              className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity hover-elevate active-elevate-2"
              onClick={handleAddToCart}
              data-testid={`button-quick-add-${id}`}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </Link>
        <div className="p-4">
          <Link href={`/product/${slug}`}>
            <h3 className="font-medium text-foreground mb-1 hover:text-primary transition-colors" data-testid={`text-product-name-${id}`}>
              {name}
            </h3>
          </Link>
          <p className="font-serif text-lg text-primary font-semibold" data-testid={`text-product-price-${id}`}>
            ₹{price}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
