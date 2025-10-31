import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";

const app = express();
const PORT = 3000;

// статика
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/words", (_req: Request, res: Response) => {
  const filePath = path.join(__dirname, "..", "data", "words.json");
  const raw = fs.readFileSync(filePath, "utf8");
  res.json(JSON.parse(raw));
});

app.get("/api/sentences", (_req: Request, res: Response) => {
  const filePath = path.join(__dirname, "..", "data", "sentences.json");
  const raw = fs.readFileSync(filePath, "utf8");
  res.json(JSON.parse(raw));
});

app.get("/api/gaps", (_req: Request, res: Response) => {
  const filePath = path.join(__dirname, "..", "data", "gaps.json");
  const raw = fs.readFileSync(filePath, "utf8");
  res.json(JSON.parse(raw));
});

app.listen(PORT, () => {
  console.log(`Trainer (TS) running on http://localhost:${PORT}`);
});
