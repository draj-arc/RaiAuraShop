import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Image, X, Upload, LogOut, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Link, useLocation } from "wouter";

// Predefined categories for jewellery
const PREDEFINED_CATEGORIES = [
  { name: "Bracelet", slug: "bracelet", description: "Beautiful bracelets for every occasion" },
  { name: "Earrings", slug: "earrings", description: "Elegant earrings and studs" },
  { name: "Ring", slug: "ring", description: "Exquisite rings for all styles" },
  { name: "Neckchain", slug: "neckchain", description: "Stunning neckchains and pendants" },
];

export default function AdminPage() {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Success", description: "Product created successfully" });
      setProductDialogOpen(false);
      productForm.reset();
      setImageUrls([""]);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/products/${id}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Success", description: "Product deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Success", description: "Product updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Success", description: "Category created successfully" });
      setCategoryDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/categories/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Success", description: "Category updated successfully" });
      setEditCategoryId(null);
      setEditCategoryDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/categories/${id}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Success", description: "Category deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const productForm = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: "",
      categoryId: "",
      images: [""],
      stock: 0,
      material: "",
      featured: false,
    },
  });

  const handleProductSubmit = (data: any) => {
    // Filter out empty image URLs
    const filteredImages = imageUrls.filter(url => url.trim() !== "");
    createProductMutation.mutate({
      ...data,
      images: filteredImages.length > 0 ? filteredImages : ["https://via.placeholder.com/400"],
    });
  };

  const handleEditProductSubmit = (data: any) => {
    const filteredImages = imageUrls.filter(url => url.trim() !== "");
    updateProductMutation.mutate({
      id: editProductId!,
      data: {
        ...data,
        images: filteredImages.length > 0 ? filteredImages : ["https://via.placeholder.com/400"],
      },
    });
    setEditProductDialogOpen(false);
    setEditProductId(null);
    setImageUrls([""]);
  };

  const addImageField = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const removeImageField = (index: number) => {
    if (imageUrls.length > 1) {
      setImageUrls(imageUrls.filter((_, i) => i !== index));
    }
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const openEditProductDialog = (product: Product) => {
    setEditProductId(product.id);
    setImageUrls(product.images && product.images.length > 0 ? product.images : [""]);
    productForm.reset({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      images: product.images || [""],
      stock: product.stock,
      material: product.material || "",
      featured: product.featured,
    });
    setEditProductDialogOpen(true);
  };

  const handleCategorySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createCategoryMutation.mutate({
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
    });
  };

  const [, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    setLocation("/");
  };

  return (
    <div className="min-h-screen py-12 md:py-20 bg-accent/10">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="hover-elevate">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground">
              Admin Panel
            </h1>
          </div>
          <Button variant="destructive" onClick={handleLogout} className="hover-elevate">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
            <TabsTrigger value="categories" data-testid="tab-categories">Categories</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Products</h2>
              <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="hover-elevate active-elevate-2" data-testid="button-add-product">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Add New Product</DialogTitle>
                  </DialogHeader>
                  <Form {...productForm}>
                    <form onSubmit={productForm.handleSubmit(handleProductSubmit)} className="space-y-4">
                      <FormField
                        control={productForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-product-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={productForm.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-product-slug" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={productForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={4} data-testid="input-product-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={productForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.01" data-testid="input-product-price" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={productForm.control}
                          name="stock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  value={field.value || 0}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid="input-product-stock" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={productForm.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-product-category">
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={productForm.control}
                        name="material"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Material</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Gold, Silver, Diamond" data-testid="input-product-material" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={productForm.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Featured Product</FormLabel>
                              <p className="text-sm text-muted-foreground">Display this product on homepage</p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            Product Images
                          </Label>
                          <Button type="button" variant="outline" size="sm" onClick={addImageField}>
                            <Plus className="h-4 w-4 mr-1" /> Add Image
                          </Button>
                        </div>
                        {imageUrls.map((url, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              type="url"
                              placeholder="Enter image URL"
                              value={url}
                              onChange={(e) => updateImageUrl(index, e.target.value)}
                              data-testid={`input-product-image-${index}`}
                            />
                            {imageUrls.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeImageField(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {imageUrls.some(url => url.trim() !== "") && (
                          <div className="flex gap-2 flex-wrap mt-2">
                            {imageUrls.filter(url => url.trim() !== "").map((url, index) => (
                              <div key={index} className="w-16 h-16 rounded border overflow-hidden">
                                <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button type="submit" className="w-full hover-elevate active-elevate-2" disabled={createProductMutation.isPending} data-testid="button-save-product">
                        {createProductMutation.isPending ? "Saving..." : "Save Product"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id} className="hover-elevate" data-testid={`product-card-${product.id}`}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
                        {product.featured && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Featured</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{product.description.slice(0, 60)}...</p>
                      <p className="text-primary font-semibold mt-1" data-testid={`text-product-price-${product.id}`}>₹{product.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover-elevate active-elevate-2"
                        onClick={() => openEditProductDialog(product)}
                        data-testid={`button-edit-${product.id}`}
                        title="Edit product"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover-elevate active-elevate-2"
                        onClick={() => deleteProductMutation.mutate(product.id)}
                        disabled={deleteProductMutation.isPending}
                        data-testid={`button-delete-${product.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Edit Product Dialog */}
            <Dialog open={editProductDialogOpen} onOpenChange={setEditProductDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl">Edit Product</DialogTitle>
                </DialogHeader>
                <Form {...productForm}>
                  <form onSubmit={productForm.handleSubmit(handleEditProductSubmit)} className="space-y-4">
                    <FormField
                      control={productForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={productForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (₹)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="0.01" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={productForm.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                value={field.value || 0}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={productForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="material"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Material</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Gold, Silver, Diamond" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Featured Product</FormLabel>
                            <p className="text-sm text-muted-foreground">Display this product on homepage</p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          Product Images
                        </Label>
                        <Button type="button" variant="outline" size="sm" onClick={addImageField}>
                          <Plus className="h-4 w-4 mr-1" /> Add Image
                        </Button>
                      </div>
                      {imageUrls.map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            type="url"
                            placeholder="Enter image URL"
                            value={url}
                            onChange={(e) => updateImageUrl(index, e.target.value)}
                          />
                          {imageUrls.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeImageField(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {imageUrls.some(url => url.trim() !== "") && (
                        <div className="flex gap-2 flex-wrap mt-2">
                          {imageUrls.filter(url => url.trim() !== "").map((url, index) => (
                            <div key={index} className="w-16 h-16 rounded border overflow-hidden">
                              <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button type="submit" className="w-full hover-elevate active-elevate-2" disabled={updateProductMutation.isPending}>
                      {updateProductMutation.isPending ? "Updating..." : "Update Product"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Categories</h2>
              <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="hover-elevate active-elevate-2" data-testid="button-add-category">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Add New Category</DialogTitle>
                  </DialogHeader>
                  
                  {/* Quick Add Predefined Categories */}
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">Quick Add Jewellery Categories</Label>
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_CATEGORIES.filter(
                        pc => !categories.some(c => c.slug === pc.slug)
                      ).map((precat) => (
                        <Button
                          key={precat.slug}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            createCategoryMutation.mutate(precat);
                          }}
                          disabled={createCategoryMutation.isPending}
                        >
                          + {precat.name}
                        </Button>
                      ))}
                    </div>
                    {PREDEFINED_CATEGORIES.filter(pc => !categories.some(c => c.slug === pc.slug)).length === 0 && (
                      <p className="text-sm text-muted-foreground">All predefined categories have been added</p>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium mb-2 block">Or Create Custom Category</Label>
                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                      <div>
                        <Label>Category Name</Label>
                        <Input name="name" data-testid="input-category-name" required />
                      </div>
                      <div>
                        <Label>Slug</Label>
                        <Input name="slug" placeholder="e.g., my-category" data-testid="input-category-slug" required />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea name="description" rows={3} data-testid="input-category-description" />
                      </div>
                      <Button
                        type="submit"
                        className="w-full hover-elevate active-elevate-2"
                        disabled={createCategoryMutation.isPending}
                        data-testid="button-save-category"
                      >
                        {createCategoryMutation.isPending ? "Creating..." : "Save Category"}
                      </Button>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Dialog open={editCategoryDialogOpen} onOpenChange={setEditCategoryDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl">Edit Category</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  updateCategoryMutation.mutate({
                    id: editCategoryId!,
                    data: {
                      name: formData.get("name"),
                      slug: formData.get("slug"),
                      description: formData.get("description"),
                    },
                  });
                }} className="space-y-4">
                  <div>
                    <Label>Category Name</Label>
                    <Input
                      name="name"
                      defaultValue={categories.find(c => c.id === editCategoryId)?.name}
                      data-testid="input-edit-category-name"
                      required
                    />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input
                      name="slug"
                      defaultValue={categories.find(c => c.id === editCategoryId)?.slug}
                      data-testid="input-edit-category-slug"
                      required
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      name="description"
                      defaultValue={categories.find(c => c.id === editCategoryId)?.description || ""}
                      rows={3}
                      data-testid="input-edit-category-description"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full hover-elevate active-elevate-2"
                    disabled={updateCategoryMutation.isPending}
                    data-testid="button-update-category"
                  >
                    {updateCategoryMutation.isPending ? "Updating..." : "Update Category"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <div className="grid gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="hover-elevate" data-testid={`category-card-${category.id}`}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-semibold" data-testid={`text-category-name-${category.id}`}>{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover-elevate active-elevate-2"
                        onClick={() => {
                          setEditCategoryId(category.id);
                          setEditCategoryDialogOpen(true);
                        }}
                        data-testid={`button-edit-cat-${category.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover-elevate active-elevate-2"
                        onClick={() => deleteCategoryMutation.mutate(category.id)}
                        disabled={deleteCategoryMutation.isPending}
                        data-testid={`button-delete-cat-${category.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Orders</h2>
              <Button 
                variant="outline" 
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/orders"] })}
                className="hover-elevate"
              >
                Refresh Orders
              </Button>
            </div>
            <OrdersSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Orders Section Component
function OrdersSection() {
  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PUT", `/api/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No orders yet</p>
        <p className="text-sm text-muted-foreground">
          Orders will appear here when customers complete purchases.
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {orders.map((order: any) => (
        <Card key={order.id} className="hover-elevate">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Customer Details</h4>
                <p className="text-sm">{order.customerName}</p>
                <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                {order.shippingAddress && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>{order.shippingAddress.line1}</p>
                    {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Order Total</h4>
                <p className="text-2xl font-semibold text-primary">₹{order.total}</p>
                <div className="mt-4">
                  <Label className="text-sm">Update Status</Label>
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateOrderStatusMutation.mutate({ id: order.id, status: value })}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
