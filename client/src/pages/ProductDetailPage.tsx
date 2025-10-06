import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Truck, Shield, RotateCcw } from "lucide-react";
import { useState, useContext } from "react";
import { Badge } from "@/components/ui/badge";
import { CartContext } from "@/App";

export default function ProductDetailPage() {
  const [, params] = useRoute("/product/:slug");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const cart = useContext(CartContext);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", params?.slug],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const images = product.images || [];

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  data-testid="img-product-main"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-md overflow-hidden bg-muted hover-elevate ${
                      selectedImage === index ? "ring-2 ring-primary" : ""
                    }`}
                    data-testid={`button-image-${index}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-4" data-testid="text-product-name">
              {product.name}
            </h1>
            <p className="font-serif text-3xl text-primary font-semibold mb-6" data-testid="text-product-price">
              ${product.price}
            </p>

            {product.material && (
              <div className="mb-6">
                <span className="text-sm text-muted-foreground">Material: </span>
                <Badge variant="secondary">{product.material}</Badge>
              </div>
            )}

            <div className="mb-8">
              <label className="text-sm font-medium text-foreground mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="hover-elevate active-elevate-2"
                  data-testid="button-decrease-quantity"
                >
                  -
                </Button>
                <span className="w-12 text-center font-medium" data-testid="text-quantity">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="hover-elevate active-elevate-2"
                  data-testid="button-increase-quantity"
                >
                  +
                </Button>
              </div>
              {product.stock > 0 && (
                <p className="text-sm text-muted-foreground mt-2" data-testid="text-stock">
                  {product.stock} in stock
                </p>
              )}
            </div>

            <Button
              size="lg"
              className="w-full mb-6 hover-elevate active-elevate-2"
              disabled={product.stock === 0}
              onClick={() => {
                if (cart) {
                  for (let i = 0; i < quantity; i++) {
                    cart.addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.images?.[0] || "",
                    });
                  }
                }
              }}
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Free Shipping</p>
                  <p className="text-sm text-muted-foreground">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Secure Payment</p>
                  <p className="text-sm text-muted-foreground">100% secure transactions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">30-Day Returns</p>
                  <p className="text-sm text-muted-foreground">Easy returns and exchanges</p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description" data-testid="tab-description">Description</TabsTrigger>
                <TabsTrigger value="delivery" data-testid="tab-delivery">Delivery</TabsTrigger>
                <TabsTrigger value="care" data-testid="tab-care">Care</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4 text-muted-foreground">
                <p className="leading-relaxed">{product.description}</p>
              </TabsContent>
              <TabsContent value="delivery" className="mt-4 text-muted-foreground">
                <p className="leading-relaxed">
                  We offer free standard shipping on orders over $100. Express shipping is available at checkout.
                  Orders are processed within 1-2 business days and typically arrive within 5-7 business days.
                </p>
              </TabsContent>
              <TabsContent value="care" className="mt-4 text-muted-foreground">
                <p className="leading-relaxed">
                  To maintain the beauty of your jewellery, avoid contact with water, perfume, and chemicals.
                  Store in a cool, dry place when not in use. Clean gently with a soft cloth.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
