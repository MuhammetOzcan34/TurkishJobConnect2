import { useState, useEffect } from "react";
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
import { Eye, Plus, Filter, MoreHorizontal, File, Briefcase, Pencil, Trash } from "lucide-react";

export default function Accounts() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const [activeTab, setActiveTab] = useState("list");
  
  const { data: accounts, isLoading } = useQuery({
    queryKey: ["/api/accounts"],
  });

  const urlSearchQuery = new URLSearchParams(search).get("q") || "";

  const filteredAccounts = accounts?.filter((account: any) => {
    if (!urlSearchQuery) return true;
    const searchTerm = urlSearchQuery.toLowerCase();
    return account.name.toLowerCase().includes(searchTerm) ||
           (account.contact && account.contact.toLowerCase().includes(searchTerm)) ||
           (account.email && account.email.toLowerCase().includes(searchTerm)) ||
           (account.phone && account.phone.toLowerCase().includes(searchTerm));
  }
) || [];


  return (
    <div className="pb-20 md:pb-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold">Cari Hesaplar</h2>
        <div className="flex w-full sm:w-auto space-x-2">
          <Button variant="outline" className="flex items-center">
            <Filter className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Filtrele</span>
          </Button>
          <Button onClick={() => navigate("/accounts/new")} className="flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Yeni Cari</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="list">Cari Hesap Listesi</TabsTrigger>
          <TabsTrigger value="movements">Cari Hesap Hareketleri</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Firma Adı</TableHead>
                      <TableHead>Şube/Bölge</TableHead>
                      <TableHead>Firma Türü</TableHead>
                      <TableHead>Yetkili Kişi</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead className="text-center">Görevler</TableHead>
                      <TableHead className="text-center">Projeler</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Loading skeletons
                      Array(5).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                          <TableCell className="text-center"><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
                          <TableCell className="text-center"><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-9 w-24 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredAccounts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          {urlSearchQuery
                            ? "Arama kriterine uygun cari hesap bulunamadı."
                            : "Cari hesap bulunamadı."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAccounts.map((account: any) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.name}</TableCell>
                          <TableCell>{account.branch || "-"}</TableCell>
                          <TableCell>{account.type === "customer" ? "Alıcı" : "Satıcı"}</TableCell>
                          <TableCell>{account.contact || "-"}</TableCell>
                          <TableCell>{account.phone || "-"}</TableCell>
                          <TableCell className="text-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 -mx-2"
                              onClick={() => navigate(`/tasks?account=${account.id}`)}
                            >
                              {account.tasks || 0}
                            </Button>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 -mx-2"
                              onClick={() => navigate(`/projects?account=${account.id}`)}
                            >
                              {account.projects || 0}
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => navigate(`/accounts/${account.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => { 
                                  setActiveTab("movements");
                                  // Burada form elemanlarına ilgili hesabın bilgilerini doldurabilirsiniz
                                  // Örnek: setSelectedAccount(account.id);
                                }}
                              >
                                <File className="h-4 w-4" />
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
                                  <DropdownMenuItem onClick={() => navigate(`/accounts/${account.id}/edit`)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Düzenle</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => alert(`${account.name} silinecek`)}>
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
        
        <TabsContent value="movements">
          <Card>
            <CardContent className="p-4">
              <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Cari Hesap</label>
                  <Input placeholder="Cari hesap seçin..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tarih Aralığı</label>
                  <div className="flex space-x-2">
                    <Input type="date" className="flex-1" />
                    <Input type="date" className="flex-1" />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button className="w-full">Filtrele</Button>
                </div>
              </div>
              
              <div className="overflow-x-auto mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Cari Hesap</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Tür</TableHead>
                      <TableHead className="text-right">Borç</TableHead>
                      <TableHead className="text-right">Alacak</TableHead>
                      <TableHead className="text-right">Bakiye</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Loading skeletons
                      Array(5).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      // Example transactions
                      <>
                        <TableRow>
                          <TableCell>15.05.2023</TableCell>
                          <TableCell>ABC Şirketi</TableCell>
                          <TableCell>Proje No: P0001 - Web Sitesi Projesi</TableCell>
                          <TableCell>Borç</TableCell>
                          <TableCell className="text-right">₺15.000,00</TableCell>
                          <TableCell className="text-right">-</TableCell>
                          <TableCell className="text-right">₺15.000,00</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Briefcase className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>18.05.2023</TableCell>
                          <TableCell>ABC Şirketi</TableCell>
                          <TableCell>İlk Ödeme</TableCell>
                          <TableCell>Alacak</TableCell>
                          <TableCell className="text-right">-</TableCell>
                          <TableCell className="text-right">₺7.500,00</TableCell>
                          <TableCell className="text-right">₺7.500,00</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </>
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
