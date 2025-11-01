export type Word = {
  id: string;
  de: string;
  article?: string;
  ru: string;
  exampleDe?: string;
  exampleRu?: string;
  level?: string;
  tags?: string[];
};

export type Sentence = {
  id: string;
  target: string;
  tokens: string[];
  type: "drag";
  explanation?: string;
  translation_en?: string;
  translation_ru?: string;
  level?: string;
};

export type Gap = {
  id: number;
  sentence: string;
  answer: string;
};

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
