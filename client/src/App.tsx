import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useState, createContext, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CheckoutPage from "@/pages/CheckoutPage";
import DashboardPage from "@/pages/DashboardPage";
import AdminPage from "@/pages/AdminPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import FAQPage from "@/pages/FAQPage";
import PoliciesPage from "@/pages/PoliciesPage";
import LoginPage from "@/pages/LoginPage";
import AddressesPage from "@/pages/AddressesPage";
import WishlistPage from "@/pages/WishlistPage";
import PaymentMethodsPage from "@/pages/PaymentMethodsPage";
import RewardsPage from "@/pages/RewardsPage";
import NotFound from "@/pages/not-found";

export const CartContext = createContext<ReturnType<typeof useCart> | null>(null);

// Component to scroll to top on route change
function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/shop" component={ShopPage} />
        <Route path="/product/:slug" component={ProductDetailPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/faq" component={FAQPage} />
        <Route path="/policies" component={PoliciesPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/addresses" component={AddressesPage} />
        <Route path="/wishlist" component={WishlistPage} />
        <Route path="/payment-methods" component={PaymentMethodsPage} />
        <Route path="/rewards" component={RewardsPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useCart();

  return (
    <QueryClientProvider client={queryClient}>
      <CartContext.Provider value={cart}>
        <TooltipProvider>
          <div className="flex flex-col min-h-screen">
            <Header onCartOpen={() => setCartOpen(true)} cartItemCount={cart.cartItems.length} />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
          <CartDrawer
            open={cartOpen}
            onOpenChange={setCartOpen}
            items={cart.cartItems}
            onUpdateQuantity={cart.updateQuantity}
            onRemoveItem={cart.removeItem}
          />
          <Toaster />
        </TooltipProvider>
      </CartContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
