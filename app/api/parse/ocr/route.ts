import { NextRequest, NextResponse } from "next/server";
import { pdfToPng } from "@/lib/pdfToImage";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  console.log("📄 PDFを画像化中...");
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const arrayBuffer = await file.arrayBuffer();

  // PDF → PNG 変換
  const pngBuffer = await pdfToPng(Buffer.from(arrayBuffer));
  console.log("✅ PDF→PNG変換成功");

  // 一時ファイルに保存
  const tmpPath = path.join(process.cwd(), "tmp.png");
  await fs.promises.writeFile(tmpPath, pngBuffer);

  console.log("🔍 OCR処理中...");

  // Node スクリプトを実行
  const ocrScript = "C:\\Users\\h.morita\\pdfcdx\\server\\runOCR.js";
  const proc = spawn("node", [ocrScript, tmpPath]);

  let output = "";
  let errorOutput = "";

  proc.stdout.on("data", (data) => {
    output += data.toString();
  });

  proc.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  await new Promise((resolve) => {
    proc.on("close", resolve);
  });

  console.log("✅ OCR完了");

  if (errorOutput) {
    console.error("⚠️ OCRエラー:", errorOutput);
  }

  // 🔍 OCR全文をターミナルに出力
  console.log("🧠 OCR結果全文:\n" + (output.trim() || "(空の結果)"));

  const totalMatch = output.match(/(?: 計 |L_ 1i0%\s*\|)[:：]?\s*¥?\s*([\d,]+)\s*円?/);
  
  const taxMatch = output.match(/(?: 計 |L_ 1i0%\s*\|)[:：]?\s*¥?\s*([\d,]+)\s*円?/);

  const extracted = {
    total: totalMatch?.[1] ?? "未検出",
    tax: taxMatch?.[1] ?? "未検出",
  };
 if (totalMatch) extracted.total = Math.round(Number(totalMatch[1].replace(/,/g, "")) * 1.1).toLocaleString();
 if (taxMatch) extracted.tax = (Number(taxMatch[1].replace(/,/g, "")) / 10).toLocaleString();

console.log("💰 抽出結果:", extracted);

  // 結果をパターン抽出
  return NextResponse.json({
  ok: true,
  text: output, // ← OCR全文
  result: extracted, // ← 特定項目だけ
  });
}
