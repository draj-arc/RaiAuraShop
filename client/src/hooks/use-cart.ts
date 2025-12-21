import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: string;
  productImage: string;
  quantity: number;
}

// Helper to check if user is logged in
function isUserLoggedIn(): boolean {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return !!(token && user);
}

// Helper to get current user
function getCurrentUser(): { id: string; email: string; username: string } | null {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load cart for the current user only
    const user = getCurrentUser();
    if (user) {
      const savedCart = localStorage.getItem(`cart_${user.id}`);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } else {
      // Clear cart if not logged in
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    // Save cart for the current user
    const user = getCurrentUser();
    if (user && cartItems.length >= 0) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = (product: { id: string; name: string; price: string; image: string }): boolean => {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to your cart",
        variant: "destructive",
      });
      return false;
    }

    setCartItems((items) => {
      const existing = items.find((item) => item.productId === product.id);
      
      if (existing) {
        toast({
          title: "Updated cart",
          description: `Increased quantity of ${product.name}`,
        });
        return items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
      
      return [
        ...items,
        {
          id: `cart-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          productImage: product.image,
          quantity: 1,
        },
      ];
    });
    return true;
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems((items) => items.filter((item) => item.id !== itemId));
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart",
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return {
    cartItems,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
