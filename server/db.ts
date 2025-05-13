import { neon, NeonDatabase } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import ws from "ws"; // WebSocket constructor'ı sağlamak için
import * as schema from "@shared/schema"; // Paylaşılan şemalarınız

// NeonDB için WebSocket yapılandırması (gerekliyse)
// neonConfig.webSocketConstructor = ws; // Bu satır genellikle @neondatabase/serverless'ın Pool'u ile kullanılır.
                                     // neon-http için genellikle gerekli değildir. Şimdilik yorumda bırakalım.

// Veritabanı örneğini tutacak değişken
let dbInstance: NeonHttpDatabase<typeof schema>;

/**
 * Veritabanı bağlantısını başlatan ve test eden asenkron fonksiyon.
 * Bu fonksiyon, sunucu başlangıcında çağrılmalıdır.
 */
async function initializeDbConnection() {
  // DATABASE_URL ortam değişkeninin ayarlanıp ayarlanmadığını kontrol et
  if (!process.env.DATABASE_URL) {
    console.error("[VERİTABANI] HATA: DATABASE_URL ortam değişkeni ayarlanmamış!");
    throw new Error(
      "DATABASE_URL ayarlanmalı. Veritabanının Vercel ortam değişkenlerinde doğru şekilde tanımlandığından emin olun.",
    );
  }

  try {
    console.log("[VERİTABANI] Supabase/Neon veritabanı bağlantısı deneniyor...");
    // @neondatabase/serverless'ten neon fonksiyonunu kullanarak SQL sorgu arayüzünü oluştur
    const sql = neon(process.env.DATABASE_URL);
    // Drizzle ORM'i neon-http adaptörü ile başlat
    dbInstance = drizzle(sql, { schema });

    // Bağlantıyı test etmek için basit bir sorgu çalıştır
    await dbInstance.select({ mevcutZaman: schema.sql`now()` });
    console.log("[VERİTABANI] Veritabanı bağlantısı başarıyla kuruldu ve test edildi.");

  } catch (error) {
    console.error("[VERİTABANI] HATA: Veritabanı bağlantısı kurulamadı veya test sorgusu başarısız oldu:", error);
    // Hatayı tekrar fırlat ki sunucu başlangıcındaki try-catch bloğu yakalayabilsin
    throw error;
  }
}

/**
 * Başlatılmış veritabanı örneğini döndüren fonksiyon.
 * Bu fonksiyon, initializeDbConnection çağrıldıktan sonra kullanılmalıdır.
 * @returns {NeonHttpDatabase<typeof schema>} Drizzle veritabanı örneği
 * @throws {Error} Veritabanı başlatılmamışsa hata fırlatır.
 */
function getDb() {
  if (!dbInstance) {
    // Bu durum idealde, initializeDbConnection sunucu başlangıcında çağrıldığı için oluşmamalıdır.
    // Ancak bir yedek olarak veya başlatmanın garanti edilmediği bir bağlamda kullanılırsa:
    console.error("[VERİTABANI] HATA: Veritabanı örneği başlatılmamış. Lütfen önce initializeDbConnection çağırın.");
    throw new Error("Veritabanı başlatılmadı. Sunucu yapılandırmasını kontrol edin.");
  }
  return dbInstance;
}

// Fonksiyonları dışa aktar
export { initializeDbConnection, getDb };
