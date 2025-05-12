import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { BarChart3, CheckCircle, Home, Menu, Plus, Building, FileText, Briefcase, BarChart } from "lucide-react";

interface MobileNavProps {
  onCreateClick: () => void;
}

export default function MobileNav({ onCreateClick }: MobileNavProps) {
  const [location] = useLocation();
  
  const isActiveLink = (href: string) => {
    if (href === "/dashboard" && location === "/") return true;
    return location === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 shadow-lg md:hidden border-t border-neutral-200 dark:border-neutral-700 z-10">
      <div className="grid grid-cols-7 w-full">
        <Link href="/dashboard">
          <a className={cn(
            "flex flex-col items-center pt-2 pb-1",
            isActiveLink("/dashboard") 
              ? "text-primary dark:text-white" 
              : "text-neutral-500 dark:text-neutral-400"
          )}>
            <Home className="h-5 w-5" />
            <span className="text-[9px] mt-1">Anasayfa</span>
          </a>
        </Link>
        
        <Link href="/accounts">
          <a className={cn(
            "flex flex-col items-center pt-2 pb-1",
            isActiveLink("/accounts")
              ? "text-primary dark:text-white"
              : "text-neutral-500 dark:text-neutral-400"
          )}>
            <Building className="h-5 w-5" />
            <span className="text-[9px] mt-1">Cariler</span>
          </a>
        </Link>
        
        <Link href="/tasks">
          <a className={cn(
            "flex flex-col items-center pt-2 pb-1",
            isActiveLink("/tasks")
              ? "text-primary dark:text-white"
              : "text-neutral-500 dark:text-neutral-400"
          )}>
            <CheckCircle className="h-5 w-5" />
            <span className="text-[9px] mt-1">Görevler</span>
          </a>
        </Link>
        
        <div className="flex justify-center">
          <button 
            onClick={onCreateClick}
            className="flex flex-col items-center p-2 -mt-5 rounded-full gradient-bg text-white shadow-lg relative"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
        
        <Link href="/quotes">
          <a className={cn(
            "flex flex-col items-center pt-2 pb-1",
            isActiveLink("/quotes")
              ? "text-primary dark:text-white"
              : "text-neutral-500 dark:text-neutral-400"
          )}>
            <FileText className="h-5 w-5" />
            <span className="text-[9px] mt-1">Teklifler</span>
          </a>
        </Link>
        
        <Link href="/projects">
          <a className={cn(
            "flex flex-col items-center pt-2 pb-1",
            isActiveLink("/projects")
              ? "text-primary dark:text-white"
              : "text-neutral-500 dark:text-neutral-400"
          )}>
            <Briefcase className="h-5 w-5" />
            <span className="text-[9px] mt-1">Projeler</span>
          </a>
        </Link>
        
        <Link href="/reports">
          <a className={cn(
            "flex flex-col items-center pt-2 pb-1",
            isActiveLink("/reports")
              ? "text-primary dark:text-white"
              : "text-neutral-500 dark:text-neutral-400"
          )}>
            <BarChart className="h-5 w-5" />
            <span className="text-[9px] mt-1">Raporlar</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
