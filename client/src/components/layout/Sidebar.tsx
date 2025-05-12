import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
// DropdownMenu ile ilgili importlar kaldırıldı
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Home,
  FileText,
  Briefcase,
  CheckCircle,
  BarChart3,
  Settings,
  LifeBuoy,
  Building, // LogOut, ChevronDown, UserPlus ikonları kaldırıldı
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface SidebarProps {
  onProfileClick: () => void;
  onCreateClick: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Ana Sayfa", icon: Home, tooltip: "Ana Sayfa" },
  {
    href: "/accounts",
    label: "Cari Hesaplar",
    icon: Building,
    tooltip: "Cari Hesaplar",
  },
  { href: "/quotes", label: "Teklifler", icon: FileText, tooltip: "Teklifler" },
  {
    href: "/projects",
    label: "Projeler",
    icon: Briefcase,
    tooltip: "Projeler",
  },
  {
    href: "/tasks",
    label: "Yapılacaklar",
    icon: CheckCircle,
    tooltip: "Yapılacaklar",
    hasNotification: true,
  },
  { href: "/reports", label: "Raporlar", icon: BarChart3, tooltip: "Raporlar" },
];

const bottomNavItems = [
  { href: "/settings", label: "Ayarlar", icon: Settings, tooltip: "Ayarlar" },
  { href: "/help", label: "Yardım", icon: LifeBuoy, tooltip: "Yardım" },
];

export default function Sidebar({
  onProfileClick,
  onCreateClick,
}: SidebarProps) {
  const [location, navigate] = useLocation(); // navigate burada tanımlı kalabilir, başka yerlerde kullanılıyor olabilir

  const isActiveLink = (href: string) => {
    if (href === "/dashboard" && location === "/") return true;
    // Daha sağlam bir aktif link kontrolü, özellikle iç içe rotalar için
    return location.startsWith(href) && (href !== "/" || location === "/");
  };

  return (
    <aside className="hidden md:flex flex-col w-16 xl:w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out">
      {/* Logo and Company Name */}
      <div className="p-3 border-b border-sidebar-border">
        <Link href="/dashboard">
          <a className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white flex-shrink-0">
              <Building className="h-5 w-5" />
            </div>
            <div className="text-left hidden xl:block">
              <p className="text-sm font-semibold">Firma Adı</p>
              <p className="text-xs text-sidebar-foreground/70">
                İş Takip Sistemi
              </p>
            </div>
          </a>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <TooltipProvider delayDuration={0}>
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                  <Link
                      href={item.href}
                      className={cn(
                        "flex items-center p-3 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-150 relative",
                        isActiveLink(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-sidebar-foreground/80",
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="ml-3 hidden xl:inline">
                        {item.label}
                      </span>
                      {item.hasNotification && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full hidden xl:inline"></span>
                      )}
                  </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="xl:hidden">
                    <p>{item.tooltip}</p>
                    {item.hasNotification && (
                      <span className="ml-2 text-xs text-secondary">
                        (Yeni)
                      </span>
                    )}
                  </TooltipContent>
                </Tooltip>
              </li>
            ))}
          </ul>
        </TooltipProvider>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-sidebar-border mt-auto">
        <div className="flex items-center justify-between mb-3">
          <ThemeToggle />
          {/* Profil bölümü güncellendi */}
          <Button
            variant="ghost"
            className="flex items-center space-x-2 p-2 hover:bg-sidebar-accent"
            onClick={onProfileClick} // ProfileSidebar'ı doğrudan açar
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm">
              AŞ {/* Kullanıcı baş harfleri */}
            </div>
            <div className="text-left hidden xl:block">
              <p className="text-sm font-medium">Ahmet Şahin</p>
              <p className="text-xs text-sidebar-foreground/70">Yönetici</p>
            </div>
          </Button>
        </div>

        <TooltipProvider delayDuration={0}>
          <ul className="space-y-1">
            {bottomNavItems.map((item) => (
              <li key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                  <Link
                      href={item.href}
                      className={cn(
                        "flex items-center p-3 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-150",
                        isActiveLink(item.href)
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80",
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="ml-3 hidden xl:inline">
                        {item.label}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="xl:hidden">
                    <p>{item.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </li>
            ))}
          </ul>
        </TooltipProvider>
      </div>
    </aside>
  );
}
