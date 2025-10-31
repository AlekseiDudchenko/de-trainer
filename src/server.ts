import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.static(path.join(__dirname, "..", "public")));


const DATA_DIR = path.join(__dirname, "..", "data");
const GAPS_FILE = path.join(DATA_DIR, "gaps.json");

type Gap = {
  id: number;
  sentence: string;
  answer: string;
};

function readGaps(): Gap[] {
  if (!fs.existsSync(GAPS_FILE)) return [];
  const raw = fs.readFileSync(GAPS_FILE, "utf8");
  return JSON.parse(raw) as Gap[];
}

app.get('/', (_req, res) => {
  res.send('ok from fly.io');
});

app.get("/api/gaps/one", (_req: Request, res: Response) => {
  const gaps = readGaps();
  const gap = gaps[Math.floor(Math.random() * gaps.length)];
  res.json(gap); // { id, sentence, answer }
  console.log("call to /api/gaps/one. Gap:", gap);
});

app.get("/api/words", (_req: Request, res: Response) => {
  const filePath = path.join(__dirname, "..", "data", "words.json");
  const raw = fs.readFileSync(filePath, "utf8");
  res.json(JSON.parse(raw));
  console.log("call to /api/words");
});

app.get("/api/sentences/:level", (req: Request, res: Response) => {
  const level = req.params.level.toLowerCase(); // a1, a2, b1 ...
  const file = path.join(DATA_DIR, `sentences-${level}.json`);
  if (!fs.existsSync(file)) {
    return res.status(404).json({ error: "sentences file not found" });
  }
  const raw = fs.readFileSync(file, "utf8");
  res.json(JSON.parse(raw));
});

app.get("/api/sentences", (_req: Request, res: Response) => {
  const filePath = path.join(__dirname, "..", "data", "sentences.json");
  const raw = fs.readFileSync(filePath, "utf8");
  res.json(JSON.parse(raw));
  console.log("call to /api/sentences");
});

app.get("/api/gaps", (_req: Request, res: Response) => {
  const filePath = path.join(__dirname, "..", "data", "gaps.json");
  const raw = fs.readFileSync(filePath, "utf8");
  res.json(JSON.parse(raw));
  console.log("call to /api/gaps");
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`listening on ${PORT}`);
});
