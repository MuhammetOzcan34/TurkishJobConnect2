import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db'; // Veritabanı bağlantınızı buradan import edin (örneğin '../db/index.ts')
import { users, insertUserSchema } from '@shared/schema';
import { ZodError } from 'zod';

const router = Router();

router.post('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const result = await db.insert(users).values({
      username: validatedData.username,
      password: hashedPassword, // Hash'lenmiş şifreyi kaydet
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      position: validatedData.position,
      // companyName alanı schema.ts'de var ama UserForm'dan gelmiyor.
      // Eğer gerekliyse UserForm'a ekleyin veya burada varsayılan bir değer atayın.
      // companyName: validatedData.companyName || null, 
    }).returning();

    if (result.length === 0) {
      return res.status(500).json({ message: "Kullanıcı oluşturulamadı." });
    }

    res.status(201).json(result[0]);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: "Geçersiz veri", errors: error.errors });
    }
    next(error); // Genel hata yakalayıcıya ilet
  }
});

export default router;