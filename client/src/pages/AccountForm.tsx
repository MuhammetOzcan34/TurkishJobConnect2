import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Loader2 } from "lucide-react";

const accountFormSchema = z.object({
  name: z.string().min(2, {
    message: "Firma adı en az 2 karakter olmalıdır",
  }),
  type: z.enum(["customer", "vendor"], {
    required_error: "Firma türü seçilmelidir",
  }),
  branch: z.string().optional(),
  contact: z.string().optional(),
  contactTitle: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email({ message: "Geçerli bir e-posta adresi girin" }).optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email({ message: "Geçerli bir e-posta adresi girin" }).optional().or(z.literal("")),
  address: z.string().optional(),
  taxId: z.string().optional(),
  taxOffice: z.string().optional(),
  notes: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export default function AccountForm() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isEditing = Boolean(id);
  
  const { data: account, isLoading } = useQuery({
    queryKey: [`/api/accounts/${id}`],
    enabled: isEditing,
  });
  
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      type: "customer",
      branch: "",
      contact: "",
      contactTitle: "",
      contactPhone: "",
      contactEmail: "",
      phone: "",
      email: "",
      address: "",
      taxId: "",
      taxOffice: "",
      notes: "",
    },
  });
  
  useEffect(() => {
    if (isEditing && account) {
      form.reset({
        name: account.name,
        type: account.type,
        branch: account.branch || "",
        contact: account.contact || "",
        contactTitle: account.contactTitle || "",
        contactPhone: account.contactPhone || "",
        contactEmail: account.contactEmail || "",
        phone: account.phone || "",
        email: account.email || "",
        address: account.address || "",
        taxId: account.taxId || "",
        taxOffice: account.taxOffice || "",
        notes: account.notes || "",
      });
    }
  }, [account, form, isEditing]);
  
  const createMutation = useMutation({
    mutationFn: async (data: AccountFormValues) => {
      const response = await apiRequest("POST", "/api/accounts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cari hesap oluşturuldu",
        description: "Yeni cari hesap başarıyla oluşturuldu.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      navigate("/accounts");
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Cari hesap oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: async (data: AccountFormValues) => {
      const response = await apiRequest("PUT", `/api/accounts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cari hesap güncellendi",
        description: "Cari hesap bilgileri başarıyla güncellendi.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/accounts/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      navigate(`/accounts/${id}`);
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Cari hesap güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: AccountFormValues) {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }
  
  if (isEditing && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Cari hesap bilgileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          className="mr-2" 
          onClick={() => navigate(isEditing ? `/accounts/${id}` : "/accounts")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Geri</span>
        </Button>
        <h2 className="text-2xl font-semibold">
          {isEditing ? "Cari Hesap Düzenle" : "Yeni Cari Hesap"}
        </h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Firma Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Firma Adı</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Firma adını girin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Firma Türü</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Firma türü seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="customer">Alıcı</SelectItem>
                          <SelectItem value="vendor">Satıcı</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şube/Bölge</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Şube veya bölge bilgisi" />
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
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Firma telefon numarası" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Firma e-posta adresi" type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adres</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Firma adresi" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vergi/TC Kimlik No</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Vergi veya TC kimlik numarası" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="taxOffice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vergi Dairesi</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Vergi dairesi adı" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <CardHeader className="px-0 pt-6">
                <CardTitle>Yetkili Kişi Bilgileri</CardTitle>
              </CardHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yetkili Adı</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Yetkili kişinin adı" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Görevi</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Yetkili kişinin görevi" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefonu</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Yetkili kişinin telefonu" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Yetkili kişinin e-postası" type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <CardHeader className="px-0 pt-6">
                <CardTitle>Ek Bilgiler</CardTitle>
              </CardHeader>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notlar</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Bu cari hesap ile ilgili eklemek istediğiniz notlar" 
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(isEditing ? `/accounts/${id}` : "/accounts")}
                >
                  İptal
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Güncelleniyor..." : "Oluşturuluyor..."}
                    </>
                  ) : (
                    isEditing ? "Güncelle" : "Oluştur"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
