import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Loader2 } from "lucide-react";

const userFormSchema = z.object({
  username: z.string().min(3, {
    message: "Kullanıcı adı en az 3 karakter olmalıdır",
  }),
  password: z.string().min(6, {
    message: "Şifre en az 6 karakter olmalıdır",
  }),
  name: z.string().min(2, {
    message: "Ad Soyad en az 2 karakter olmalıdır",
  }),
  email: z.string().email({
    message: "Geçerli bir e-posta adresi giriniz",
  }),
  phone: z.string().optional(),
  position: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UserForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
      position: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const response = await apiRequest("POST", "/api/users", data);
      // Sunucudan gelen yanıtın JSON formatında olduğundan emin olun
      if (!response.ok) {
        // Hata durumunda, sunucudan gelen mesajı yakalamaya çalışın
        const errorData = await response.json().catch(() => ({ message: "Bilinmeyen sunucu hatası" }));
        throw new Error(errorData.message || "Kullanıcı oluşturulamadı");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Kullanıcı Oluşturuldu",
        description: "Yeni kullanıcı başarıyla eklendi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      navigate("/users");
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Kullanıcı oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: UserFormValues) {
    createMutation.mutate(data);
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          className="mr-2"
          onClick={() => navigate("/users")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Geri</span>
        </Button>
        <h2 className="text-2xl font-semibold">Yeni Kullanıcı</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kullanıcı Adı</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Kullanıcı adını girin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şifre</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Şifre girin"
                          autoComplete="new-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Soyad</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ad ve soyadı girin" />
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
                        <Input {...field} type="email" placeholder="E-posta adresini girin" />
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
                      <FormLabel>Telefon (İsteğe Bağlı)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Telefon numarası" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pozisyon (İsteğe Bağlı)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Pozisyon bilgisi" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/users")}
                  disabled={createMutation.isPending}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    "Oluştur"
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
