// src/lib/extractText.ts
import Tesseract from "tesseract.js";

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  console.log("🔍 OCR開始...");
  const result = await Tesseract.recognize(imageBuffer, "jpn");
  console.log("✅ OCR完了");
  return result.data.text;
}
