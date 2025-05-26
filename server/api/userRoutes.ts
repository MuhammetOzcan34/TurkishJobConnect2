import { Router, Request, Response } from "express";
import { insertUserSchema } from "../../shared/validation";
import { storage } from "../storage";
import bcrypt from "bcryptjs";
import { z } from "zod";
import dashboardRoutes from "./api/dashboardRoutes";
import userRoutes from "./api/userRoutes";
import { useQuery } from "react-query";

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

// Kullanıcıları getir
router.get("/users", async (req: Request, res: Response) => {
  res.json([{ id: 1, name: "Admin", email: "admin@example.com" }]); // Örnek veri
});

const { data: stats } = useQuery({
  queryKey: [`${import.meta.env.VITE_API_URL}/dashboard/stats`],
});

export async function registerRoutes(app: Express) {
  app.use("/api", dashboardRoutes);
  app.use("/api", userRoutes);
}

export default router;