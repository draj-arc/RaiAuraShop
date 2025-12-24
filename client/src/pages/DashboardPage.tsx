import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { 
  Package, 
  Settings, 
  LogOut, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  User, 
  HelpCircle,
  CreditCard,
  Bell,
  Gift,
  ChevronRight,
  Crown,
  Plus,
  LayoutDashboard
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface UserData {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/.netlify/functions/orders"],
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    setLocation("/");
  };

  // If no user is logged in, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-2xl text-center">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-serif text-3xl mb-4">Welcome to Rai Aura</h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to access your dashboard and manage your orders.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button className="hover-elevate">Sign In</Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline" className="hover-elevate">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (user.isAdmin) {
    return (
      <div className="min-h-screen py-12 md:py-20 bg-gradient-to-b from-background to-accent/5">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          {/* Admin Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">Welcome back, {user.username}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              <Crown className="h-3 w-3 mr-1" />
              Administrator
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</p>
                  </div>
                  <Bell className="h-8 w-8 text-yellow-500/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{orders.filter(o => o.status === 'delivered').length}</p>
                  </div>
                  <Gift className="h-8 w-8 text-green-500/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">₹{orders.reduce((sum, o) => sum + parseFloat(o.total || '0'), 0).toFixed(0)}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Link href="/admin">
              <Card className="hover-elevate cursor-pointer group h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <LayoutDashboard className="h-6 w-6 text-primary" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <CardTitle className="mt-4">Manage Products</CardTitle>
                  <CardDescription>Add, edit, or remove products from your store</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin">
              <Card className="hover-elevate cursor-pointer group h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                      <Package className="h-6 w-6 text-orange-500" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <CardTitle className="mt-4">Manage Orders</CardTitle>
                  <CardDescription>View and update order statuses</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Quick Add Product */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Link href="/admin">
                  <Button className="hover-elevate">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Product
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="outline" className="hover-elevate">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Categories
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button variant="outline" className="hover-elevate">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    View Store
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Logout */}
          <div className="flex justify-end">
            <Button variant="destructive" onClick={handleLogout} className="hover-elevate">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // User Dashboard
  return (
    <div className="min-h-screen py-12 md:py-20 bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* User Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground">
                My Account
              </h1>
              <p className="text-muted-foreground">Welcome back, {user.username}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="hover-elevate">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Quick Stats for User */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">My Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <Package className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{orders.filter(o => o.status !== 'delivered').length}</p>
                </div>
                <Bell className="h-8 w-8 text-yellow-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="hover-elevate col-span-2 md:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">₹{orders.reduce((sum, o) => sum + parseFloat(o.total || '0'), 0).toFixed(0)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Menu Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link href="/shop">
            <Card className="hover-elevate cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Shop Now</h3>
                  <p className="text-sm text-muted-foreground">Browse our collection</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/wishlist">
            <Card className="hover-elevate cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Wishlist</h3>
                  <p className="text-sm text-muted-foreground">Saved items</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/addresses">
            <Card className="hover-elevate cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <MapPin className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Addresses</h3>
                  <p className="text-sm text-muted-foreground">Manage delivery addresses</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/payment-methods">
            <Card className="hover-elevate cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <CreditCard className="h-6 w-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Payment Methods</h3>
                  <p className="text-sm text-muted-foreground">Manage payment options</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/rewards">
            <Card className="hover-elevate cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <Gift className="h-6 w-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Rewards</h3>
                  <p className="text-sm text-muted-foreground">View your rewards</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/faq">
            <Card className="hover-elevate cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                  <HelpCircle className="h-6 w-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Help & Support</h3>
                  <p className="text-sm text-muted-foreground">FAQs and contact</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        </div>

        <Separator className="my-8" />

        {/* Order History */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl flex items-center gap-2">
              <Package className="h-6 w-6" />
              My Orders
            </CardTitle>
            <CardDescription>Track and manage your orders</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
                <Link href="/shop">
                  <Button className="hover-elevate">Start Shopping</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-primary">₹{order.total}</p>
                        <Badge 
                          variant={order.status === 'delivered' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
