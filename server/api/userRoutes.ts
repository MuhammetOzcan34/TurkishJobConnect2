import { Router, Request, Response } from "express";
import { insertUserSchema } from "../../shared/validation";
import { storage } from "../storage";
import bcrypt from "bcryptjs";
import { z } from "zod";

const router = Router();

router.post("/users", async (req: Request, res: Response) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const createdUser = await storage.createUser({
      ...validatedData,
      password: hashedPassword,
      companyName: validatedData.companyName ?? null,
      phone: validatedData.phone ?? null,
      position: validatedData.position ?? null,
    });
    res.status(201).json(createdUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Geçersiz veri", errors: error.errors });
    }
    // Diğer hataları Express'in async hata yakalayıcısının işlemesi için yeniden fırlat
    throw error;
  }
});

router.get("/users", async (req: Request, res: Response) => {
  // Express 5+ kullanılıyorsa, async route handler'larındaki hatalar otomatik olarak yakalanır.
  // storage.getUsers() bir hata fırlatırsa, Express bunu hata işleme ara katmanına iletecektir.
  const users = await storage.getUsers();
  res.json(users);
});

export default router;