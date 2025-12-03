import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Plus, MapPin, Home, Building, Trash2, Edit, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  type: "home" | "work" | "other";
  isDefault: boolean;
}

export default function AddressesPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    // Load addresses from localStorage
    const saved = localStorage.getItem("addresses");
    if (saved) {
      setAddresses(JSON.parse(saved));
    }
  }, []);

  const saveAddresses = (newAddresses: Address[]) => {
    setAddresses(newAddresses);
    localStorage.setItem("addresses", JSON.stringify(newAddresses));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newAddress: Address = {
      id: editingAddress?.id || `addr_${Date.now()}`,
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      pincode: formData.get("pincode") as string,
      type: formData.get("type") as "home" | "work" | "other",
      isDefault: addresses.length === 0 || formData.get("isDefault") === "on",
    };

    let updated: Address[];
    if (editingAddress) {
      updated = addresses.map(a => a.id === editingAddress.id ? newAddress : a);
    } else {
      updated = [...addresses, newAddress];
    }

    // If this is set as default, unset others
    if (newAddress.isDefault) {
      updated = updated.map(a => ({ ...a, isDefault: a.id === newAddress.id }));
    }

    saveAddresses(updated);
    setDialogOpen(false);
    setEditingAddress(null);
    
    toast({
      title: editingAddress ? "Address Updated" : "Address Added",
      description: "Your address has been saved successfully.",
    });
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    saveAddresses(updated);
    toast({
      title: "Address Deleted",
      description: "The address has been removed.",
    });
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    saveAddresses(updated);
    toast({
      title: "Default Address Updated",
      description: "Your default delivery address has been changed.",
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
            <h1 className="font-serif text-3xl md:text-4xl font-light">My Addresses</h1>
            <p className="text-muted-foreground">Manage your delivery addresses</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-6 hover-elevate" onClick={() => setEditingAddress(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" defaultValue={editingAddress?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" defaultValue={editingAddress?.phone} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" defaultValue={editingAddress?.address} required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" defaultValue={editingAddress?.city} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" defaultValue={editingAddress?.state} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" name="pincode" defaultValue={editingAddress?.pincode} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address Type</Label>
                <RadioGroup name="type" defaultValue={editingAddress?.type || "home"} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="home" id="home" />
                    <Label htmlFor="home" className="flex items-center gap-1">
                      <Home className="h-4 w-4" /> Home
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="work" id="work" />
                    <Label htmlFor="work" className="flex items-center gap-1">
                      <Building className="h-4 w-4" /> Work
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <Button type="submit" className="w-full">
                {editingAddress ? "Update Address" : "Save Address"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {addresses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">No addresses saved yet</p>
              <p className="text-sm text-muted-foreground">Add an address to make checkout faster</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <Card key={address.id} className={`hover-elevate ${address.isDefault ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {address.type === "home" ? (
                          <Home className="h-4 w-4 text-primary" />
                        ) : (
                          <Building className="h-4 w-4 text-primary" />
                        )}
                        <span className="font-medium capitalize">{address.type}</span>
                        {address.isDefault && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="font-medium">{address.name}</p>
                      <p className="text-sm text-muted-foreground">{address.phone}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {address.address}, {address.city}, {address.state} - {address.pincode}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingAddress(address);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(address.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => handleSetDefault(address.id)}
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
