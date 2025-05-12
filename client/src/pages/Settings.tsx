import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Save, Upload } from "lucide-react";

// Profile Form Schema
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "İsim en az 2 karakter olmalıdır",
  }),
  email: z.string().email({
    message: "Geçerli bir e-posta adresi giriniz",
  }),
  phone: z.string().optional(),
  position: z.string().optional(),
  companyName: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Company Form Schema
const companyFormSchema = z.object({
  companyName: z.string().min(2, {
    message: "Şirket adı en az 2 karakter olmalıdır",
  }),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({
    message: "Geçerli bir e-posta adresi giriniz",
  }).optional(),
  taxId: z.string().optional(),
  taxOffice: z.string().optional(),
  website: z.string().optional(),
  logo: z.any().optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

// Notification Settings Schema
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  quoteAlerts: z.boolean().default(true),
  taskReminders: z.boolean().default(true),
  projectStatusUpdates: z.boolean().default(true),
  financialAlerts: z.boolean().default(true),
});

type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Get profile data
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["/api/profile"],
  });
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      position: "",
      companyName: "",
    },
  });
  
  // Set profile form values when data is loaded
  useState(() => {
    if (profileData) {
      profileForm.reset({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone || "",
        position: profileData.position || "",
        companyName: profileData.companyName || "",
      });
    }
  });
  
  // Company form
  const companyForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyName: "",
      address: "",
      phone: "",
      email: "",
      taxId: "",
      taxOffice: "",
      website: "",
    },
  });
  
  // Notification settings form
  const notificationForm = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      quoteAlerts: true,
      taskReminders: true,
      projectStatusUpdates: true,
      financialAlerts: true,
    },
  });
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await apiRequest("PUT", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profil güncellendi",
        description: "Profil bilgileriniz başarıyla güncellendi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  
  // Company update mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: CompanyFormValues) => {
      const response = await apiRequest("PUT", "/api/company", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Şirket bilgileri güncellendi",
        description: "Şirket bilgileri başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Şirket bilgileri güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  
  // Notification settings update mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: NotificationSettingsValues) => {
      const response = await apiRequest("PUT", "/api/notifications/settings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bildirim ayarları güncellendi",
        description: "Bildirim ayarlarınız başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Bildirim ayarları güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handlers
  function onProfileSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
  }
  
  function onCompanySubmit(data: CompanyFormValues) {
    updateCompanyMutation.mutate(data);
  }
  
  function onNotificationSubmit(data: NotificationSettingsValues) {
    updateNotificationsMutation.mutate(data);
  }
  
  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Ayarlar</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="company">Şirket Bilgileri</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="security">Güvenlik</TabsTrigger>
        </TabsList>
        
        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
              <CardDescription>
                Kişisel bilgilerinizi güncelleyebilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad Soyad</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-posta</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pozisyon</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Şirket Adı</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Kaydet
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Company Settings */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Şirket Bilgileri</CardTitle>
              <CardDescription>
                Şirketinize ait bilgileri güncelleyebilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...companyForm}>
                <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={companyForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Şirket Adı</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={companyForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-posta</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={companyForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={companyForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Web Sitesi</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={companyForm.control}
                      name="taxId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vergi No</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={companyForm.control}
                      name="taxOffice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vergi Dairesi</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={companyForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adres</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={companyForm.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo</FormLabel>
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded border flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
                            {field.value ? (
                              <img 
                                src={field.value} 
                                alt="Company Logo" 
                                className="max-h-14 max-w-14 object-contain" 
                              />
                            ) : (
                              <span className="text-xs text-neutral-500">Logo Yok</span>
                            )}
                          </div>
                          <Button type="button" variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Logo Yükle
                          </Button>
                        </div>
                        <FormDescription>
                          PNG, JPG veya SVG formatında 1MB'dan küçük bir logo yükleyin.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateCompanyMutation.isPending}
                    >
                      {updateCompanyMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Kaydet
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Ayarları</CardTitle>
              <CardDescription>
                Bildirim tercihlerinizi buradan yönetebilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div>
                            <FormLabel>E-posta Bildirimleri</FormLabel>
                            <FormDescription>
                              Önemli bildirimler e-posta adresinize gönderilecektir.
                            </FormDescription>
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
                    
                    <FormField
                      control={notificationForm.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div>
                            <FormLabel>Anlık Bildirimler</FormLabel>
                            <FormDescription>
                              Tarayıcı ve mobil anlık bildirimler alın.
                            </FormDescription>
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
                    
                    <FormField
                      control={notificationForm.control}
                      name="quoteAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div>
                            <FormLabel>Teklif Uyarıları</FormLabel>
                            <FormDescription>
                              Teklif durumu değişikliklerinde bildirim alın.
                            </FormDescription>
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
                    
                    <FormField
                      control={notificationForm.control}
                      name="taskReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div>
                            <FormLabel>Görev Hatırlatıcıları</FormLabel>
                            <FormDescription>
                              Görev bitiş tarihi yaklaştığında hatırlatıcı alın.
                            </FormDescription>
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
                    
                    <FormField
                      control={notificationForm.control}
                      name="projectStatusUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div>
                            <FormLabel>Proje Durum Güncellemeleri</FormLabel>
                            <FormDescription>
                              Proje durumu değiştiğinde bildirim alın.
                            </FormDescription>
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
                    
                    <FormField
                      control={notificationForm.control}
                      name="financialAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div>
                            <FormLabel>Finansal Uyarılar</FormLabel>
                            <FormDescription>
                              Finansal işlemler hakkında bildirim alın.
                            </FormDescription>
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
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateNotificationsMutation.isPending}
                    >
                      {updateNotificationsMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Kaydet
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Güvenlik Ayarları</CardTitle>
              <CardDescription>
                Hesap güvenliği ve erişim ayarlarını buradan yönetebilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Şifre Değiştir</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Mevcut Şifre</label>
                      <Input type="password" />
                    </div>
                    <div></div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Yeni Şifre</label>
                      <Input type="password" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Yeni Şifre (Tekrar)</label>
                      <Input type="password" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">İki Faktörlü Doğrulama</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        İki faktörlü doğrulama ile hesabınızı daha güvenli hale getirin.
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Oturum Açma Geçmişi</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Son oturum açma aktiviteleriniz
                  </p>
                  <div className="border rounded-md divide-y">
                    <div className="flex justify-between p-3">
                      <div>
                        <p className="font-medium">Chrome / Windows</p>
                        <p className="text-xs text-muted-foreground">İstanbul, Türkiye</p>
                      </div>
                      <div className="text-sm text-right">
                        <p>Bugün, 15:42</p>
                        <p className="text-xs text-green-600">Aktif</p>
                      </div>
                    </div>
                    <div className="flex justify-between p-3">
                      <div>
                        <p className="font-medium">Safari / macOS</p>
                        <p className="text-xs text-muted-foreground">İstanbul, Türkiye</p>
                      </div>
                      <div className="text-sm text-right">
                        <p>Dün, 10:23</p>
                      </div>
                    </div>
                    <div className="flex justify-between p-3">
                      <div>
                        <p className="font-medium">Mobile App / iOS</p>
                        <p className="text-xs text-muted-foreground">Ankara, Türkiye</p>
                      </div>
                      <div className="text-sm text-right">
                        <p>23 Nisan, 08:15</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}