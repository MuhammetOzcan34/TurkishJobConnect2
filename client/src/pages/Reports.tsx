import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { format, subMonths } from "date-fns";
import { tr } from "date-fns/locale";

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function Reports() {
  const [reportType, setReportType] = useState("financial");
  
  const { data: financialData, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ["/api/reports/financial"],
    enabled: reportType === "financial",
  });
  
  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["/api/reports/projects"],
    enabled: reportType === "projects",
  });
  
  const { data: quotesData, isLoading: isLoadingQuotes } = useQuery({
    queryKey: ["/api/reports/quotes"],
    enabled: reportType === "quotes",
  });
  
  // Calculate monthly data for financial report
  const getMonthlyData = () => {
    if (!financialData || !financialData.monthly_income || !financialData.monthly_expense) return [];
    
    const monthlyData = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const month = format(date, "MMM", { locale: tr });
      
      const income = (financialData.monthly_income && financialData.monthly_income[i]) || 0;
      const expense = (financialData.monthly_expense && financialData.monthly_expense[i]) || 0;
      
      monthlyData.push({
        name: month,
        Gelir: income,
        Gider: expense,
        Kâr: income - expense,
      });
    }
    
    return monthlyData;
  };
  
  // Format project status data for pie chart
  const getProjectStatusData = () => {
    if (!projectsData || !projectsData.status_counts) return [];
    
    return [
      { name: "Aktif", value: projectsData.status_counts?.active || 0 },
      { name: "Tamamlandı", value: projectsData.status_counts?.completed || 0 },
      { name: "Beklemede", value: projectsData.status_counts?.on_hold || 0 },
      { name: "İptal", value: projectsData.status_counts?.cancelled || 0 },
    ].filter(item => item.value > 0);
  };
  
  // Format quote status data for pie chart
  const getQuoteStatusData = () => {
    if (!quotesData || !quotesData.status_counts) return [];
    
    return [
      { name: "Beklemede", value: quotesData.status_counts?.pending || 0 },
      { name: "Onaylandı", value: quotesData.status_counts?.approved || 0 },
      { name: "Reddedildi", value: quotesData.status_counts?.rejected || 0 },
      { name: "İptal", value: quotesData.status_counts?.cancelled || 0 },
    ].filter(item => item.value > 0);
  };
  
  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Raporlar</h2>
      </div>
      
      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList className="mb-6">
          <TabsTrigger value="financial">Finansal Rapor</TabsTrigger>
          <TabsTrigger value="projects">Proje Raporu</TabsTrigger>
          <TabsTrigger value="quotes">Teklif Raporu</TabsTrigger>
        </TabsList>
        
        {/* Financial Report */}
        <TabsContent value="financial">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Gelir
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingFinancial ? (
                  <Skeleton className="h-8 w-28" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {formatCurrency(financialData?.total_income || 0, "TRY")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Son 30 günde: {formatCurrency(financialData?.recent_income || 0, "TRY")}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Gider
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingFinancial ? (
                  <Skeleton className="h-8 w-28" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {formatCurrency(financialData?.total_expense || 0, "TRY")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Son 30 günde: {formatCurrency(financialData?.recent_expense || 0, "TRY")}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Net Kâr
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingFinancial ? (
                  <Skeleton className="h-8 w-28" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {formatCurrency((financialData?.total_income || 0) - (financialData?.total_expense || 0), "TRY")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Son 30 günde: {formatCurrency((financialData?.recent_income || 0) - (financialData?.recent_expense || 0), "TRY")}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Aylık Gelir ve Gider</CardTitle>
              <CardDescription>
                Son 6 aylık gelir, gider ve kâr grafiği
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingFinancial ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getMonthlyData()}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number, "TRY")} />
                      <Legend />
                      <Bar dataKey="Gelir" fill="#8884d8" />
                      <Bar dataKey="Gider" fill="#82ca9d" />
                      <Bar dataKey="Kâr" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Projects Report */}
        <TabsContent value="projects">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Proje
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingProjects ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {projectsData?.total_count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Bu ay: {projectsData?.month_count || 0} yeni proje
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Aktif Projeler
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingProjects ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {projectsData?.status_counts?.active || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Toplam projelerin {projectsData?.total_count 
                        ? Math.round((projectsData?.status_counts?.active || 0) / projectsData.total_count * 100) 
                        : 0}%'i
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tamamlanan Projeler
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingProjects ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {projectsData?.status_counts?.completed || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Toplam projelerin {projectsData?.total_count 
                        ? Math.round((projectsData?.status_counts?.completed || 0) / projectsData.total_count * 100) 
                        : 0}%'i
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Proje Durumları</CardTitle>
                <CardDescription>
                  Durumlara göre proje dağılımı
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProjects ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getProjectStatusData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getProjectStatusData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} proje`, ""]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Proje Değerleri</CardTitle>
                <CardDescription>
                  Projelerin mali değerleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProjects ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-medium mb-2">Toplam Proje Değeri</p>
                      <p className="text-2xl font-bold">{formatCurrency(projectsData?.total_value || 0, "TRY")}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Aktif Projeler Değeri</p>
                      <p className="text-xl font-semibold">{formatCurrency(projectsData?.active_value || 0, "TRY")}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Tamamlanan Projeler Değeri</p>
                      <p className="text-xl font-semibold">{formatCurrency(projectsData?.completed_value || 0, "TRY")}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Ortalama Proje Değeri</p>
                      <p className="text-xl font-semibold">{formatCurrency(projectsData?.average_value || 0, "TRY")}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Quotes Report */}
        <TabsContent value="quotes">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Teklif
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingQuotes ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {quotesData?.total_count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Bu ay: {quotesData?.month_count || 0} yeni teklif
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Onaylanan Teklifler
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingQuotes ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {quotesData?.status_counts?.approved || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Toplam tekliflerin {quotesData?.total_count 
                        ? Math.round((quotesData?.status_counts?.approved || 0) / quotesData.total_count * 100) 
                        : 0}%'i
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Reddedilen Teklifler
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingQuotes ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {quotesData?.status_counts?.rejected || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Toplam tekliflerin {quotesData?.total_count 
                        ? Math.round((quotesData?.status_counts?.rejected || 0) / quotesData.total_count * 100) 
                        : 0}%'i
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Teklif Durumları</CardTitle>
                <CardDescription>
                  Durumlara göre teklif dağılımı
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingQuotes ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getQuoteStatusData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getQuoteStatusData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} teklif`, ""]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Teklif Değerleri</CardTitle>
                <CardDescription>
                  Tekliflerin mali değerleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingQuotes ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-medium mb-2">Toplam Teklif Değeri</p>
                      <p className="text-2xl font-bold">{formatCurrency(quotesData?.total_value || 0, "TRY")}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Onaylanan Teklifler Değeri</p>
                      <p className="text-xl font-semibold">{formatCurrency(quotesData?.approved_value || 0, "TRY")}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Bekleyen Teklifler Değeri</p>
                      <p className="text-xl font-semibold">{formatCurrency(quotesData?.pending_value || 0, "TRY")}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Ortalama Teklif Değeri</p>
                      <p className="text-xl font-semibold">{formatCurrency(quotesData?.average_value || 0, "TRY")}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}