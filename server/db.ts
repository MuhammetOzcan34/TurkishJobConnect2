import { neon } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

let dbInstance: NeonHttpDatabase<typeof schema>;

async function initializeDbConnection() {
  if (!process.env.DATABASE_URL) {
    console.error("[VERİTABANI] HATA: DATABASE_URL ortam değişkeni ayarlanmamış!");
    throw new Error(
      "DATABASE_URL ayarlanmalı. Veritabanının Vercel ortam değişkenlerinde doğru şekilde tanımlandığından emin olun.",
    );
  }

  try {
    console.log("[VERİTABANI] Supabase/Neon veritabanı bağlantısı deneniyor...");
    const sql = neon(process.env.DATABASE_URL);
    dbInstance = drizzle(sql, { schema });
    // Eğer schema.sql yoksa, doğrudan bir sorgu yaz:
    await dbInstance.execute("SELECT NOW()");
    console.log("[VERİTABANI] Veritabanı bağlantısı başarıyla kuruldu ve test edildi.");
  } catch (error) {
    console.error("[VERİTABANI] HATA: Veritabanı bağlantısı kurulamadı veya test sorgusu başarısız oldu:", error);
    throw error;
  }
}

function getDb() {
  if (!dbInstance) {
    console.error("[VERİTABANI] HATA: Veritabanı örneği başlatılmamış. Lütfen önce initializeDbConnection çağırın.");
    throw new Error("Veritabanı başlatılmadı. Sunucu yapılandırmasını kontrol edin.");
  }
  return dbInstance;
}

export { initializeDbConnection, getDb };