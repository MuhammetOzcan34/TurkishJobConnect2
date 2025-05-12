import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { X, Briefcase, FileText, CheckCircle, Building } from "lucide-react";

interface CreateMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateMenu({ isOpen, onClose }: CreateMenuProps) {
  const [, navigate] = useLocation();

  const menuItems = [
    {
      icon: Briefcase,
      label: "Yeni Kullanıcı",
      bgColor: "bg-indigo-100 dark:bg-indigo-900",
      textColor: "text-indigo-500",
      path: "/users/new"
    },
    {
      icon: Briefcase,
      label: "Yeni Proje",
      bgColor: "bg-blue-100 dark:bg-blue-900",
      textColor: "text-blue-500",
      path: "/projects/new"
    },
    {
      icon: FileText,
      label: "Yeni Teklif",
      bgColor: "bg-orange-100 dark:bg-orange-900",
      textColor: "text-orange-500",
      path: "/quotes/new"
    },
    {
      icon: CheckCircle,
      label: "Yeni Görev",
      bgColor: "bg-green-100 dark:bg-green-900",
      textColor: "text-green-500",
      path: "/tasks/new"
    },
    {
      icon: Building,
      label: "Yeni Cari Hesap",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      textColor: "text-purple-500",
      path: "/accounts/new"
    }
  ];

  const handleClick = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 w-64" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-center font-medium mb-4">Yeni</h3>
        
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <button 
              key={index}
              className="w-full text-left p-3 flex items-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200"
              onClick={() => handleClick(item.path)}
            >
              <div className={`w-8 h-8 rounded-full ${item.bgColor} ${item.textColor} flex items-center justify-center mr-3`}>
                <item.icon className="h-4 w-4" />
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-4 flex justify-center">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
