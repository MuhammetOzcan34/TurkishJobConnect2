import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";

// Sunucu başlangıcını işaret eden ilk log
console.log("[Sunucu] server/index.ts çalıştırılmaya başlanıyor...");

// Express uygulamasını oluştur
const app = express();
// JSON ve URL-encoded body'leri ayrıştırmak için middleware'ler
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Her istek için loglama middleware'i
app.use((req, res, next) => {
  const start = Date.now(); // İsteğin başlangıç zamanı
  const path = req.path; // İstenen yol

  // Yanıt tamamlandığında çalışacak listener
  res.on("finish", () => {
    const duration = Date.now() - start; // İsteğin süresi
    // Sadece API isteklerini logla
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} sürede: ${duration}ms`;
      // İsteğe bağlı olarak yanıt body'sini loglamak için aşağıdaki yorum satırlarını kaldırabilirsiniz.
      // let capturedJsonResponse: Record<string, any> | undefined = undefined;
      // const originalResJson = res.json;
      // res.json = function (bodyJson, ...args) {
      //   capturedJsonResponse = bodyJson;
      //   return originalResJson.apply(res, [bodyJson, ...args]);
      // };
      // if (capturedJsonResponse) {
      //   const responseBodyString = JSON.stringify(capturedJsonResponse);
      //   logLine += ` :: ${responseBodyString.substring(0, 100)}${responseBodyString.length > 100 ? "..." : ""}`;
      // }

      // Log satırının çok uzamasını engellemek için (isteğe bağlı)
      // if (logLine.length > 200) {
      //   logLine = logLine.slice(0, 199) + "…";
      // }

      // Logu konsola yazdır
      console.log(logLine);
    }
  });

  // Bir sonraki middleware'e geç
  next();
});

// Sunucuyu asenkron olarak başlatma
(async () => {
  try {
    console.log("[Sunucu] Express uygulaması başlatılıyor...");
    // Rotaları kaydet ve HTTP sunucusunu al
    const server = await registerRoutes(app);
    console.log("[Sunucu] Rotalar başarıyla kaydedildi.");

    // Genel hata yakalayıcı middleware'i
    // İstek-yanıt döngüsü sırasında oluşan yakalanamayan hataları işler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      // Sunucu tarafında hatanın tamamını logla
      console.error("[Sunucu] İstek-yanıt döngüsünde yakalanamayan hata:", err);
      // HTTP durum kodunu belirle (varsayılan 500)
      const status = err.status || err.statusCode || 500;
      // const message = err.message || "Dahili Sunucu Hatası"; // İstemci için potansiyel olarak fazla bilgi

      // İstemciye sadece genel bir hata mesajı gönder (güvenlik için)
      res.status(status).json({ message: "Sunucuda bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
      // Geliştirme ortamında daha detaylı bilgi göndermek isterseniz aşağıdaki yorum satırlarını kullanın:
      // if (process.env.NODE_ENV === "development") {
      //   res.status(status).json({ message: err.message, stack: err.stack });
      // } else {
      //   res.status(status).json({ message: "Sunucuda bir hata oluştu." });
      // }
    });

    // Ortama göre Vite veya statik dosyaları ayarla
    if (process.env.NODE_ENV === "development") {
      console.log("[Sunucu] Geliştirme modu: Vite HMR ayarlanıyor...");
      await setupVite(app, server); // Vite geliştirme sunucusunu kur
      console.log("[Sunucu] Vite HMR kurulumu tamamlandı.");
    } else {
      console.log("[Sunucu] Üretim modu: Statik dosyalar sunuluyor...");
      serveStatic(app); // Statik dosya sunumunu ayarla
      console.log("[Sunucu] Statik dosyalar yapılandırıldı.");
    }

    // Sunucuyu belirtilen portta dinlemeye başla
    // Vercel, PORT ortam değişkenini ayarlar, yoksa varsayılan 5000 kullanılır.
    // Vercel, ana bilgisayar ve reusePort özelliklerini kendisi yönetir.
    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`[Sunucu] Sunucu ${port} portunda çalışıyor. Ortam: ${process.env.NODE_ENV}`);
    });

  } catch (error) {
    // Sunucu başlangıcında oluşan kritik hataları yakala ve logla
    console.error("[Sunucu] Kritik başlangıç hatası:", error);
    // Sunucu başlangıçta çökerse, Vercel normal çalışma zamanı loglarını göstermeyebilir.
    // Bu üst düzey yakalama, başlangıç hatasının kendisinin loglanmasını sağlar.
    // Vercel gibi sunucusuz ortamlarda process.exit(1) çağırmak genellikle gerekli değildir,
    // çünkü fonksiyon çağrısı hata sonrası zaten sonlanacaktır.
    // process.exit(1); // Sunucusuz ortam için uygunluğunu değerlendirin
  }
})();

// Dosyanın sonuna ulaşıldığını belirten log
console.log("[Sunucu] server/index.ts çalıştırılmasının sonuna ulaşıldı.");
