import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  assignee?: string;
  assigneeAvatar?: string;
  status: "todo" | "in-progress" | "completed";
}

interface KanbanColumnProps {
  title: string;
  count: number;
  status: "todo" | "in-progress" | "completed";
  tasks: KanbanTask[];
  color: string;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: "todo" | "in-progress" | "completed") => void;
}

const KanbanColumn = ({ 
  title, 
  count, 
  status, 
  tasks, 
  color, 
  onDragStart, 
  onDragOver, 
  onDrop 
}: KanbanColumnProps) => {
  return (
    <div 
      className="kanban-column"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <span className={`w-3 h-3 rounded-full ${color} mr-2`}></span>
        {title} <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">({count})</span>
      </h3>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <div 
            key={task.id}
            className="task-card"
            draggable
            onDragStart={(e) => onDragStart(e, task.id)}
          >
            <div className="flex justify-between items-start">
              <span className={cn(
                "badge",
                task.priority === "high" && "badge-error",
                task.priority === "medium" && "badge-warning",
                task.priority === "low" && "badge-neutral",
                task.status === "completed" && "badge-success"
              )}>
                {task.status === "completed" ? "Tamamlandı" : 
                  task.priority === "high" ? "Yüksek" : 
                  task.priority === "medium" ? "Orta" : "Normal"}
              </span>
              <button 
                type="button"
                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/tasks/${task.id}`;
                }}
              >
                Aç
              </button>
            </div>
            <h4 className={cn(
              "font-medium mt-2",
              task.status === "completed" && "line-through"
            )}>{task.title}</h4>
            {task.description && (
              <p className={cn(
                "text-sm text-neutral-500 dark:text-neutral-400 mt-1",
                task.status === "completed" && "line-through"
              )}>{task.description}</p>
            )}
            <div className="mt-3 flex justify-between">
              {task.dueDate && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-500 dark:text-neutral-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{task.dueDate}</span>
                </div>
              )}
              {task.assignee && (
                <div className="flex items-center">
                  {task.assigneeAvatar ? (
                    <img 
                      src={task.assigneeAvatar} 
                      alt={task.assignee} 
                      className="w-6 h-6 rounded-full" 
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                      {task.assignee.split(' ').map(name => name[0]).join('')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface KanbanBoardProps {
  tasks: KanbanTask[];
  onTaskMove?: (taskId: string, newStatus: "todo" | "in-progress" | "completed") => void;
}

export default function KanbanBoard({ tasks, onTaskMove }: KanbanBoardProps) {
  const [boardTasks, setBoardTasks] = useState<KanbanTask[]>(tasks);
  const dragTaskId = useRef<string | null>(null);

  useEffect(() => {
    setBoardTasks(tasks);
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    dragTaskId.current = taskId;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: "todo" | "in-progress" | "completed") => {
    e.preventDefault();
    
    if (!dragTaskId.current) return;
    
    // Update task status locally
    const updatedTasks = boardTasks.map(task => {
      if (task.id === dragTaskId.current) {
        return { ...task, status };
      }
      return task;
    });
    
    setBoardTasks(updatedTasks);
    
    // Call the callback if provided
    if (onTaskMove) {
      onTaskMove(dragTaskId.current, status);
    }
    
    dragTaskId.current = null;
  };

  const todoTasks = boardTasks.filter(task => task.status === "todo");
  const inProgressTasks = boardTasks.filter(task => task.status === "in-progress");
  const completedTasks = boardTasks.filter(task => task.status === "completed");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <KanbanColumn 
        title="Beklemede"
        count={todoTasks.length}
        status="todo"
        tasks={todoTasks}
        color="bg-neutral-400"
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />
      
      <KanbanColumn 
        title="Devam Ediyor"
        count={inProgressTasks.length}
        status="in-progress"
        tasks={inProgressTasks}
        color="bg-blue-500"
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />
      
      <KanbanColumn 
        title="Tamamlandı"
        count={completedTasks.length}
        status="completed"
        tasks={completedTasks}
        color="bg-green-500"
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />
    </div>
  );
}
