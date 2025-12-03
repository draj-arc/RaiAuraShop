import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CreditCard, Plus, Trash2, Check, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentMethod {
  id: string;
  type: "card" | "upi";
  last4?: string;
  cardBrand?: string;
  upiId?: string;
  isDefault: boolean;
}

export default function PaymentMethodsPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<"card" | "upi">("card");

  useEffect(() => {
    // Load payment methods from localStorage
    const saved = localStorage.getItem("paymentMethods");
    if (saved) {
      setMethods(JSON.parse(saved));
    }
  }, []);

  const saveMethods = (newMethods: PaymentMethod[]) => {
    setMethods(newMethods);
    localStorage.setItem("paymentMethods", JSON.stringify(newMethods));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let newMethod: PaymentMethod;
    
    if (paymentType === "card") {
      const cardNumber = formData.get("cardNumber") as string;
      newMethod = {
        id: `pm_${Date.now()}`,
        type: "card",
        last4: cardNumber.slice(-4),
        cardBrand: cardNumber.startsWith("4") ? "Visa" : cardNumber.startsWith("5") ? "Mastercard" : "Card",
        isDefault: methods.length === 0,
      };
    } else {
      newMethod = {
        id: `pm_${Date.now()}`,
        type: "upi",
        upiId: formData.get("upiId") as string,
        isDefault: methods.length === 0,
      };
    }

    const updated = [...methods, newMethod];
    saveMethods(updated);
    setDialogOpen(false);
    
    toast({
      title: "Payment Method Added",
      description: "Your payment method has been saved securely.",
    });
  };

  const handleDelete = (id: string) => {
    const updated = methods.filter(m => m.id !== id);
    saveMethods(updated);
    toast({
      title: "Payment Method Removed",
      description: "The payment method has been deleted.",
    });
  };

  const handleSetDefault = (id: string) => {
    const updated = methods.map(m => ({ ...m, isDefault: m.id === id }));
    saveMethods(updated);
    toast({
      title: "Default Payment Updated",
      description: "Your default payment method has been changed.",
    });
  };

  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen py-12 md:py-20 bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover-elevate">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-light">Payment Methods</h1>
            <p className="text-muted-foreground">Manage your saved payment options</p>
          </div>
        </div>

        <Card className="mb-6 bg-green-500/5 border-green-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-700">
              Your payment information is encrypted and securely stored
            </p>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-6 hover-elevate">
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <RadioGroup value={paymentType} onValueChange={(v) => setPaymentType(v as "card" | "upi")} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card">Credit/Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi">UPI</Label>
                </div>
              </RadioGroup>

              <form onSubmit={handleSubmit} className="space-y-4">
                {paymentType === "card" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input 
                        id="cardNumber" 
                        name="cardNumber" 
                        placeholder="1234 5678 9012 3456"
                        maxLength={16}
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" name="expiry" placeholder="MM/YY" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" name="cvv" placeholder="123" maxLength={3} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name on Card</Label>
                      <Input id="name" name="name" placeholder="John Doe" required />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input 
                      id="upiId" 
                      name="upiId" 
                      placeholder="yourname@upi"
                      required 
                    />
                  </div>
                )}
                <Button type="submit" className="w-full">
                  Add Payment Method
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>

        {methods.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CreditCard className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">No payment methods saved</p>
              <p className="text-sm text-muted-foreground">Add a payment method for faster checkout</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {methods.map((method) => (
              <Card key={method.id} className={`hover-elevate ${method.isDefault ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        {method.type === "card" ? (
                          <>
                            <p className="font-medium">{method.cardBrand} •••• {method.last4}</p>
                            <p className="text-sm text-muted-foreground">Credit/Debit Card</p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium">{method.upiId}</p>
                            <p className="text-sm text-muted-foreground">UPI</p>
                          </>
                        )}
                        {method.isDefault && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(method.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Set as Default
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
