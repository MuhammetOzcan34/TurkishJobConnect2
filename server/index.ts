import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";

console.log("[Sunucu] server/index.ts çalıştırılmaya başlanıyor...");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  // let capturedJsonResponse: Record<string, any> | undefined = undefined; // Yanıtı loglamak isterseniz bu satırı aktif edebilirsiniz.

  // const originalResJson = res.json;
  // res.json = function (bodyJson, ...args) {
  //   capturedJsonResponse = bodyJson;
  //   return originalResJson.apply(res, [bodyJson, ...args]);
  // };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} sürede: ${duration}ms`;
      // Yanıtı loglamak isterseniz:
      // if (capturedJsonResponse) {
      //   const responseBodyString = JSON.stringify(capturedJsonResponse);
      //   logLine += ` :: ${responseBodyString.substring(0, 100)}${responseBodyString.length > 100 ? "..." : ""}`;
      // }

      // logLine'ın çok uzamasını engellemek için (isteğe bağlı)
      // if (logLine.length > 200) {
      //   logLine = logLine.slice(0, 199) + "…";
      // }

      console.log(logLine); // Özel log fonksiyonu yerine console.log kullanılıyor
    }
  });

  next();
});

(async () => {
  try {
    console.log("[Sunucu] Express uygulaması başlatılıyor...");
    const server = await registerRoutes(app);
    console.log("[Sunucu] Rotalar başarıyla kaydedildi.");

    // Genel hata yakalayıcı (İstek-Yanıt döngüsü hataları)
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("[Sunucu] İstek-yanıt döngüsünde yakalanamayan hata:", err);
      const status = err.status || err.statusCode || 500;
      // const message = err.message || "Dahili Sunucu Hatası"; // İstemci için potansiyel olarak fazla bilgi

      // İstemciye sadece genel bir hata mesajı gönder
      res.status(status).json({ message: "Sunucuda bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
      // Geliştirme ortamında daha detaylı bilgi gönderebilirsiniz:
      // if (process.env.NODE_ENV === "development") {
      //   res.status(status).json({ message: err.message, stack: err.stack });
      // } else {
      //   res.status(status).json({ message: "Sunucuda bir hata oluştu." });
      // }
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[Sunucu] Geliştirme modu: Vite HMR ayarlanıyor...");
      await setupVite(app, server);
      console.log("[Sunucu] Vite HMR kurulumu tamamlandı.");
    } else {
      console.log("[Sunucu] Üretim modu: Statik dosyalar sunuluyor...");
      serveStatic(app);
      console.log("[Sunucu] Statik dosyalar yapılandırıldı.");
    }

    const port = process.env.PORT || 5000; // Vercel portunu veya varsayılanı kullan
    server.listen(port, () => { // Vercel, ana bilgisayar ve reusePort özelliklerini yönetir
      console.log(`[Sunucu] Sunucu ${port} portunda çalışıyor. NODE_ENV: ${process.env.NODE_ENV}`);
    });

  } catch (error) {
    console.error("[Sunucu] Kritik başlangıç hatası:", error);
    // Sunucu başlamazsa, Vercel çalışan bir Express örneğinden günlükleri göstermeyebilir.
    // Bu üst düzey yakalama, başlangıç hatasının kendisinin günlüğe kaydedilmesini sağlar.
    // Vercel için, fonksiyon çağrısı muhtemelen sonlanacağından açıkça çıkmanız gerekmeyebilir.
    // process.exit(1); // Bunun sunucusuz ortam için uygun olup olmadığını düşünün
  }
})();

console.log("[Sunucu] server/index.ts çalıştırılmasının sonuna ulaşıldı.");
