import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { initializeDbConnection } from "./db"; // Veritabanı başlatma fonksiyonunu import et

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
      console.log(logLine); // Logu konsola yazdır
    }
  });

  // Bir sonraki middleware'e geç
  next();
});

// Sunucuyu asenkron olarak başlatma
(async () => {
  try {
    // Önce veritabanı bağlantısını başlatmayı dene
    console.log("[Sunucu] Veritabanı bağlantısı başlatılıyor...");
    await initializeDbConnection();
    console.log("[Sunucu] Veritabanı bağlantısı başarıyla kuruldu.");

    console.log("[Sunucu] Express uygulaması başlatılıyor...");
    // Rotaları kaydet ve HTTP sunucusunu al
    const server = await registerRoutes(app);
    console.log("[Sunucu] Rotalar başarıyla kaydedildi.");

    // Genel hata yakalayıcı middleware'i
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("[Sunucu] İstek-yanıt döngüsünde yakalanamayan hata:", err);
      const status = err.status || err.statusCode || 500;
      res.status(status).json({ message: "Sunucuda bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
    });

    // Ortama göre Vite veya statik dosyaları ayarla
    if (process.env.NODE_ENV === "development") {
      console.log("[Sunucu] Geliştirme modu: Vite HMR ayarlanıyor...");
      await setupVite(app, server);
      console.log("[Sunucu] Vite HMR kurulumu tamamlandı.");
    } else {
      console.log("[Sunucu] Üretim modu: Statik dosyalar sunuluyor...");
      serveStatic(app);
      console.log("[Sunucu] Statik dosyalar yapılandırıldı.");
    }

    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`[Sunucu] Sunucu ${port} portunda çalışıyor. Ortam: ${process.env.NODE_ENV}`);
    });

  } catch (error) {
    // Sunucu başlangıcında (veritabanı veya Express) oluşan kritik hataları yakala ve logla
    console.error("[Sunucu] Kritik başlangıç hatası (veritabanı veya Express):", error);
    // Vercel gibi ortamlarda, bu hata fonksiyonun sonlanmasına neden olabilir.
    // process.exit(1) genellikle gerekli değildir.
  }
})();

// Dosyanın sonuna ulaşıldığını belirten log
console.log("[Sunucu] server/index.ts çalıştırılmasının sonuna ulaşıldı.");
