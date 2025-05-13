import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";

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
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
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
  const server = await registerRoutes(app);

  // Genel hata yakalayıcı
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err); // Sunucu tarafında hatayı logla
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // İstemciye sadece genel bir hata mesajı gönder
    res.status(status).json({ message: "Sunucuda bir hata oluştu." }); 
    // Geliştirme ortamında daha detaylı bilgi gönderebilirsiniz:
    // if (app.get("env") === "development") {
    //   res.status(status).json({ message, stack: err.stack });
    // } else {
    //   res.status(status).json({ message: "Sunucuda bir hata oluştu." });
    // }
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    console.log(`Sunucu ${port} portunda çalışıyor`); // Özel log fonksiyonu yerine console.log
  });
})();
