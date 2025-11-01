import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const IS_DEV = process.env.NODE_ENV !== "production";

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const DATA_DIR = path.join(__dirname, "..", "data");

app.use(express.static(PUBLIC_DIR));

type Gap = { id: number; sentence: string; answer: string };
type Sentence = { /* твои поля */ };

// ---- simple in-memory cache ----
const cache = {
  gaps: [] as Gap[],
  words: [] as any[],
  sentencesDefault: [] as any[],
  sentencesByLevel: new Map<string, any[]>(),
};

function loadJSON<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

// загрузка при старте
cache.gaps = loadJSON<Gap[]>(path.join(DATA_DIR, "gaps.json")) ?? [];
cache.words = loadJSON<any[]>(path.join(DATA_DIR, "words.json")) ?? [];
cache.sentencesDefault = loadJSON<any[]>(path.join(DATA_DIR, "sentences.json")) ?? [];

// helper: получить предложения по уровню
function getSentencesByLevel(level: string): any[] {
  const key = level.toLowerCase();
  // в деве можно перечитывать файл каждый раз
  if (IS_DEV) {
    const file = path.join(DATA_DIR, `sentences-${key}.json`);
    return loadJSON<any[]>(file) ?? [];
  }
  // в проде читаем из кэша
  if (cache.sentencesByLevel.has(key)) {
    return cache.sentencesByLevel.get(key)!;
  }
  const file = path.join(DATA_DIR, `sentences-${key}.json`);
  const data = loadJSON<any[]>(file) ?? [];
  cache.sentencesByLevel.set(key, data);
  return data;
}

app.get("/", (_req, res) => {
  res.send("ok from fly.io");
});

app.get("/api/gaps/one", (_req: Request, res: Response) => {
  const gaps = IS_DEV
    ? loadJSON<Gap[]>(path.join(DATA_DIR, "gaps.json")) ?? cache.gaps
    : cache.gaps;

  const gap = gaps[Math.floor(Math.random() * gaps.length)];
  res.json(gap);
});

app.get("/api/words", (_req: Request, res: Response) => {
  const words = IS_DEV
    ? loadJSON<any[]>(path.join(DATA_DIR, "words.json")) ?? cache.words
    : cache.words;
  res.json(words);
});

app.get("/api/sentences/:level", (req: Request, res: Response) => {
  const level = req.params.level.toLowerCase();
  console.log(`Loading sentences for level: ${level}`);
  const data = getSentencesByLevel(level);
  if (!data.length) {
    return res.status(404).json({ error: "sentences file not found" });
  }
  res.json(data);
});

app.get("/api/sentences", (_req: Request, res: Response) => {
  const data = IS_DEV
    ? loadJSON<any[]>(path.join(DATA_DIR, "sentences.json")) ?? cache.sentencesDefault
    : cache.sentencesDefault;
  res.json(data);
});

app.get(/^\/(?!api\/).*/, (req, res, next) => {
  if (req.method !== "GET") return next();
  if (req.path.includes(".")) return next(); // let static serve real files
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`listening on ${PORT}`);
});
