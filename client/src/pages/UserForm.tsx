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

// Kullanıcı formu için Zod şeması
const userFormSchema = z.object({
  username: z.string().min(3, {
    message: "Kullanıcı adı en az 3 karakter olmalıdır", // Kullanıcıya gösterilen mesaj
  }),
  password: z.string().min(6, {
    message: "Şifre en az 6 karakter olmalıdır", // Kullanıcıya gösterilen mesaj
  }),
  name: z.string().min(2, {
    message: "Ad Soyad en az 2 karakter olmalıdır", // Kullanıcıya gösterilen mesaj
  }),
  email: z.string().email({
    message: "Geçerli bir e-posta adresi giriniz", // Kullanıcıya gösterilen mesaj
  }),
  phone: z.string().optional(),
  position: z.string().optional(),
});

// Şemadan TypeScript tipi oluşturma
type UserFormValues = z.infer<typeof userFormSchema>;

export default function UserForm() {
  const [, navigate] = useLocation(); // Rota değiştirmek için wouter hook'u
  const { toast } = useToast(); // Bildirim göstermek için custom hook
  const queryClient = useQueryClient(); // React Query client

  // Form hook'unu başlatma
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema), // Zod ile validasyon
    defaultValues: { // Varsayılan form değerleri
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
      position: "",
    },
  });

  // Kullanıcı oluşturma mutasyonu
  const createMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      // API'ye POST isteği gönderme
      const response = await apiRequest("POST", "/api/users", data);
      
      // Yanıt başarılı değilse hata fırlatma
      if (!response.ok) {
        // Sunucudan gelen hata mesajını yakalamaya çalışma
        const errorData = await response.json().catch(() => ({ message: "Bilinmeyen sunucu hatası" }));
        throw new Error(errorData.message || "Kullanıcı oluşturulamadı"); // Kullanıcıya gösterilecek hata mesajı
      }
      
      // Başarılı yanıtı JSON olarak döndürme
      return response.json();
    },
    onSuccess: () => {
      // Başarılı olursa bildirim gösterme ve rotayı değiştirme
      toast({
        title: "Kullanıcı Oluşturuldu", // Kullanıcıya gösterilen başlık
        description: "Yeni kullanıcı başarıyla eklendi.", // Kullanıcıya gösterilen açıklama
      });
      // Kullanıcı listesi sorgusunu geçersiz kılma (yeniden çekilmesini sağlama)
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      navigate("/users"); // Kullanıcı listesi sayfasına yönlendirme
    },
    onError: (error: Error) => {
      // Hata olursa bildirim gösterme
      toast({
        title: "Hata", // Kullanıcıya gösterilen başlık
        description: error.message || "Kullanıcı oluşturulurken bir hata oluştu.", // Kullanıcıya gösterilen açıklama
        variant: "destructive", // Hata bildirimi stili
      });
    },
  });

  // Form gönderildiğinde çalışacak fonksiyon
  function onSubmit(data: UserFormValues) {
    createMutation.mutate(data); // Mutasyonu tetikleme
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center mb-4">
        {/* Geri butonu */}
        <Button
          variant="ghost"
          className="mr-2"
          onClick={() => navigate("/users")}
          disabled={createMutation.isPending} // Also disable back button during mutation
        >
          <span className="inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Geri</span> {/* Kullanıcıya gösterilen metin */}
          </span>
        </Button>
        <h2 className="text-2xl font-semibold">Yeni Kullanıcı</h2> {/* Kullanıcıya gösterilen başlık */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Bilgileri</CardTitle> {/* Kullanıcıya gösterilen başlık */}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kullanıcı Adı alanı */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kullanıcı Adı</FormLabel> {/* Kullanıcıya gösterilen etiket */}
                      <FormControl>
                        <Input {...field} placeholder="Kullanıcı adını girin" /> {/* Kullanıcıya gösterilen placeholder */}
                      </FormControl>
                      <FormMessage /> {/* Validasyon hata mesajı */}
                    </FormItem>
                  )}
                />

                {/* Şifre alanı */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şifre</FormLabel> {/* Kullanıcıya gösterilen etiket */}
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Şifre girin" // Kullanıcıya gösterilen placeholder
                          autoComplete="new-password" // Tarayıcı autocomplete önerisi
                        />
                      </FormControl>
                      <FormMessage /> {/* Validasyon hata mesajı */}
                    </FormItem>
                  )}
                />

                {/* Ad Soyad alanı */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Soyad</FormLabel> {/* Kullanıcıya gösterilen etiket */}
                      <FormControl>
                        <Input {...field} placeholder="Ad ve soyadı girin" /> {/* Kullanıcıya gösterilen placeholder */}
                      </FormControl>
                      <FormMessage /> {/* Validasyon hata mesajı */}
                    </FormItem>
                  )}
                />

                {/* E-posta alanı */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta</FormLabel> {/* Kullanıcıya gösterilen etiket */}
                      <FormControl>
                        <Input {...field} type="email" placeholder="E-posta adresini girin" /> {/* Kullanıcıya gösterilen placeholder */}
                      </FormControl>
                      <FormMessage /> {/* Validasyon hata mesajı */}
                    </FormItem>
                  )}
                />

                {/* Telefon alanı */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon (İsteğe Bağlı)</FormLabel> {/* Kullanıcıya gösterilen etiket */}
                      <FormControl>
                        <Input {...field} placeholder="Telefon numarası" /> {/* Kullanıcıya gösterilen placeholder */}
                      </FormControl>
                      <FormMessage /> {/* Validasyon hata mesajı */}
                    </FormItem>
                  )}
                />

                {/* Pozisyon alanı */}
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pozisyon (İsteğe Bağlı)</FormLabel> {/* Kullanıcıya gösterilen etiket */}
                      <FormControl>
                        <Input {...field} placeholder="Pozisyon bilgisi" /> {/* Kullanıcıya gösterilen placeholder */}
                      </FormControl>
                      <FormMessage /> {/* Validasyon hata mesajı */}
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2">
                {/* İptal butonu */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/users")}
                  disabled={createMutation.isPending} // İşlem devam ederken pasif yap
                >
                  İptal {/* Kullanıcıya gösterilen metin */}
                </Button>
                {/* Oluştur butonu */}
                <Button
                  type="submit"
                  disabled={createMutation.isPending} // İşlem devam ederken pasif yap
                >
                  {createMutation.isPending ? ( // İşlem devam ediyorsa yüklenme göstergesi
                    <span className="inline-flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Oluşturuluyor... {/* Kullanıcıya gösterilen metin */}
                    </span>
                  ) : (
                    <span>Oluştur</span> // Kullanıcıya gösterilen metin
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
