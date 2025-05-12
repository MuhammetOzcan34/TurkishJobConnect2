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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  CalendarIcon
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const taskFormSchema = z.object({
  title: z.string().min(2, {
    message: "Görev başlığı en az 2 karakter olmalıdır",
  }),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Öncelik seçilmelidir",
  }),
  status: z.enum(["todo", "in-progress", "completed"], {
    required_error: "Durum seçilmelidir",
  }),
  dueDate: z.date().optional().nullable(),
  accountId: z.string().optional(),
  projectId: z.string().optional(),
  assigneeId: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function TaskForm() {
  const { id } = useParams();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const accountIdFromUrl = searchParams.get("account");
  const projectIdFromUrl = searchParams.get("project");
  
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isEditing = Boolean(id);
  
  const { data: task, isLoading: isLoadingTask } = useQuery({
    queryKey: [`/api/tasks/${id}`],
    enabled: isEditing,
  });
  
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["/api/accounts"],
  });
  
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["/api/projects"],
  });
  
  // Filter projects by selected account
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accountIdFromUrl || "");
  const filteredProjects = projects?.filter((project: any) => 
    !selectedAccountId || String(project.accountId) === selectedAccountId
  );
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      dueDate: null,
      accountId: accountIdFromUrl || "",
      projectId: projectIdFromUrl || "",
      assigneeId: "",
    },
  });
  
  // Update filtered projects when account selection changes
  useEffect(() => {
    setSelectedAccountId(form.watch("accountId") || "");
  }, [form.watch("accountId")]);
  
  // Effect for when editing existing task
  useEffect(() => {
    if (isEditing && task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        accountId: task.accountId ? String(task.accountId) : "",
        projectId: task.projectId ? String(task.projectId) : "",
        assigneeId: task.assigneeId ? String(task.assigneeId) : "",
      });
      if (task.accountId) {
        setSelectedAccountId(String(task.accountId));
      }
    }
  }, [task, form, isEditing]);
  
  // Effect for when creating from a project or account
  useEffect(() => {
    if (!isEditing) {
      if (projectIdFromUrl && projects) {
        const selectedProject = projects.find((p: any) => String(p.id) === projectIdFromUrl);
        if (selectedProject) {
          form.setValue("accountId", String(selectedProject.accountId));
          setSelectedAccountId(String(selectedProject.accountId));
        }
      } else if (accountIdFromUrl) {
        form.setValue("accountId", accountIdFromUrl);
        setSelectedAccountId(accountIdFromUrl);
      }
    }
  }, [form, accountIdFromUrl, projectIdFromUrl, projects, isEditing]);
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const response = await apiRequest("POST", "/api/tasks", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Görev oluşturuldu",
        description: "Yeni görev başarıyla oluşturuldu.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      
      // Also invalidate project tasks if project was selected
      if (form.getValues().projectId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${form.getValues().projectId}`] 
        });
      }
      
      navigate(form.getValues().projectId 
        ? `/projects/${form.getValues().projectId}` 
        : "/tasks");
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Görev oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const response = await apiRequest("PUT", `/api/tasks/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Görev güncellendi",
        description: "Görev bilgileri başarıyla güncellendi.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      
      // Also invalidate project tasks if project was selected
      if (form.getValues().projectId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${form.getValues().projectId}`] 
        });
      }
      
      navigate(form.getValues().projectId 
        ? `/projects/${form.getValues().projectId}` 
        : "/tasks");
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Görev güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  
  // Submit handler
  function onSubmit(data: TaskFormValues) {
    // Format the data properly
    const submissionData = {
      ...data,
      accountId: (data.accountId && data.accountId !== "_none") ? parseInt(data.accountId) : undefined,
      projectId: (data.projectId && data.projectId !== "_none") ? parseInt(data.projectId) : undefined,
      assigneeId: (data.assigneeId && data.assigneeId !== "_none") ? parseInt(data.assigneeId) : undefined, // Eğer assigneeId için de _none kullanılıyorsa
    };
    
    if (isEditing) {
      updateMutation.mutate(submissionData as any);
    } else {
      createMutation.mutate(submissionData as any);
    }
  }
  
  if ((isEditing && isLoadingTask) || isLoadingAccounts || isLoadingProjects) {
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
          onClick={() => {
            if (isEditing) {
              navigate(`/tasks`);
            } else if (projectIdFromUrl) {
              navigate(`/projects/${projectIdFromUrl}`);
            } else {
              navigate("/tasks");
            }
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Geri</span>
        </Button>
        <h2 className="text-2xl font-semibold">
          {isEditing ? "Görevi Düzenle" : "Yeni Görev"}
        </h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Görev Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Başlık</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Görev başlığını girin" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Görev açıklamasını girin" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                          // Clear project selection when account changes
                          form.setValue("projectId", "");
                        }} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Firma seçin (opsiyonel)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="_none">-- Firma Seçmeyin --</SelectItem>
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
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İlgili Proje</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                        disabled={!selectedAccountId && filteredProjects?.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              !selectedAccountId && !projectIdFromUrl
                                ? "Önce firma seçin" 
                                : filteredProjects?.length === 0 
                                  ? "Proje bulunamadı" 
                                  : "Proje seçin (opsiyonel)"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="_none">-- Proje Seçmeyin --</SelectItem>
                          {filteredProjects?.map((project: any) => (
                            <SelectItem key={project.id} value={String(project.id)}>
                              {project.name}
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Öncelik</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Öncelik seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Normal</SelectItem>
                          <SelectItem value="medium">Orta</SelectItem>
                          <SelectItem value="high">Yüksek</SelectItem>
                        </SelectContent>
                      </Select>
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
                          <SelectItem value="todo">Beklemede</SelectItem>
                          <SelectItem value="in-progress">Devam Ediyor</SelectItem>
                          <SelectItem value="completed">Tamamlandı</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueDate"
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
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {!createMutation.isPending && !updateMutation.isPending && (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isEditing ? "Güncelle" : "Kaydet"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}