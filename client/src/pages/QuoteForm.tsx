import { useState, useEffect } from "react";
import { useParams, useLocation, useSearch } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { ArrowLeft, Plus, Trash2, Calculator, Save, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const quoteFormSchema = z.object({
  type: z.enum(["sent", "received"], {
    required_error: "Teklif türü seçilmelidir",
  }),
  number: z.string(),
  accountId: z.string().refine(val => parseInt(val) > 0, {
    message: "Cari hesap seçilmelidir",
  }),
  subject: z.string().min(2, {
    message: "Teklif konusu en az 2 karakter olmalıdır",
  }),
  date: z.date(),
  validUntil: z.date().optional().nullable(),
  contactPerson: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "cancelled"]).default("pending"),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  currency: z.enum(["TRY", "USD", "EUR"], {
    required_error: "Para birimi seçilmelidir",
  }),
  totalAmount: z.number().min(0),
  items: z.array(
    z.object({
      description: z.string().min(1, { message: "Açıklama girilmelidir" }),
      quantity: z.number().min(0.01, { message: "Miktar 0'dan büyük olmalıdır" }),
      unit: z.string().min(1, { message: "Birim seçilmelidir" }),
      unitPrice: z.number().min(0, { message: "Birim fiyat 0 veya daha büyük olmalıdır" }),
      discount: z.number().min(0).optional(),
      taxRate: z.number().min(0).max(100).optional(),
      lineTotal: z.number().min(0),
    })
  ).min(1, { message: "En az bir kalem eklenmelidir" }),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

const units = [
  { value: "adet", label: "Adet" },
  { value: "cilt", label: "Cilt" },
  { value: "koçan", label: "Koçan" },
  { value: "paket", label: "Paket" },
  { value: "koli", label: "Koli" },
  { value: "ton", label: "Ton" },
  { value: "kg", label: "Kg" },
  { value: "g", label: "g" },
  { value: "lt", label: "Lt" },
  { value: "ml", label: "ml" },
  { value: "metre", label: "Metre" }
];

export default function QuoteForm() {
  const { id } = useParams();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const accountIdFromUrl = searchParams.get("account");
  
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isEditing = Boolean(id);
  
  const { data: quote, isLoading: isLoadingQuote } = useQuery({
    queryKey: [`/api/quotes/${id}`],
    enabled: isEditing,
  });
  
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["/api/accounts"],
  });

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      type: "sent",
      number: "",
      accountId: accountIdFromUrl || "",
      subject: "",
      date: new Date(),
      validUntil: null,
      contactPerson: "",
      status: "pending",
      paymentTerms: "",
      notes: "",
      currency: "TRY",
      totalAmount: 0,
      items: [
        {
          description: "",
          quantity: 1,
          unit: "adet",
          unitPrice: 0,
          discount: 0,
          taxRate: 18,
          lineTotal: 0,
        },
      ],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Load quote data when editing
  useEffect(() => {
    if (isEditing && quote) {
      form.reset({
        type: quote.type,
        number: quote.number,
        accountId: String(quote.accountId),
        subject: quote.subject,
        date: new Date(quote.date),
        validUntil: quote.validUntil ? new Date(quote.validUntil) : null,
        contactPerson: quote.contactPerson || "",
        status: quote.status,
        paymentTerms: quote.paymentTerms || "",
        notes: quote.notes || "",
        currency: quote.currency,
        totalAmount: Number(quote.totalAmount),
        items: quote.items?.map((item: any) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unit: item.unit,
          unitPrice: Number(item.unitPrice),
          discount: Number(item.discount || 0),
          taxRate: Number(item.taxRate || 0),
          lineTotal: Number(item.lineTotal),
        })) || [
          {
            description: "",
            quantity: 1,
            unit: "adet",
            unitPrice: 0,
            discount: 0,
            taxRate: 18,
            lineTotal: 0,
          },
        ],
      });
    }
  }, [quote, form, isEditing]);

  // Load account ID from URL if present
  useEffect(() => {
    if (!isEditing && accountIdFromUrl) {
      form.setValue("accountId", accountIdFromUrl);
    }
  }, [form, accountIdFromUrl, isEditing]);

  const createMutation = useMutation({
    mutationFn: async (data: QuoteFormValues) => {
      const response = await apiRequest("POST", "/api/quotes", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Teklif oluşturuldu",
        description: "Yeni teklif başarıyla oluşturuldu.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      navigate("/quotes");
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Teklif oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: QuoteFormValues) => {
      const response = await apiRequest("PUT", `/api/quotes/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Teklif güncellendi",
        description: "Teklif başarıyla güncellendi.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/quotes/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      navigate(`/quotes/${id}`);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Teklif güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const calculateLineTotal = (index: number) => {
    const values = form.getValues();
    const item = values.items[index];
    if (!item) return;
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const discount = Number(item.discount) || 0;
    const taxRate = Number(item.taxRate) || 0;
    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discount / 100);
    const netAmount = subtotal - discountAmount;
    const taxAmount = netAmount * (taxRate / 100);
    const lineTotal = netAmount + taxAmount;
    form.setValue(`items.${index}.lineTotal`, lineTotal);
    calculateTotal();
  };

  const calculateTotal = () => {
    const values = form.getValues();
    const total = values.items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0);
    form.setValue("totalAmount", total);
  };

  function onSubmit(data: QuoteFormValues) {
    data.items.forEach((_, index) => {
      calculateLineTotal(index);
    });
    calculateTotal();
    const updatedData = form.getValues();
    if (isEditing) {
      updateMutation.mutate(updatedData);
    } else {
      createMutation.mutate(updatedData);
    }
  }

  if ((isEditing && isLoadingQuote) || isLoadingAccounts) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Veriler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          className="mr-2" 
          onClick={() => navigate(isEditing ? `/quotes/${id}` : "/quotes")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Geri</span>
        </Button>
        <h2 className="text-2xl font-semibold">
          {isEditing ? "Teklif Düzenle" : "Yeni Teklif"}
        </h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center">
              <span>Teklif Bilgileri</span>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Teklif türü seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sent">Verilen Teklif</SelectItem>
                        <SelectItem value="received">Alınan Teklif</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="accountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cari Hesap</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Cari hesap seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts?.map((account: any) => (
                            <SelectItem key={account.id} value={String(account.id)}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teklif Konusu</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Teklif konusunu girin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tarih</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                            >
                              {field.value ? (
                                format(field.value, "d MMMM yyyy", { locale: tr })
                              ) : (
                                <span>Tarih seçin</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Geçerlilik Tarihi</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                            >
                              {field.value ? (
                                format(field.value, "d MMMM yyyy", { locale: tr })
                              ) : (
                                <span>Tarih seçin (opsiyonel)</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yetkili Kişi</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Yetkili kişinin adı" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ödeme Şekli</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ödeme koşulları" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Para Birimi</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Para birimi seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TRY">TL (₺)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EURO (€)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <CardHeader className="px-0 pt-6">
                <CardTitle className="flex justify-between items-center">
                  <span>Kalemler</span>
                  <Button 
                    type="button" 
                    onClick={() => append({
                      description: "",
                      quantity: 1,
                      unit: "adet",
                      unitPrice: 0,
                      discount: 0,
                      taxRate: 18,
                      lineTotal: 0,
                    })}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Kalem Ekle
                  </Button>
                </CardTitle>
              </CardHeader>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Kalem {index + 1}</h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Açıklama</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Ürün/Hizmet adı veya açıklaması" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex space-x-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Miktar</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    placeholder="Miktar" 
                                    onChange={(e) => {
                                      field.onChange(parseFloat(e.target.value) || 0);
                                      calculateLineTotal(index);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${index}.unit`}
                            render={({ field }) => (
                              <FormItem className="w-1/3">
                                <FormLabel>Birim</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Birim" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {units.map((unit) => (
                                      <SelectItem key={unit.value} value={unit.value}>
                                        {unit.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Birim Fiyat</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  placeholder="Birim fiyat" 
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value) || 0);
                                    calculateLineTotal(index);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex space-x-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.discount`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>İskonto (%)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    placeholder="İskonto %" 
                                    onChange={(e) => {
                                      field.onChange(parseFloat(e.target.value) || 0);
                                      calculateLineTotal(index);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${index}.taxRate`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>KDV (%)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    placeholder="KDV %" 
                                    onChange={(e) => {
                                      field.onChange(parseFloat(e.target.value) || 0);
                                      calculateLineTotal(index);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`items.${index}.lineTotal`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Toplam Tutar</FormLabel>
                              <div className="flex">
                                <Input 
                                  type="number" 
                                  {...field} 
                                  placeholder="Toplam" 
                                  readOnly 
                                  className="bg-muted"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="ml-2"
                                  onClick={() => calculateLineTotal(index)}
                                >
                                  <Calculator className="h-4 w-4" />
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-end">
                <Card className="w-full md:w-1/3">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Toplam:</span>
                        <FormField
                          control={form.control}
                          name="totalAmount"
                          render={({ field }) => (
                            <div className="flex items-center">
                              <span className="font-bold text-lg">
                                {formatCurrency(field.value, form.getValues().currency as any)}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="ml-2"
                                onClick={calculateTotal}
                              >
                                <Calculator className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notlar</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Teklif ile ilgili notlarınız"
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
                  onClick={() => navigate(isEditing ? `/quotes/${id}` : "/quotes")}
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
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditing ? "Güncelle" : "Oluştur"}
                    </>
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