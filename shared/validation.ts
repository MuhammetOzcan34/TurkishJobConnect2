import { z } from "zod";

// Kullanıcı ekleme şeması
export const insertUserSchema = z.object({
  username: z.string().min(3, { message: "Kullanıcı adı en az 3 karakter olmalı" }),
  password: z.string().min(6, { message: "Şifre en az 6 karakter olmalı" }),
  name: z.string().min(2, { message: "Ad Soyad en az 2 karakter olmalı" }),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
  phone: z.string().optional(),
  position: z.string().optional(),
});