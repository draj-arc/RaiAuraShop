import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState, useContext, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CartContext } from "@/App";
import { useLocation, Link } from "wouter";
import { Banknote, CheckCircle, ShoppingBag, MessageCircle, LogIn } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Please enter your full address"),
  city: z.string().min(2, "Please enter your city"),
  state: z.string().min(2, "Please enter your state"),
  postalCode: z.string().min(6, "PIN code must be 6 digits"),
  country: z.string().default("India"),
  paymentMethod: z.enum(["cod", "whatsapp"]),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

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

export default function CheckoutPage() {
  const { toast } = useToast();
  const cart = useContext(CartContext);
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; username: string } | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const loggedIn = isUserLoggedIn();
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      const user = getCurrentUser();
      setCurrentUser(user);
    }
  }, []);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: currentUser?.email || "",
      fullName: currentUser?.username || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      paymentMethod: "cod",
    },
  });

  const subtotal = cart?.cartItems.reduce(
    (sum, item) => sum + parseFloat(item.productPrice) * item.quantity,
    0
  ) || 0;

  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  const handleSubmit = async (data: CheckoutFormData) => {
    if (!cart || cart.cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const orderPayload = {
        order: {
          customerEmail: data.email,
          customerName: data.fullName,
          shippingAddress: {
            line1: data.address,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country,
            phone: data.phone,
          },
          total: total.toFixed(2),
          status: data.paymentMethod === "cod" ? "confirmed" : "pending_payment",
          paymentMethod: data.paymentMethod,
        },
        items: cart.cartItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          quantity: item.quantity,
        })),
      };

      const response = await apiRequest("POST", "/api/orders", orderPayload);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create order");
      }

      const result = await response.json();
      const newOrderId = result.id || `ORD-${Date.now()}`;
      setOrderId(newOrderId);

      // If WhatsApp payment, redirect to WhatsApp for payment
      if (data.paymentMethod === "whatsapp") {
        const orderItems = cart.cartItems.map(item => 
          `• ${item.productName} x${item.quantity} - ₹${(parseFloat(item.productPrice) * item.quantity).toFixed(0)}`
        ).join('\n');
        
        const whatsappMessage = `Hi! I want to place an order and pay via WhatsApp.\n\n` +
          `*Order ID:* ${newOrderId}\n\n` +
          `*My Details:*\n` +
          `Name: ${data.fullName}\n` +
          `Phone: ${data.phone}\n\n` +
          `*Shipping Address:*\n` +
          `${data.address}\n` +
          `${data.city}, ${data.state} - ${data.postalCode}\n\n` +
          `*Order Items:*\n${orderItems}\n\n` +
          `*Total Amount:* ₹${total.toFixed(0)}\n\n` +
          `Please share payment details.`;

        const whatsappUrl = `https://wa.me/918121503307?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
      }

      if (cart.clearCart) {
        cart.clearCart();
      }
      
      setOrderPlaced(true);
      
      toast({
        title: "Order Placed Successfully! 🎉",
        description: data.paymentMethod === "whatsapp" 
          ? "Redirecting to WhatsApp for payment..." 
          : "Your order has been confirmed.",
      });

    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Order confirmation screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen py-12 md:py-20 bg-accent/10">
        <div className="container mx-auto px-4 md:px-8 max-w-2xl">
          <Card className="text-center p-8">
            <div className="mb-6">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-4">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground mb-2">
              Thank you for your order. Your order ID is:
            </p>
            <p className="text-xl font-semibold text-primary mb-6">{orderId}</p>
            <p className="text-muted-foreground mb-8">
              We've sent a confirmation email with order details.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => setLocation("/shop")} className="hover-elevate">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
              <Button variant="outline" onClick={() => setLocation("/dashboard")} className="hover-elevate">
                View Orders
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className="min-h-screen py-12 md:py-20 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-serif text-2xl mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some items to your cart before checkout
          </p>
          <Button onClick={() => setLocation("/shop")} className="hover-elevate">
            Shop Now
          </Button>
        </Card>
      </div>
    );
  }

  // Not logged in - show login prompt
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen py-12 md:py-20 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <LogIn className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-2xl mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to complete your order. Your cart items will be saved.
          </p>
          <Link href="/login">
            <Button className="hover-elevate w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In to Continue
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Create one for free
            </Link>
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 md:py-20 bg-accent/10">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-8">
          Checkout
        </h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Your full name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="10-digit phone number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="your@email.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="House No, Street, Locality" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="City" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="State" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PIN Code</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="6-digit PIN code" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="space-y-4"
                            >
                              <div className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                                field.value === "cod" 
                                  ? "bg-green-50 border-green-400 ring-2 ring-green-400" 
                                  : "bg-gray-50 border-gray-200 hover:border-green-300"
                              }`}>
                                <RadioGroupItem value="cod" id="cod" className="text-green-600" />
                                <Banknote className={`h-6 w-6 ${field.value === "cod" ? "text-green-600" : "text-gray-500"}`} />
                                <Label htmlFor="cod" className="flex-1 cursor-pointer">
                                  <p className={`font-medium ${field.value === "cod" ? "text-green-800" : "text-gray-700"}`}>
                                    Cash on Delivery
                                  </p>
                                  <p className={`text-sm ${field.value === "cod" ? "text-green-600" : "text-gray-500"}`}>
                                    Pay when you receive your order
                                  </p>
                                </Label>
                              </div>
                              
                              <div className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                                field.value === "whatsapp" 
                                  ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400" 
                                  : "bg-gray-50 border-gray-200 hover:border-emerald-300"
                              }`}>
                                <RadioGroupItem value="whatsapp" id="whatsapp" className="text-emerald-600" />
                                <MessageCircle className={`h-6 w-6 ${field.value === "whatsapp" ? "text-emerald-600" : "text-gray-500"}`} />
                                <Label htmlFor="whatsapp" className="flex-1 cursor-pointer">
                                  <p className={`font-medium ${field.value === "whatsapp" ? "text-emerald-800" : "text-gray-700"}`}>
                                    Pay via WhatsApp
                                  </p>
                                  <p className={`text-sm ${field.value === "whatsapp" ? "text-emerald-600" : "text-gray-500"}`}>
                                    Make payment through WhatsApp chat
                                  </p>
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  size="lg"
                  className={`w-full hover-elevate active-elevate-2 ${
                    form.watch("paymentMethod") === "whatsapp" 
                      ? "bg-emerald-600 hover:bg-emerald-700" 
                      : ""
                  }`}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : (
                    form.watch("paymentMethod") === "whatsapp"
                      ? `Pay via WhatsApp • ₹${total.toFixed(0)}`
                      : `Place Order (COD) • ₹${total.toFixed(0)}`
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary">
                        ₹{(parseFloat(item.productPrice) * item.quantity).toFixed(0)}
                      </p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                  </div>
                  {shipping === 0 && (
                    <p className="text-xs text-green-600">Free shipping on orders above ₹999!</p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toFixed(0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
