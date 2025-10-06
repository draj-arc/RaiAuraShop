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
import { Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
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
    createProductMutation.mutate(data);
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

  return (
    <div className="min-h-screen py-12 md:py-20 bg-accent/10">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-8">
          Admin Panel
        </h1>

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
                                <Input {...field} type="number" data-testid="input-product-stock" />
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
                              <Input {...field} data-testid="input-product-material" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div>
                        <Label>Image URL</Label>
                        <Input
                          type="url"
                          value={productForm.watch("images.0") || ""}
                          onChange={(e) => productForm.setValue("images.0", e.target.value)}
                          data-testid="input-product-image"
                        />
                      </div>
                      <Button type="submit" className="w-full hover-elevate active-elevate-2" data-testid="button-save-product">
                        Save Product
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
                      <h3 className="font-semibold" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.description.slice(0, 60)}...</p>
                      <p className="text-primary font-semibold mt-1" data-testid={`text-product-price-${product.id}`}>${product.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover-elevate active-elevate-2"
                        onClick={() => updateProductMutation.mutate({
                          id: product.id,
                          data: { featured: !product.featured }
                        })}
                        disabled={updateProductMutation.isPending}
                        data-testid={`button-edit-${product.id}`}
                        title={product.featured ? "Remove from featured" : "Add to featured"}
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
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Add New Category</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div>
                      <Label>Category Name</Label>
                      <Input name="name" data-testid="input-category-name" required />
                    </div>
                    <div>
                      <Label>Slug</Label>
                      <Input name="slug" data-testid="input-category-slug" required />
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
            <h2 className="text-2xl font-semibold mb-6">Orders</h2>
            <p className="text-muted-foreground text-center py-12">No orders yet</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
