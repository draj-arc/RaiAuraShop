import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CartContext } from "@/App";
import { useLocation } from "wouter";
import { Banknote, CheckCircle, ShoppingBag, MessageCircle } from "lucide-react";

const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Please enter your full address"),
  city: z.string().min(2, "Please enter your city"),
  state: z.string().min(2, "Please enter your state"),
  postalCode: z.string().min(6, "PIN code must be 6 digits"),
  country: z.string().default("India"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { toast } = useToast();
  const cart = useContext(CartContext);
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
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
          status: "confirmed",
          paymentMethod: "cod",
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

      // Create WhatsApp message with order details
      const orderItems = cart.cartItems.map(item => 
        `• ${item.productName} x${item.quantity} - ₹${(parseFloat(item.productPrice) * item.quantity).toFixed(0)}`
      ).join('\n');
      
      const whatsappMessage = `🛍️ *New Order from RaiAura Shop*\n\n` +
        `*Order ID:* ${newOrderId}\n\n` +
        `*Customer Details:*\n` +
        `Name: ${data.fullName}\n` +
        `Phone: ${data.phone}\n` +
        `Email: ${data.email}\n\n` +
        `*Shipping Address:*\n` +
        `${data.address}\n` +
        `${data.city}, ${data.state} - ${data.postalCode}\n\n` +
        `*Order Items:*\n${orderItems}\n\n` +
        `*Subtotal:* ₹${subtotal.toFixed(0)}\n` +
        `*Shipping:* ${shipping === 0 ? 'FREE' : `₹${shipping}`}\n` +
        `*Total:* ₹${total.toFixed(0)}\n\n` +
        `*Payment Method:* Cash on Delivery`;

      const whatsappUrl = `https://wa.me/918121503307?text=${encodeURIComponent(whatsappMessage)}`;

      if (cart.clearCart) {
        cart.clearCart();
      }
      
      setOrderPlaced(true);
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "Order Placed Successfully! 🎉",
        description: `Your order has been confirmed. Redirecting to WhatsApp...`,
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
                    <div className="flex items-center space-x-3 border rounded-lg p-4 bg-green-50 border-green-200">
                      <Banknote className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Cash on Delivery</p>
                        <p className="text-sm text-green-600">Pay when you receive your order</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-3 border rounded-lg p-4 bg-emerald-50 border-emerald-200">
                      <MessageCircle className="h-6 w-6 text-emerald-600" />
                      <div>
                        <p className="font-medium text-emerald-800">WhatsApp Confirmation</p>
                        <p className="text-sm text-emerald-600">Order details will be sent to WhatsApp</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full hover-elevate active-elevate-2"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : `Place Order • ₹${total.toFixed(0)}`}
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
