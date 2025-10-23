// lib/server/pdfParser.ts
"use server";
import { Buffer } from "buffer";

// CommonJS モジュールを Node.js require で安全に取得
const pdfParse = require("pdf-parse");

export async function parsePdfBuffer(buffer: Buffer) {
  if (typeof pdfParse !== "function") {
    throw new Error("pdf-parse の関数が取得できませんでした");
  }
  return await pdfParse(buffer);
}