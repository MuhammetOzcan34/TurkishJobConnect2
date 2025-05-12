import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Building, 
  Calendar, 
  Edit, 
  Trash2, 
  Printer,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  Plus
} from "lucide-react";
import { formatCurrency, getStatusClass } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import KanbanBoard from "@/components/ui/kanban-board";

export default function ProjectDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: project, isLoading } = useQuery({
    queryKey: [`/api/projects/${id}`],
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("PUT", `/api/projects/${id}`, {
        ...project,
        status
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Durum güncellendi",
        description: "Proje durumu başarıyla güncellendi.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Durum güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/projects/${id}`, undefined);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Proje silindi",
        description: "Proje başarıyla silindi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      navigate("/projects");
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Proje silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  
  const handleStatusChange = (status: string) => {
    updateStatusMutation.mutate(status);
  };
  
  const handleTaskMove = async (taskId: string, newStatus: "todo" | "in-progress" | "completed") => {
    try {
      await apiRequest("PUT", `/api/tasks/${taskId}/status`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      toast({
        title: "Görev güncellendi",
        description: "Görev durumu başarıyla güncellendi.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Görev durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Geri</span>
          </Button>
          <Skeleton className="h-8 w-56" />
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-5 w-36" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-36" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                </div>
              </div>
              <div className="md:w-1/3">
                <Skeleton className="h-[300px] w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-0">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "completed":
        return "Tamamlandı";
      case "cancelled":
        return "İptal";
      case "on_hold":
        return "Beklemede";
      default:
        return status;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4 mr-1" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "cancelled":
        return <X className="h-4 w-4 mr-1" />;
      case "on_hold":
        return <AlertCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };
  
  const { badgeClass, textClass } = getStatusClass(getStatusLabel(project?.status));

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2" 
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Geri</span>
          </Button>
          <h2 className="text-2xl font-semibold">Proje: {project?.number}</h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4 mr-1" />
            <span>Yazdır</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/projects/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            <span>Düzenle</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-1" />
                <span>Sil</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Projeyi silmek istediğinize emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu işlem geri alınamaz. Bu proje kalıcı olarak silinecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate()}>
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{project?.name}</h2>
                  <div className="flex items-center">
                    {getStatusIcon(project?.status)}
                    <span className={textClass}>{getStatusLabel(project?.status)}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Firma</p>
                  <div className="flex items-start mt-1">
                    <Building className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                    <p className="font-medium">{project?.account?.name}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Başlangıç Tarihi</p>
                  <div className="flex items-start mt-1">
                    <Calendar className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                    <p className="font-medium">{project?.formattedStartDate}</p>
                  </div>
                </div>
                
                {project?.formattedEndDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Bitiş Tarihi</p>
                    <div className="flex items-start mt-1">
                      <Calendar className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                      <p className="font-medium">{project.formattedEndDate}</p>
                    </div>
                  </div>
                )}
                
                {project?.amount > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tutar</p>
                    <div className="flex items-start mt-1">
                      <p className="font-medium">{formatCurrency(project.amount, project.currency)}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {project?.description && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Açıklama</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{project.description}</p>
                </div>
              )}
              
              {project?.notes && (
                <div>
                  <h3 className="font-medium mb-2">Notlar</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{project.notes}</p>
                </div>
              )}
            </div>
            
            <div className="md:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>Proje Durumu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Mevcut Durum:</span>
                    <span className={`badge ${badgeClass}`}>{getStatusLabel(project?.status)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Durumu Güncelle:</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={project?.status === "active" ? "default" : "outline"} 
                        className="w-full"
                        onClick={() => handleStatusChange("active")}
                        disabled={project?.status === "active"}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Aktif</span>
                      </Button>
                      
                      <Button 
                        variant={project?.status === "completed" ? "default" : "outline"} 
                        className="w-full"
                        onClick={() => handleStatusChange("completed")}
                        disabled={project?.status === "completed"}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span>Tamamlandı</span>
                      </Button>
                      
                      <Button 
                        variant={project?.status === "on_hold" ? "default" : "outline"} 
                        className="w-full"
                        onClick={() => handleStatusChange("on_hold")}
                        disabled={project?.status === "on_hold"}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>Beklemede</span>
                      </Button>
                      
                      <Button 
                        variant={project?.status === "cancelled" ? "default" : "outline"} 
                        className="w-full"
                        onClick={() => handleStatusChange("cancelled")}
                        disabled={project?.status === "cancelled"}
                      >
                        <X className="h-4 w-4 mr-1" />
                        <span>İptal</span>
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {project?.quoteId && (
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/quotes/${project.quoteId}`)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      <span>İlgili Teklifi Görüntüle</span>
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/accounts/${project?.accountId}`)}
                  >
                    <Building className="h-4 w-4 mr-1" />
                    <span>Firma Detayları</span>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Görev İstatistikleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {project?.tasks?.length || 0} Görev
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {project?.tasks?.filter((t: any) => t.status === "completed").length || 0} tamamlandı, 
                    {project?.tasks?.filter((t: any) => t.status === "in-progress").length || 0} devam ediyor, 
                    {project?.tasks?.filter((t: any) => t.status === "todo").length || 0} beklemede
                  </p>
                  
                  <div className="mt-4">
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={() => navigate(`/tasks/new?project=${id}`)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      <span>Yeni Görev Ekle</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Proje Görevleri</h3>
          
          {project?.tasks?.length > 0 ? (
            <KanbanBoard 
              tasks={project.tasks.map((task: any) => ({
                id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                dueDate: task.formattedDueDate,
                assignee: task.assignee,
                status: task.status,
              }))}
              onTaskMove={handleTaskMove}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Bu projeye ait görev bulunmamaktadır.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate(`/tasks/new?project=${id}`)}
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Görev Ekle</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
