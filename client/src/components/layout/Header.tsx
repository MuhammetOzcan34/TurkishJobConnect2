import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Search, User } from "lucide-react";

interface HeaderProps {
  onProfileClick: () => void;
}

export default function Header({ onProfileClick }: HeaderProps) {
  const [location, navigate] = useLocation();
  const wouterSearch = useSearch(); // wouter'dan mevcut query string'i almak için
  const [searchInputValue, setSearchInputValue] = useState("");

  // URL'deki 'q' parametresinden searchInputValue'yu başlat
  useEffect(() => {
    const params = new URLSearchParams(wouterSearch);
    setSearchInputValue(params.get("q") || "");
  }, [wouterSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPath = location.split('?')[0];
    const searchParams = new URLSearchParams(wouterSearch);

    if (searchInputValue.trim()) {
      searchParams.set("q", searchInputValue.trim());
    } else {
      searchParams.delete("q");
    }
    const newQueryString = searchParams.toString();
    navigate(newQueryString ? `${currentPath}?${newQueryString}` : currentPath, { replace: true });
  };

  return (
    <header className="gradient-bg text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-3 bg-white/10 text-white hover:bg-white/20"
            onClick={onProfileClick}
          >
            <User className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold hidden md:block">İş Takip</h1>
        </div>
        
        <div className="flex-1 max-w-md mx-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Input
              type="text"
              placeholder="Ara..."
              className="w-full py-2 pl-10 pr-4 rounded-full bg-white/10 text-white placeholder:text-white/70 border-transparent focus:border-white/30 focus:bg-white/20"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
          </form>
        </div>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white/10 text-white hover:bg-white/20 relative"
          >
            <Bell className="h-5 w-5" />
            <span className="nav-indicator"></span>
          </Button>
        </div>
      </div>
    </header>
  );
}
