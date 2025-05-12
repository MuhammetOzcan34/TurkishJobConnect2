import { useState, useEffect } from "react";
import { useParams, useLocation, useSearch } from "wouter";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Save, Loader2, Calendar, CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const projectFormSchema = z.object({
  accountId: z.string().refine((val) => parseInt(val) > 0, {
    message: "Cari hesap seçilmelidir",
  }),
  name: z.string().min(2, {
    message: "Proje adı en az 2 karakter olmalıdır",
  }),
  quoteId: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional().nullable(),
  status: z.enum(["active", "completed", "cancelled", "on_hold"], {
    required_error: "Proje durumu seçilmelidir",
  }),
  description: z.string().optional(),
  amount: z.number().optional(),
  currency: z.enum(["TRY", "USD", "EUR"], {
    required_error: "Para birimi seçilmelidir",
  }),
  notes: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function ProjectForm() {
  const { id } = useParams();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const accountIdFromUrl = searchParams.get("account");
  const quoteIdFromUrl = searchParams.get("quote");

  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEditing = Boolean(id);

  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: [`/api/projects/${id}`],
    enabled: isEditing,
  });

  const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["/api/accounts"],
  });

  const { data: quotes, isLoading: isLoadingQuotes } = useQuery({
    queryKey: ["/api/quotes"],
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      accountId: accountIdFromUrl || "",
      name: "",
      quoteId: quoteIdFromUrl || "",
      startDate: new Date(),
      endDate: null,
      status: "active",
      description: "",
      amount: undefined,
      currency: "TRY",
      notes: "",
    },
  });

  // Effect for when editing existing project
  useEffect(() => {
    if (isEditing && project) {
      form.reset({
        accountId: String(project.accountId),
        name: project.name,
        quoteId: project.quoteId ? String(project.quoteId) : "",
        startDate: new Date(project.startDate),
        endDate: project.endDate ? new Date(project.endDate) : null,
        status: project.status,
        description: project.description || "",
        amount: project.amount || undefined,
        currency: project.currency || "TRY",
        notes: project.notes || "",
      });
    }
  }, [project, form, isEditing]);

  // Effect for when creating from a quote
  useEffect(() => {
    if (!isEditing && (accountIdFromUrl || quoteIdFromUrl)) {
      // If we have a quote ID, try to find the quote to pre-fill data
      if (quoteIdFromUrl && quotes) {
        const selectedQuote = quotes.find(
          (q: any) => String(q.id) === quoteIdFromUrl,
        );
        if (selectedQuote) {
          form.setValue("accountId", String(selectedQuote.accountId));
          form.setValue("name", selectedQuote.subject);
          form.setValue("amount", Number(selectedQuote.totalAmount));
          form.setValue("currency", selectedQuote.currency);
        }
      } else if (accountIdFromUrl) {
        form.setValue("accountId", accountIdFromUrl);
      }
    }
  }, [form, accountIdFromUrl, quoteIdFromUrl, quotes, isEditing]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Proje oluşturuldu",
        description: "Yeni proje başarıyla oluşturuldu.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      navigate("/projects");
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Proje oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      const response = await apiRequest("PUT", `/api/projects/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Proje güncellendi",
        description: "Proje bilgileri başarıyla güncellendi.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      navigate(`/projects/${id}`);
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Proje güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Submit handler
  function onSubmit(data: ProjectFormValues) {
    // Format the data properly
    const submissionData = {
      ...data,
      accountId: parseInt(data.accountId),
      quoteId: data.quoteId ? parseInt(data.quoteId) : undefined,
      amount: data.amount || 0,
    };

    if (isEditing) {
      updateMutation.mutate(submissionData as any);
    } else {
      createMutation.mutate(submissionData as any);
    }
  }

  // Filter quotes by selected account
  const selectedAccountId = form.watch("accountId");
  const filteredQuotes = quotes?.filter(
    (quote: any) =>
      String(quote.accountId) === selectedAccountId &&
      quote.status === "approved",
  );

  if ((isEditing && isLoadingProject) || isLoadingAccounts || isLoadingQuotes) {
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
          onClick={() => navigate(isEditing ? `/projects/${id}` : "/projects")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Geri</span>
        </Button>
        <h2 className="text-2xl font-semibold">
          {isEditing ? "Proje Düzenle" : "Yeni Proje"}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proje Bilgileri</CardTitle>
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
                      <FormLabel>Firma</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Clear quote selection when account changes
                          form.setValue("quoteId", "");
                        }}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Firma seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts?.map((account: any) => (
                            <SelectItem
                              key={account.id}
                              value={String(account.id)}
                            >
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proje Adı</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Proje adını girin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quoteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İlgili Teklif</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={
                          !selectedAccountId || filteredQuotes?.length === 0
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                !selectedAccountId
                                  ? "Önce firma seçin"
                                  : filteredQuotes?.length === 0
                                    ? "Onaylı teklif yok"
                                    : "Teklif seçin (opsiyonel)"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredQuotes?.map((quote: any) => (
                            <SelectItem key={quote.id} value={String(quote.id)}>
                              {quote.number} - {quote.subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Sadece onaylanmış teklifler seçilebilir.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durum</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Durum seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="completed">Tamamlandı</SelectItem>
                          <SelectItem value="cancelled">İptal</SelectItem>
                          <SelectItem value="on_hold">Beklemede</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Başlangıç Tarihi</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                            >
                              {field.value ? (
                                format(field.value, "d MMMM yyyy", {
                                  locale: tr,
                                })
                              ) : (
                                <span>Tarih seçin</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
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
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Bitiş Tarihi</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                            >
                              {field.value ? (
                                format(field.value, "d MMMM yyyy", {
                                  locale: tr,
                                })
                              ) : (
                                <span>Tarih seçin (opsiyonel)</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) => {
                              // Disable dates before start date
                              const startDate = form.getValues().startDate;
                              return startDate ? date < startDate : false;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-2">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Tutar</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            placeholder="Proje tutarı"
                            value={field.value === undefined ? "" : field.value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem className="w-1/3">
                        <FormLabel>Para Birimi</FormLabel>
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

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Açıklama</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Proje açıklaması"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Notlar</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Proje ile ilgili notlar"
                          rows={3}
                        />
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
                  onClick={() =>
                    navigate(isEditing ? `/projects/${id}` : "/projects")
                  }
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending ? (
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
