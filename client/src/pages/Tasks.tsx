import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatusClass } from "@/lib/utils";
import { Filter, Plus } from "lucide-react";
import KanbanBoard from "@/components/ui/kanban-board";

export default function Tasks() {
  const [, navigate] = useLocation();
  const search = useSearch();
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });
  
  // Parse URL parameters
  const searchParams = new URLSearchParams(search);
  const accountIdFilter = searchParams.get("account");
  const projectIdFilter = searchParams.get("project");
  const urlSearchQuery = searchParams.get("q") || "";
  
  // Filter tasks based on search and URL params
  const filteredTasks = tasks?.filter((task: any) => {
    // Apply global search filter
    const searchTerm = urlSearchQuery.toLowerCase();
    const matchesGlobalSearch = !urlSearchQuery ||
      task.title.toLowerCase().includes(searchTerm) ||
      (task.description && task.description.toLowerCase().includes(searchTerm)) ||
      (task.account && task.account.toLowerCase().includes(searchTerm)) || // Assuming task.account is account name
      (task.project && task.project.toLowerCase().includes(searchTerm)); // Assuming task.project is project name
    
    // Apply account filter if present
    const matchesAccount = !accountIdFilter || String(task.accountId) === accountIdFilter;
    
    // Apply project filter if present
    const matchesProject = !projectIdFilter || String(task.projectId) === projectIdFilter;
    
    return matchesGlobalSearch && matchesAccount && matchesProject;
  }) || [];
  
  const handleTaskMove = async (taskId: string, newStatus: "todo" | "in-progress" | "completed") => {
    try {
      await fetch(`/api/tasks/${taskId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });
      
      // Refetch tasks data
      window.location.reload();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };
  
  const getPageTitle = () => {
    if (projectIdFilter) {
      const project = filteredTasks.find((task: any) => String(task.projectId) === projectIdFilter)?.project;
      return `Görevler: ${project || 'Proje Görevleri'}`;
    }
    
    if (accountIdFilter) {
      const account = filteredTasks.find((task: any) => String(task.accountId) === accountIdFilter)?.account;
      return `Görevler: ${account || 'Firma Görevleri'}`;
    }
    
    return "Yapılacaklar";
  };

  return (
    <div className="pb-20 md:pb-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold">{getPageTitle()}</h2>
        <div className="flex w-full sm:w-auto space-x-2">
          <Button variant="outline" className="flex items-center">
            <Filter className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Filtrele</span>
          </Button>
          <Button 
            onClick={() => {
              const url = new URL("/tasks/new", window.location.href);
              if (projectIdFilter) url.searchParams.set("project", projectIdFilter);
              if (accountIdFilter) url.searchParams.set("account", accountIdFilter);
              navigate(url.pathname + url.search);
            }} 
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Yeni Görev</span>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((col) => (
                <div key={col} className="kanban-column">
                  <Skeleton className="h-6 w-40 mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <Skeleton key={`${col}-${item}`} className="h-32 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Görev bulunamadı.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  const url = new URL("/tasks/new", window.location.href);
                  if (projectIdFilter) url.searchParams.set("project", projectIdFilter);
                  if (accountIdFilter) url.searchParams.set("account", accountIdFilter);
                  navigate(url.pathname + url.search);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Görev Ekle</span>
              </Button>
            </div>
          ) : (
            <KanbanBoard 
              tasks={filteredTasks.map((task: any) => ({
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
