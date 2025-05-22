import { Router } from "express";
import { storage } from "../storage";

const router = Router();

router.get("/quotes/:id", async (req, res, next) => {
  try {
    const quote = await storage.getQuote(Number(req.params.id));
    if (!quote) return res.status(404).json({ message: "Teklif bulunamadı" });

    // Account bilgisini de ekle
    const account = await storage.getAccount(quote.accountId);
    res.json({
      ...quote,
      account, // account objesini ekle
    });
  } catch (err) {
    next(err);
  }
});

export default router;