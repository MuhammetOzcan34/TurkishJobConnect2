import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Help() {
  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <h2 className="text-2xl font-semibold">Yardım</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>İş Takip Sistemi Hakkında</CardTitle>
          <CardDescription>
            İş takip sisteminizi daha etkin kullanmak için yardım ve ipuçları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Bu iş takip sistemi, işletmenizin müşteri ilişkilerinizi, projelerinizi, tekliflerinizi ve görevlerinizi kolayca yönetmenize yardımcı olmak için tasarlanmıştır. Aşağıdaki bölümlerden, sistemin farklı özelliklerini nasıl kullanacağınıza dair detaylı bilgiye ulaşabilirsiniz.</p>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Cari Hesaplar</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">Cari Hesaplar modülü ile müşteri ve tedarikçilerinizin bilgilerini yönetebilirsiniz.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Cari hesap oluşturmak için "Yeni Cari Hesap" butonunu kullanın.</li>
                  <li>Cari hesap türünü "Müşteri" veya "Tedarikçi" olarak belirleyebilirsiniz.</li>
                  <li>Cari hesap detay sayfasında ilgili firmaya ait tüm projeler, teklifler ve görevleri görüntüleyebilirsiniz.</li>
                  <li>Cari hesap hareketleri sekmesinden, firma ile olan tüm finansal işlemleri takip edebilirsiniz.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>Teklifler</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">Teklifler modülü ile müşterilere sunduğunuz veya tedarikçilerden aldığınız teklifleri yönetebilirsiniz.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Yeni teklif oluşturmak için "Yeni Teklif" butonunu kullanın.</li>
                  <li>Tekliflere kalem ekleyerek detaylı fiyatlandırma yapabilirsiniz.</li>
                  <li>Teklifleri PDF olarak dışa aktarabilir ve e-posta ile paylaşabilirsiniz.</li>
                  <li>Teklif durumunu Beklemede, Onaylandı, Reddedildi veya İptal olarak güncelleyebilirsiniz.</li>
                  <li>Onaylanan tekliflerden doğrudan proje oluşturabilirsiniz.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>Projeler</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">Projeler modülü ile aktif ve tamamlanmış projelerinizi yönetebilirsiniz.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Yeni proje oluşturmak için "Yeni Proje" butonunu kullanın.</li>
                  <li>Projelere görev ekleyerek iş takibi yapabilirsiniz.</li>
                  <li>Proje durumunu Aktif, Tamamlandı, Beklemede veya İptal olarak güncelleyebilirsiniz.</li>
                  <li>Proje detay sayfasında projeye ait tüm görevleri kanban görünümünde takip edebilirsiniz.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>Görevler</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">Görevler modülü ile tüm projelerinize ait görevleri kanban tahtası üzerinde yönetebilirsiniz.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Yeni görev oluşturmak için "Yeni Görev" butonunu kullanın.</li>
                  <li>Görevleri bir projeden diğerine taşıyabilirsiniz.</li>
                  <li>Görevlerin durumunu sürükle-bırak yöntemiyle değiştirebilirsiniz.</li>
                  <li>Görevlere öncelik atayarak önem sırasına göre çalışabilirsiniz.</li>
                  <li>Görevlere bitiş tarihi ekleyerek zamanında tamamlanmasını sağlayabilirsiniz.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>Raporlar</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">Raporlar modülü ile işletmenizin performansını analiz edebilirsiniz.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Finansal Rapor: Gelir, gider ve kâr analizleri</li>
                  <li>Proje Raporu: Proje durumları ve değer analizleri</li>
                  <li>Teklif Raporu: Teklif durumları ve dönüşüm oranları</li>
                  <li>Raporları belirli tarih aralıklarına göre filtreleyebilirsiniz.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Sık Sorulan Sorular</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger>Nasıl yeni bir cari hesap oluşturabilirim?</AccordionTrigger>
              <AccordionContent>
                Cari Hesaplar sayfasında sağ üstteki "Yeni Cari Hesap" butonuna tıklayarak yeni bir cari hesap oluşturabilirsiniz. Açılan formda gerekli bilgileri doldurduktan sonra "Kaydet" butonuna tıklamanız yeterlidir.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-2">
              <AccordionTrigger>Nasıl teklif oluşturup PDF olarak kaydedebilirim?</AccordionTrigger>
              <AccordionContent>
                Teklifler sayfasında "Yeni Teklif" butonuna tıklayarak yeni bir teklif oluşturabilirsiniz. Teklifi kaydettikten sonra, teklif detay sayfasında "Yazdır" butonuna tıklayarak PDF olarak kaydedebilirsiniz.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-3">
              <AccordionTrigger>Görevleri nasıl yönetebilirim?</AccordionTrigger>
              <AccordionContent>
                Görevler sayfasında tüm görevlerinizi kanban tahtası üzerinde görüntüleyebilirsiniz. Görevleri sürükleyerek durumlarını değiştirebilirsiniz. Yeni görev eklemek için "Yeni Görev" butonunu kullanabilirsiniz.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-4">
              <AccordionTrigger>Şifremi nasıl değiştirebilirim?</AccordionTrigger>
              <AccordionContent>
                Ayarlar sayfasının "Güvenlik" sekmesinden şifrenizi değiştirebilirsiniz. Önce mevcut şifrenizi, ardından yeni şifrenizi iki kez girmeniz gerekecektir.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-5">
              <AccordionTrigger>Uygulamayı mobil cihazda kullanabilir miyim?</AccordionTrigger>
              <AccordionContent>
                Evet, uygulamamız tamamen mobil uyumludur. Mobil tarayıcınızdan giriş yaparak tüm özelliklere erişebilirsiniz. Ayrıca, ana ekranınıza kısayol ekleyerek uygulamayı daha kolay açabilirsiniz.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>İletişim</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Başka sorularınız varsa, lütfen bizimle iletişime geçin:</p>
          <div className="mt-4">
            <p className="flex items-center"><span className="font-medium w-24">E-posta:</span> destek@isyonetim.com</p>
            <p className="flex items-center mt-2"><span className="font-medium w-24">Telefon:</span> +90 212 123 45 67</p>
            <p className="flex items-center mt-2"><span className="font-medium w-24">Çalışma Saatleri:</span> Pazartesi - Cuma, 09:00 - 18:00</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}