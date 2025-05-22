import { Router, Request, Response, NextFunction } from "express";
import { insertUserSchema } from "../../shared/validation";
import { storage } from "../storage";
import bcrypt from "bcryptjs";
import { z } from "zod";

const router = Router();

router.post("/users", async (req: Request, res: Response, next: NextFunction) => {
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
    next(error);
  }
});

router.get("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await storage.getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

export default router;