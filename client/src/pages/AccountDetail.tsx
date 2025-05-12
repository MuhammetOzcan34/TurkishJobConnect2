import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Building, 
  Mail, 
  Phone, 
  Edit, 
  Trash2, 
  Printer, 
  Briefcase, 
  FileText,
  CheckCircle, 
  MoreHorizontal 
} from "lucide-react";

export default function AccountDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  
  const { data: account, isLoading } = useQuery({
    queryKey: [`/api/accounts/${id}`],
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: [`/api/accounts/${id}/projects`],
  });

  const { data: quotes, isLoading: isLoadingQuotes } = useQuery({
    queryKey: [`/api/accounts/${id}/quotes`],
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: [`/api/accounts/${id}/tasks`],
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: [`/api/accounts/${id}/transactions`],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" onClick={() => navigate("/accounts")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Geri</span>
          </Button>
          <Skeleton className="h-8 w-56" />
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <Skeleton className="h-20 w-20 rounded-full mb-4" />
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Skeleton className="h-5 w-5 mr-3" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-5 w-5 mr-3" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-5 w-5 mr-3" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </div>
              <div className="md:w-2/3">
                <Skeleton className="h-6 w-32 mb-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-0">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" onClick={() => navigate("/accounts")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Geri</span>
          </Button>
          <h2 className="text-2xl font-semibold">{account?.name || "Cari Detayı"}</h2>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" />
            <span>Yazdır</span>
          </Button>
          <Button variant="outline" onClick={() => navigate(`/accounts/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-1" />
            <span>Düzenle</span>
          </Button>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-1" />
            <span>Sil</span>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-medium mb-4">
                {account?.name?.substring(0, 2).toUpperCase() || "AC"}
              </div>
              <h3 className="text-xl font-semibold">{account?.name}</h3>
              <p className="text-muted-foreground mb-4">{account?.type === "customer" ? "Alıcı" : "Satıcı"}</p>
              
              <div className="space-y-3">
                {account?.email && (
                  <div className="flex items-center">
                    <Mail className="text-muted-foreground mr-3 h-5 w-5" />
                    <p>{account.email}</p>
                  </div>
                )}
                {account?.phone && (
                  <div className="flex items-center">
                    <Phone className="text-muted-foreground mr-3 h-5 w-5" />
                    <p>{account.phone}</p>
                  </div>
                )}
                {account?.address && (
                  <div className="flex items-center">
                    <Building className="text-muted-foreground mr-3 h-5 w-5" />
                    <p>{account.address}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button 
                  className="flex items-center justify-center"
                  variant="outline"
                  onClick={() => navigate(`/quotes/new?account=${id}`)}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  <span>Teklif Oluştur</span>
                </Button>
                <Button 
                  className="flex items-center justify-center"
                  variant="outline"
                  onClick={() => navigate(`/projects/new?account=${id}`)}
                >
                  <Briefcase className="h-4 w-4 mr-1" />
                  <span>Proje Oluştur</span>
                </Button>
              </div>
            </div>
            
            <div className="md:w-2/3">
              <h3 className="text-lg font-medium mb-3">Yetkili Bilgileri</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {account?.contact && (
                  <div>
                    <p className="text-sm text-muted-foreground">Yetkili Kişi</p>
                    <p className="font-medium">{account.contact}</p>
                  </div>
                )}
                {account?.contactTitle && (
                  <div>
                    <p className="text-sm text-muted-foreground">Görevi</p>
                    <p className="font-medium">{account.contactTitle}</p>
                  </div>
                )}
                {account?.contactPhone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Telefonu</p>
                    <p className="font-medium">{account.contactPhone}</p>
                  </div>
                )}
                {account?.contactEmail && (
                  <div>
                    <p className="text-sm text-muted-foreground">E-Posta</p>
                    <p className="font-medium">{account.contactEmail}</p>
                  </div>
                )}
                {account?.branch && (
                  <div>
                    <p className="text-sm text-muted-foreground">Şube/Bölge</p>
                    <p className="font-medium">{account.branch}</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card className="bg-muted">
                  <CardContent className="p-4 text-center">
                    <h4 className="text-muted-foreground text-sm">Toplam Borç</h4>
                    <p className="text-xl font-semibold text-red-600 mt-1">₺{account?.totalDebt || "0,00"}</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted">
                  <CardContent className="p-4 text-center">
                    <h4 className="text-muted-foreground text-sm">Toplam Alacak</h4>
                    <p className="text-xl font-semibold text-green-600 mt-1">₺{account?.totalCredit || "0,00"}</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted">
                  <CardContent className="p-4 text-center">
                    <h4 className="text-muted-foreground text-sm">Bakiye</h4>
                    <p className={`text-xl font-semibold mt-1 ${(account?.balance || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ₺{account?.balance || "0,00"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b">
              <TabsTrigger value="transactions" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Hesap Hareketleri
              </TabsTrigger>
              <TabsTrigger value="projects" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Projeler
              </TabsTrigger>
              <TabsTrigger value="quotes" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Teklifler
              </TabsTrigger>
              <TabsTrigger value="tasks" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Görevler
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="transactions" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Tür</TableHead>
                      <TableHead className="text-right">Borç</TableHead>
                      <TableHead className="text-right">Alacak</TableHead>
                      <TableHead className="text-right">Bakiye</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingTransactions ? (
                      Array(3).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : transactions?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Bu hesaba ait hareket bulunamadı.
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions?.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{transaction.type}</TableCell>
                          <TableCell className="text-right">{transaction.debit || "-"}</TableCell>
                          <TableCell className="text-right">{transaction.credit || "-"}</TableCell>
                          <TableCell className="text-right">{transaction.balance}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="projects" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proje No</TableHead>
                      <TableHead>Proje Adı</TableHead>
                      <TableHead>Başlangıç</TableHead>
                      <TableHead>Bitiş</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">Tutar</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingProjects ? (
                      Array(3).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : projects?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Bu hesaba ait proje bulunamadı.
                        </TableCell>
                      </TableRow>
                    ) : (
                      projects?.map((project: any) => (
                        <TableRow key={project.id}>
                          <TableCell>{project.number}</TableCell>
                          <TableCell>{project.name}</TableCell>
                          <TableCell>{project.startDate}</TableCell>
                          <TableCell>{project.endDate}</TableCell>
                          <TableCell>
                            <span className={`badge ${getStatusClass(project.status).badgeClass}`}>{project.status}</span>
                          </TableCell>
                          <TableCell className="text-right">{project.amount}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/projects/${project.id}`)}>
                              <Briefcase className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="quotes" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teklif No</TableHead>
                      <TableHead>Teklif Konusu</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">Tutar</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingQuotes ? (
                      Array(3).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : quotes?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Bu hesaba ait teklif bulunamadı.
                        </TableCell>
                      </TableRow>
                    ) : (
                      quotes?.map((quote: any) => (
                        <TableRow key={quote.id}>
                          <TableCell>{quote.number}</TableCell>
                          <TableCell>{quote.subject}</TableCell>
                          <TableCell>{quote.date}</TableCell>
                          <TableCell>
                            <span className={`badge ${getStatusClass(quote.status).badgeClass}`}>{quote.status}</span>
                          </TableCell>
                          <TableCell className="text-right">{quote.amount}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/quotes/${quote.id}`)}>
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="tasks" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Görev</TableHead>
                      <TableHead>Proje</TableHead>
                      <TableHead>Son Tarih</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Atanan</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingTasks ? (
                      Array(3).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : tasks?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Bu hesaba ait görev bulunamadı.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tasks?.map((task: any) => (
                        <TableRow key={task.id}>
                          <TableCell>{task.title}</TableCell>
                          <TableCell>{task.project || "-"}</TableCell>
                          <TableCell>{task.dueDate}</TableCell>
                          <TableCell>
                            <span className={`badge ${getStatusClass(task.status).badgeClass}`}>{task.status}</span>
                          </TableCell>
                          <TableCell>{task.assignee}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  function getStatusClass(status: string) {
    switch (status.toLowerCase()) {
      case "tamamlandı":
      case "aktif":
      case "onaylandı":
      case "kabul edildi":
        return { badgeClass: "badge-success" };
      case "beklemede":
      case "devam ediyor":
        return { badgeClass: "badge-warning" };
      case "iptal":
      case "iptal edildi":
      case "reddedildi":
        return { badgeClass: "badge-error" };
      default:
        return { badgeClass: "badge-neutral" };
    }
  }
}
