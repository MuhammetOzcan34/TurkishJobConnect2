import { Router, Request, Response } from 'express';

const router = Router();

// Dashboard stats endpoint
router.get('/dashboard/stats', (req: Request, res: Response) => {
  // Örnek veri
  const stats = {
    activeProjects: 12,
    pendingQuotes: 23,
    openTasks: 38,
    totalReceivables: 128500
  };
  
  res.json(stats);
});

// Dashboard activities endpoint
router.get('/dashboard/activities', (req: Request, res: Response) => {
  // Örnek veri
  const activities = [
    {
      id: 1,
      type: 'quote',
      title: 'Yeni teklif oluşturuldu',
      description: 'ABC Şirketi için yeni bir yazılım projesi teklifi oluşturuldu',
      time: '2 saat önce'
    },
    {
      id: 2,
      type: 'task',
      title: 'Görev tamamlandı',
      description: 'E-ticaret sitesi için tasarım revizyonları tamamlandı',
      time: '4 saat önce'
    },
    {
      id: 3,
      type: 'project',
      title: 'Proje güncellendi',
      description: 'XYZ Danışmanlık projesi için tarih güncellendi',
      time: '6 saat önce'
    },
    {
      id: 4,
      type: 'payment',
      title: 'Yeni ödeme alındı',
      description: 'Lojistik Ltd. Şti. tarafından 35.000₺ ödeme yapıldı',
      time: 'Dün'
    }
  ];
  
  res.json(activities);
});

// Dashboard upcoming tasks endpoint
router.get('/dashboard/upcoming-tasks', (req: Request, res: Response) => {
  // Örnek veri
  const upcomingTasks = [
    {
      id: 1,
      title: 'Tasarım sunumu hazırla',
      project: 'XYZ Projesi',
      dueDate: 'Bugün'
    },
    {
      id: 2,
      title: 'Teklif revizyonu',
      project: 'ABC Müşterisi',
      dueDate: 'Yarın'
    },
    {
      id: 3,
      title: 'Proje toplantısı',
      project: 'Mobil Uygulama Ekibi',
      dueDate: '2 gün'
    },
    {
      id: 4,
      title: 'Müşteri görüşmesi',
      project: 'Yeni Proje Değerlendirmesi',
      dueDate: '3 gün'
    }
  ];
  
  res.json(upcomingTasks);
});

// Dashboard active projects endpoint
router.get('/dashboard/active-projects', (req: Request, res: Response) => {
  // Örnek veri
  const activeProjects = [
    {
      id: 1,
      name: 'E-ticaret Platformu',
      company: 'ABC Şirketi',
      status: 'İlerliyor',
      endDate: '15 Haziran'
    },
    {
      id: 2,
      name: 'Mobil Uygulama Geliştirme',
      company: 'XYZ Teknoloji',
      status: 'Risk',
      endDate: '30 Temmuz'
    },
    {
      id: 3,
      name: 'Kurumsal Web Sitesi',
      company: '123 Holding',
      status: 'İlerliyor',
      endDate: '10 Ağustos'
    }
  ];
  
  res.json(activeProjects);
});

// Dashboard recent quotes endpoint
router.get('/dashboard/recent-quotes', (req: Request, res: Response) => {
  // Örnek veri
  const recentQuotes = [
    {
      id: 1,
      status: 'Bekliyor',
      amount: 45000,
      title: 'Web Sitesi Yenileme',
      company: 'ABC Mobilya Ltd. Şti.',
      number: 'FT00124',
      date: '12 Mayıs'
    },
    {
      id: 2,
      status: 'Onaylandı',
      amount: 78500,
      title: 'Mobil Uygulama',
      company: 'XYZ Teknoloji A.Ş.',
      number: 'FT00123',
      date: '8 Mayıs'
    }
  ];
  
  res.json(recentQuotes);
});

export default router;
