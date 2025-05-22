import express from "express";
import { registerRoutes } from "./routes";

const app = express();
app.use(express.json());

registerRoutes(app);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});