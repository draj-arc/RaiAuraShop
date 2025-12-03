import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PoliciesPage() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-8 text-center">
          Our Policies
        </h1>

        <Tabs defaultValue="shipping" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="shipping" data-testid="tab-shipping">Shipping</TabsTrigger>
            <TabsTrigger value="returns" data-testid="tab-returns">Returns</TabsTrigger>
            <TabsTrigger value="privacy" data-testid="tab-privacy">Privacy</TabsTrigger>
            <TabsTrigger value="terms" data-testid="tab-terms">Terms</TabsTrigger>
          </TabsList>

          <TabsContent value="shipping" className="mt-6 space-y-4 text-muted-foreground">
            <h2 className="font-serif text-2xl text-foreground mb-4">Shipping Policy</h2>
            <p className="leading-relaxed">
              We offer shipping across India on all orders. Standard shipping is free on orders over ₹999. For orders below ₹999, a flat rate of ₹99 applies.
            </p>
            <h3 className="font-semibold text-foreground mt-6 mb-2">Shipping Times:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Standard Shipping (US): 5-7 business days</li>
              <li>Express Shipping (US): 2-3 business days</li>
              <li>International Shipping: 10-14 business days</li>
            </ul>
            <p className="leading-relaxed mt-4">
              All orders are processed within 1-2 business days. You will receive a tracking number via email once your order has shipped.
            </p>
          </TabsContent>

          <TabsContent value="returns" className="mt-6 space-y-4 text-muted-foreground">
            <h2 className="font-serif text-2xl text-foreground mb-4">Returns & Exchanges</h2>
            <p className="leading-relaxed">
              We want you to love your purchase! If you're not completely satisfied, we offer a 30-day return policy for unworn items in their original condition.
            </p>
            <h3 className="font-semibold text-foreground mt-6 mb-2">Return Process:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Contact us within 30 days of delivery</li>
              <li>Return the item unworn in its original packaging</li>
              <li>Include your order number and reason for return</li>
              <li>We'll process your refund within 5-7 business days</li>
            </ol>
            <p className="leading-relaxed mt-4">
              Please note: Custom or personalized items cannot be returned or exchanged unless there is a defect.
            </p>
          </TabsContent>

          <TabsContent value="privacy" className="mt-6 space-y-4 text-muted-foreground">
            <h2 className="font-serif text-2xl text-foreground mb-4">Privacy Policy</h2>
            <p className="leading-relaxed">
              At Rai Aura, we are committed to protecting your privacy and personal information. This policy outlines how we collect, use, and safeguard your data.
            </p>
            <h3 className="font-semibold text-foreground mt-6 mb-2">Information We Collect:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Name, email address, and shipping address</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Order history and preferences</li>
            </ul>
            <h3 className="font-semibold text-foreground mt-6 mb-2">How We Use Your Information:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>To process and fulfill your orders</li>
              <li>To send order confirmations and shipping updates</li>
              <li>To improve our products and services</li>
              <li>To send promotional emails (you can opt out anytime)</li>
            </ul>
            <p className="leading-relaxed mt-4">
              We never sell or share your personal information with third parties for marketing purposes.
            </p>
          </TabsContent>

          <TabsContent value="terms" className="mt-6 space-y-4 text-muted-foreground">
            <h2 className="font-serif text-2xl text-foreground mb-4">Terms of Service</h2>
            <p className="leading-relaxed">
              By accessing and using the Rai Aura website, you agree to be bound by these Terms of Service.
            </p>
            <h3 className="font-semibold text-foreground mt-6 mb-2">Product Information:</h3>
            <p className="leading-relaxed">
              We strive to display product colors and images as accurately as possible. However, actual colors may vary slightly due to monitor settings and lighting conditions.
            </p>
            <h3 className="font-semibold text-foreground mt-6 mb-2">Pricing:</h3>
            <p className="leading-relaxed">
              All prices are in USD and subject to change without notice. We reserve the right to modify or discontinue products at any time.
            </p>
            <h3 className="font-semibold text-foreground mt-6 mb-2">Intellectual Property:</h3>
            <p className="leading-relaxed">
              All content on this website, including images, text, and designs, is the property of Rai Aura and protected by copyright laws.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
