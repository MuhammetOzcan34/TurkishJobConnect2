import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Plus, Filter, MoreHorizontal, Pencil, Trash, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Tasks() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const urlSearchQuery = new URLSearchParams(search).get("q") || "";

  const filteredTasks = (tasks || []).filter((task: any) => {
    const term = searchTerm || urlSearchQuery;
    if (!term) return true;
    const searchLower = term.toLowerCase();
    return (
      task.title?.toLowerCase().includes(searchLower) ||
      task.accountName?.toLowerCase().includes(searchLower) ||
      task.projectName?.toLowerCase().includes(searchLower) ||
      task.assigneeName?.toLowerCase().includes(searchLower)
    );
  });

  const filteredByStatus =
    activeTab === "all"
      ? filteredTasks
      : filteredTasks.filter((task: any) => task.status === activeTab);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "in_progress":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Tamamlandı";
      case "pending":
        return "Bekliyor";
      case "in_progress":
        return "Devam Ediyor";
      default:
        return status;
    }
  };

  return (
    <div className="pb-20 md:pb-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold">Görevler</h2>
        <div className="flex w-full sm:w-auto space-x-2">
          <Input
            placeholder="Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="outline" className="flex items-center">
            <Filter className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Filtrele</span>
          </Button>
          <Button onClick={() => navigate("/tasks/new")} className="flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Yeni Görev</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tüm Görevler</TabsTrigger>
          <TabsTrigger value="pending">Bekleyen</TabsTrigger>
          <TabsTrigger value="in_progress">Devam Eden</TabsTrigger>
          <TabsTrigger value="completed">Tamamlanan</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Başlık</TableHead>
                      <TableHead>Firma</TableHead>
                      <TableHead>Proje</TableHead>
                      <TableHead>Atanan</TableHead>
                      <TableHead>Öncelik</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Teslim Tarihi</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-9 w-24 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredByStatus.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          {searchTerm || urlSearchQuery
                            ? "Arama kriterine uygun görev bulunamadı."
                            : "Görev bulunamadı."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredByStatus.map((task: any) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell>{task.accountName || "-"}</TableCell>
                          <TableCell>{task.projectName || "-"}</TableCell>
                          <TableCell>{task.assigneeName || "-"}</TableCell>
                          <TableCell>{task.priority || "-"}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getStatusIcon(task.status)}
                              <span className="ml-2">{getStatusLabel(task.status)}</span>
                            </div>
                          </TableCell>
                          <TableCell>{task.dueDate || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => navigate(`/tasks/${task.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/tasks/${task.id}/edit`)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Düzenle</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => alert(`${task.title} silinecek`)}>
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Sil</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}