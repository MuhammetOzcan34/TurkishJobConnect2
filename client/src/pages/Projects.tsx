import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatusClass } from "@/lib/utils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Eye, 
  Filter, 
  Plus, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from "lucide-react";

export default function Projects() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  
  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  const urlSearchQuery = new URLSearchParams(search).get("q") || "";

  const filteredProjects = projects?.filter((project: any) => {
    if (!urlSearchQuery) return true;
    const searchTerm = urlSearchQuery.toLowerCase();
    return project.name.toLowerCase().includes(searchTerm) ||
           project.accountName.toLowerCase().includes(searchTerm) ||
           (project.number && project.number.toLowerCase().includes(searchTerm));
  }
) || [];

  const filteredByStatus = activeTab === "all" 
    ? filteredProjects
    : filteredProjects.filter((project: any) => project.status === activeTab);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "on_hold":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

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

  return (
    <div className="pb-20 md:pb-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold">Projeler</h2>
        <div className="flex w-full sm:w-auto space-x-2">
          <Button variant="outline" className="flex items-center">
            <Filter className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Filtrele</span>
          </Button>
          <Button onClick={() => navigate("/projects/new")} className="flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Yeni Proje</span>
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Tüm Projeler</TabsTrigger>
            <TabsTrigger value="active">Aktif</TabsTrigger>
            <TabsTrigger value="completed">Tamamlanan</TabsTrigger>
            <TabsTrigger value="on_hold">Beklemede</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex space-x-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            Tablo
          </Button>
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            Kartlar
          </Button>
        </div>
      </div>
      
      {viewMode === "table" ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proje No</TableHead>
                  <TableHead>Proje Adı</TableHead>
                  <TableHead>Firma</TableHead>
                  <TableHead>Başlangıç</TableHead>
                  <TableHead>Bitiş</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeletons
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredByStatus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {urlSearchQuery
                        ? "Arama kriterine uygun proje bulunamadı."
                        : "Bu kategoride proje bulunamadı."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredByStatus.map((project: any) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.number}</TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.accountName}</TableCell>
                      <TableCell>{project.formattedStartDate}</TableCell>
                      <TableCell>{project.formattedEndDate || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(project.status)}
                          <span className={`ml-2 ${getStatusClass(getStatusLabel(project.status)).textClass}`}>
                            {getStatusLabel(project.status)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          <span>Görüntüle</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32 mb-3" />
                    <div className="flex justify-between mt-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="border-t border-border p-3 bg-muted/30 flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredByStatus.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                {urlSearchQuery
                  ? "Arama kriterine uygun proje bulunamadı."
                  : "Bu kategoride proje bulunamadı."}
              </p>
            </div>
          ) : (
            filteredByStatus.map((project: any) => (
              <Card key={project.id} className="overflow-hidden card-hover">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-muted-foreground">{project.number}</span>
                      <div className="flex items-center">
                        {getStatusIcon(project.status)}
                        <span className={`ml-1 text-sm ${getStatusClass(getStatusLabel(project.status)).textClass}`}>
                          {getStatusLabel(project.status)}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-medium text-lg mb-1">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">{project.accountName}</p>
                    <div className="flex justify-between mt-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Başlangıç: </span>
                        <span>{project.formattedStartDate}</span>
                      </div>
                      {project.formattedEndDate && (
                        <div>
                          <span className="text-muted-foreground">Bitiş: </span>
                          <span>{project.formattedEndDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-border p-3 bg-muted/30 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground truncate">
                      {project.description?.substring(0, 30) || "Proje detayı"}
                      {project.description?.length > 30 ? "..." : ""}
                    </span>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
