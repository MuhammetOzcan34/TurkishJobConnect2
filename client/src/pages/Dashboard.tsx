import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, getStatusClass } from "@/lib/utils";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Plus, 
  Briefcase, 
  FileText, 
  CheckCircle, 
  CreditCard, 
  MoreHorizontal, 
  MoreVertical
} from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["/api/dashboard/activities"],
  });

  const { data: upcomingTasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["/api/dashboard/upcoming-tasks"],
  });

  const { data: activeProjects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["/api/dashboard/active-projects"],
  });

  const { data: recentQuotes, isLoading: isLoadingQuotes } = useQuery({
    queryKey: ["/api/dashboard/recent-quotes"],
  });

  return (
    <div className="pb-20 md:pb-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Ana Sayfa</h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center">
            <Filter className="h-4 w-4 mr-1" />
            <span>Filtrele</span>
          </Button>
          <Button 
            className="flex items-center md:flex hidden"
            onClick={() => {
              // Bu kodu CustomMenu bileşenini manuel olarak açacak şekilde uyarladık
              const event = new CustomEvent('openCreateMenu');
              window.dispatchEvent(event);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            <span>Yeni</span>
          </Button>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoadingStats ? (
          // Loading skeletons
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex justify-between">
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
              <div className="mt-4 flex items-center">
                <Skeleton className="h-4 w-20" />
              </div>
            </Card>
          ))
        ) : (
          // Actual stats
          <>
            {/* Aktif Projeler */}
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">Aktif Projeler</p>
                    <p className="text-2xl font-semibold mt-1">12</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary dark:bg-blue-900">
                    <Briefcase className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-success flex items-center">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>18%</span>
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400 ml-2">son 30 günde</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Teklifler */}
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">Bekleyen Teklifler</p>
                    <p className="text-2xl font-semibold mt-1">23</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 dark:bg-orange-900">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-error flex items-center">
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                    <span>5%</span>
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400 ml-2">son 30 günde</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Görevler */}
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">Açık Görevler</p>
                    <p className="text-2xl font-semibold mt-1">38</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 dark:bg-green-900">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-success flex items-center">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>12%</span>
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400 ml-2">son 30 günde</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Tahsilat */}
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">Toplam Alacak</p>
                    <p className="text-2xl font-semibold mt-1">₺128,500</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 dark:bg-purple-900">
                    <CreditCard className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-success flex items-center">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>8%</span>
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400 ml-2">son 30 günde</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      {/* Recent Activity + Tasks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
              <h3 className="font-medium">Son Aktiviteler</h3>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {isLoadingActivities ? (
                // Loading skeletons
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="p-4 flex">
                    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="ml-4 w-full">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-64 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))
              ) : (
                // Actual activities
                <>
                  {/* Activity 1 */}
                  <div className="p-4 flex">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary flex-shrink-0 dark:bg-blue-900">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">Yeni teklif oluşturuldu</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">ABC Şirketi için yeni bir yazılım projesi teklifi oluşturuldu</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">2 saat önce</p>
                    </div>
                  </div>
                  
                  {/* Activity 2 */}
                  <div className="p-4 flex">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 dark:bg-green-900">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">Görev tamamlandı</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">E-ticaret sitesi için tasarım revizyonları tamamlandı</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">4 saat önce</p>
                    </div>
                  </div>
                  
                  {/* Activity 3 */}
                  <div className="p-4 flex">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0 dark:bg-orange-900">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">Proje güncellendi</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">XYZ Danışmanlık projesi için tarih güncellendi</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">6 saat önce</p>
                    </div>
                  </div>
                  
                  {/* Activity 4 */}
                  <div className="p-4 flex">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0 dark:bg-purple-900">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">Yeni ödeme alındı</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Lojistik Ltd. Şti. tarafından 35.000₺ ödeme yapıldı</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Dün</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
        
        {/* Upcoming Tasks */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
              <h3 className="font-medium">Yaklaşan Görevler</h3>
              <Link href="/tasks">
                <a className="text-primary text-sm font-medium hover:underline">Tümünü Gör</a>
              </Link>
            </div>
            <div className="p-4 divide-y divide-neutral-200 dark:divide-neutral-700">
              {isLoadingTasks ? (
                // Loading skeletons
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Skeleton className="h-4 w-40 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                ))
              ) : (
                // Actual upcoming tasks
                <>
                  {/* Task 1 */}
                  <div className="py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Tasarım sunumu hazırla</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">XYZ Projesi</p>
                      </div>
                      <span className="badge badge-warning">Bugün</span>
                    </div>
                  </div>
                  
                  {/* Task 2 */}
                  <div className="py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Teklif revizyonu</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">ABC Müşterisi</p>
                      </div>
                      <span className="badge badge-warning">Yarın</span>
                    </div>
                  </div>
                  
                  {/* Task 3 */}
                  <div className="py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Proje toplantısı</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Mobil Uygulama Ekibi</p>
                      </div>
                      <span className="badge badge-neutral">2 gün</span>
                    </div>
                  </div>
                  
                  {/* Task 4 */}
                  <div className="py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Müşteri görüşmesi</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Yeni Proje Değerlendirmesi</p>
                      </div>
                      <span className="badge badge-neutral">3 gün</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Projects and Quotations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
              <h3 className="font-medium">Aktif Projeler</h3>
              <Link href="/projects">
                <a className="text-primary text-sm font-medium hover:underline">Tümünü Gör</a>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800">
                    <th className="p-4 text-neutral-500 dark:text-neutral-400 font-medium text-sm">Proje Adı</th>
                    <th className="p-4 text-neutral-500 dark:text-neutral-400 font-medium text-sm">Firma</th>
                    <th className="p-4 text-neutral-500 dark:text-neutral-400 font-medium text-sm">Durum</th>
                    <th className="p-4 text-neutral-500 dark:text-neutral-400 font-medium text-sm">Bitiş</th>
                    <th className="p-4 text-neutral-500 dark:text-neutral-400 font-medium text-sm"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {isLoadingProjects ? (
                    // Loading skeletons
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td className="p-4"><Skeleton className="h-4 w-40" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="p-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="p-4 text-right"><Skeleton className="h-6 w-6 ml-auto rounded-full" /></td>
                      </tr>
                    ))
                  ) : (
                    // Actual projects
                    <>
                      <tr>
                        <td className="p-4">E-ticaret Platformu</td>
                        <td className="p-4">ABC Şirketi</td>
                        <td className="p-4"><span className="badge badge-success">İlerliyor</span></td>
                        <td className="p-4">15 Haziran</td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4">Mobil Uygulama Geliştirme</td>
                        <td className="p-4">XYZ Teknoloji</td>
                        <td className="p-4"><span className="badge badge-warning">Risk</span></td>
                        <td className="p-4">30 Temmuz</td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4">Kurumsal Web Sitesi</td>
                        <td className="p-4">123 Holding</td>
                        <td className="p-4"><span className="badge badge-success">İlerliyor</span></td>
                        <td className="p-4">10 Ağustos</td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        
        {/* Recent Quotations */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
              <h3 className="font-medium">Son Teklifler</h3>
              <Link href="/quotes">
                <a className="text-primary text-sm font-medium hover:underline">Tümünü Gör</a>
              </Link>
            </div>
            <div className="p-4 space-y-4">
              {isLoadingQuotes ? (
                // Loading skeletons
                Array(2).fill(0).map((_, i) => (
                  <Card key={i} className="p-3">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-5 w-24 rounded-full" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-5 w-40 mt-2" />
                    <Skeleton className="h-4 w-36 mt-1" />
                    <div className="mt-3 flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </Card>
                ))
              ) : (
                // Actual quotes
                <>
                  {/* Quote 1 */}
                  <Card className="bg-neutral-50 dark:bg-neutral-800 p-3">
                    <div className="flex justify-between items-start">
                      <span className="badge badge-warning">Bekliyor</span>
                      <p className="text-lg font-medium">₺45,000</p>
                    </div>
                    <h4 className="font-medium mt-2">Web Sitesi Yenileme</h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">ABC Mobilya Ltd. Şti.</p>
                    <div className="mt-3 flex justify-between text-sm">
                      <span className="text-neutral-500 dark:text-neutral-400">FT00124</span>
                      <span className="text-neutral-500 dark:text-neutral-400">12 Mayıs</span>
                    </div>
                  </Card>
                  
                  {/* Quote 2 */}
                  <Card className="bg-neutral-50 dark:bg-neutral-800 p-3">
                    <div className="flex justify-between items-start">
                      <span className="badge badge-success">Onaylandı</span>
                      <p className="text-lg font-medium">₺78,500</p>
                    </div>
                    <h4 className="font-medium mt-2">Mobil Uygulama</h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">XYZ Teknoloji A.Ş.</p>
                    <div className="mt-3 flex justify-between text-sm">
                      <span className="text-neutral-500 dark:text-neutral-400">FT00123</span>
                      <span className="text-neutral-500 dark:text-neutral-400">8 Mayıs</span>
                    </div>
                  </Card>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
