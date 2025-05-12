import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatusClass } from "@/lib/utils";
import { Eye, Filter, Plus } from "lucide-react";

export default function Quotes() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: quotes, isLoading } = useQuery({
    queryKey: ["/api/quotes"],
  });

  const urlSearchQuery = new URLSearchParams(search).get("q") || "";

  const filteredQuotes = quotes?.filter((quote: any) => {
    if (!urlSearchQuery) return true;
    const searchTerm = urlSearchQuery.toLowerCase();
    return quote.subject.toLowerCase().includes(searchTerm) ||
           quote.accountName.toLowerCase().includes(searchTerm) ||
           (quote.number && quote.number.toLowerCase().includes(searchTerm));
  }
) || [];

  const filteredByType = activeTab === "all" 
    ? filteredQuotes
    : filteredQuotes.filter((quote: any) => quote.type === activeTab);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="pb-20 md:pb-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold">Teklifler</h2>
        <div className="flex w-full sm:w-auto space-x-2">
          <Button variant="outline" className="flex items-center">
            <Filter className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Filtrele</span>
          </Button>
          <Button onClick={() => navigate("/quotes/new")} className="flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Yeni Teklif</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tüm Teklifler</TabsTrigger>
          <TabsTrigger value="sent">Verilen Teklifler</TabsTrigger>
          <TabsTrigger value="received">Alınan Teklifler</TabsTrigger>
        </TabsList>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-32 mb-3" />
                    <div className="mt-4 flex justify-between items-center">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <div className="border-t border-border p-3 bg-muted/30 flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredByType.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                {urlSearchQuery
                  ? "Arama kriterine uygun teklif bulunamadı."
                  : "Bu kategoride teklif bulunamadı."}
              </p>
            </div>
          ) : (
            filteredByType.map((quote: any) => (
              <Card key={quote.id} className="overflow-hidden card-hover">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`badge ${getStatusClass(quote.status).badgeClass}`}>
                        {quote.status === "pending" 
                          ? "Bekliyor" 
                          : quote.status === "approved" 
                            ? "Onaylandı" 
                            : quote.status === "rejected"
                              ? "Reddedildi"
                              : "İptal"}
                      </span>
                      <p className="text-lg font-medium">{quote.totalAmount} {quote.currency}</p>
                    </div>
                    <h3 className="font-medium text-lg mb-1">{quote.subject}</h3>
                    <p className="text-sm text-muted-foreground">{quote.accountName}</p>
                    <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                      <span>{quote.number}</span>
                      <span>{quote.formattedDate}</span>
                    </div>
                  </div>
                  <div className="border-t border-border p-3 bg-muted/30 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {quote.type === "sent" ? "Verilen Teklif" : "Alınan Teklif"}
                    </span>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => navigate(`/quotes/${quote.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </Tabs>
    </div>
  );
}
