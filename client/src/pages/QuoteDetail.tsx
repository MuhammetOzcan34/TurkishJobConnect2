import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Building, 
  Calendar, 
  Edit, 
  FileDown, 
  Trash2, 
  Printer,
  AlertCircle,
  Check,
  X,
  User,
  Clock,
  CreditCard,
  ClipboardCheck
} from "lucide-react";
import { formatCurrency, getStatusClass } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function QuoteDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: quote, isLoading } = useQuery({
    queryKey: [`/api/quotes/${id}`],
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("PUT", `/api/quotes/${id}`, {
        ...quote,
        status
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Durum güncellendi",
        description: "Teklif durumu başarıyla güncellendi.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/quotes/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Durum güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/quotes/${id}`, undefined);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Teklif silindi",
        description: "Teklif başarıyla silindi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      navigate("/quotes");
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Teklif silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  
  const handleStatusChange = (status: string) => {
    updateStatusMutation.mutate(status);
  };
  
  const handleDownloadPdf = async () => {
    try {
      const response = await fetch(`/api/quotes/${id}/pdf`);
      if (!response.ok) throw new Error('PDF oluşturulamadı');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `teklif-${quote?.number || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "PDF İndirildi",
        description: "Teklif PDF olarak indirildi.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "PDF indirilemedi.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Geri</span>
          </Button>
          <Skeleton className="h-8 w-56" />
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-5 w-36" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-36" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                </div>
                <Skeleton className="h-[200px] w-full" />
              </div>
              <div className="md:w-1/3">
                <Skeleton className="h-[300px] w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { badgeClass } = getStatusClass(quote?.status);
  const statusText = quote?.status === "pending" 
    ? "Bekliyor" 
    : quote?.status === "approved" 
      ? "Onaylandı" 
      : quote?.status === "rejected"
        ? "Reddedildi"
        : "İptal";

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2" 
            onClick={() => navigate("/quotes")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Geri</span>
          </Button>
          <h2 className="text-2xl font-semibold">Teklif: {quote?.number}</h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={handleDownloadPdf}
          >
            <FileDown className="h-4 w-4 mr-1" />
            <span>PDF</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4 mr-1" />
            <span>Yazdır</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/quotes/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            <span>Düzenle</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-1" />
                <span>Sil</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Teklifi silmek istediğinize emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu işlem geri alınamaz. Bu teklif kalıcı olarak silinecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate()}>
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{quote?.subject}</h2>
                  <p className="text-muted-foreground">{quote?.type === "sent" ? "Verilen Teklif" : "Alınan Teklif"}</p>
                </div>
                <div>
                  <span className={`badge ${badgeClass}`}>{statusText}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Firma</p>
                  <div className="flex items-start mt-1">
                    <Building className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                    <p className="font-medium">{quote?.account?.name}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Tarih</p>
                  <div className="flex items-start mt-1">
                    <Calendar className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                    <p className="font-medium">{quote?.formattedDate}</p>
                  </div>
                </div>
                
                {quote?.contactPerson && (
                  <div>
                    <p className="text-sm text-muted-foreground">Yetkili Kişi</p>
                    <div className="flex items-start mt-1">
                      <User className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                      <p className="font-medium">{quote.contactPerson}</p>
                    </div>
                  </div>
                )}
                
                {quote?.validUntil && (
                  <div>
                    <p className="text-sm text-muted-foreground">Geçerlilik Tarihi</p>
                    <div className="flex items-start mt-1">
                      <Clock className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                      <p className="font-medium">{quote.formattedValidUntil}</p>
                    </div>
                  </div>
                )}
                
                {quote?.paymentTerms && (
                  <div>
                    <p className="text-sm text-muted-foreground">Ödeme Şekli</p>
                    <div className="flex items-start mt-1">
                      <CreditCard className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                      <p className="font-medium">{quote.paymentTerms}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Açıklama</TableHead>
                      <TableHead className="text-center">Miktar</TableHead>
                      <TableHead className="text-center">Birim</TableHead>
                      <TableHead className="text-right">Birim Fiyat</TableHead>
                      <TableHead className="text-right">Tutar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quote?.items?.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-center">{item.unit}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice, quote.currency)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.lineTotal, quote.currency)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-bold">Toplam</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(quote?.totalAmount, quote?.currency)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              {quote?.notes && (
                <div>
                  <h3 className="font-medium mb-2">Notlar</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{quote.notes}</p>
                </div>
              )}
            </div>
            
            <div className="md:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>Teklif Durumu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Mevcut Durum:</span>
                    <span className={`badge ${badgeClass}`}>{statusText}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Durumu Güncelle:</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={quote?.status === "pending" ? "default" : "outline"} 
                        className="w-full"
                        onClick={() => handleStatusChange("pending")}
                        disabled={quote?.status === "pending"}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>Bekliyor</span>
                      </Button>
                      
                      <Button 
                        variant={quote?.status === "approved" ? "default" : "outline"} 
                        className="w-full"
                        onClick={() => handleStatusChange("approved")}
                        disabled={quote?.status === "approved"}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        <span>Onaylandı</span>
                      </Button>
                      
                      <Button 
                        variant={quote?.status === "rejected" ? "default" : "outline"} 
                        className="w-full"
                        onClick={() => handleStatusChange("rejected")}
                        disabled={quote?.status === "rejected"}
                      >
                        <X className="h-4 w-4 mr-1" />
                        <span>Reddedildi</span>
                      </Button>
                      
                      <Button 
                        variant={quote?.status === "cancelled" ? "default" : "outline"} 
                        className="w-full"
                        onClick={() => handleStatusChange("cancelled")}
                        disabled={quote?.status === "cancelled"}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>İptal</span>
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {quote?.status === "approved" && (
                    <Button 
                      className="w-full"
                      onClick={() => navigate(`/projects/new?account=${quote?.accountId}&quote=${quote?.id}`)}
                    >
                      <ClipboardCheck className="h-4 w-4 mr-1" />
                      <span>Projeye Dönüştür</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Firma Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">{quote?.account?.name}</h3>
                    {quote?.account?.address && <p className="text-sm text-muted-foreground mt-1">{quote.account.address}</p>}
                  </div>
                  
                  {(quote?.account?.phone || quote?.account?.email) && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        {quote.account.phone && (
                          <p className="text-sm">
                            <span className="text-muted-foreground mr-2">Telefon:</span>
                            {quote.account.phone}
                          </p>
                        )}
                        
                        {quote.account.email && (
                          <p className="text-sm">
                            <span className="text-muted-foreground mr-2">E-posta:</span>
                            {quote.account.email}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                  
                  <Separator />
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/accounts/${quote?.accountId}`)}
                  >
                    <Building className="h-4 w-4 mr-1" />
                    <span>Firma Detayları</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
