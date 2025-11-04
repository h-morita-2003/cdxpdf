import { extractStringData } from "@/lib/pdfExtractor";
import { NextResponse,NextRequest } from "next/server";
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js"; // ← Node向けバージョンを指定
// @ts-ignore
import "pdfjs-dist/legacy/build/pdf.worker.js";
import { pdfToPng } from "@/lib/pdfToImage";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export async function pdf_POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    console.log("📂 formData.get('file'):", file);


    if (!file) {
      return NextResponse.json({ error: "ファイルが送信されていません" }, { status: 400 });
    }
     const arrayBuffer = await file.arrayBuffer();

  // ArrayBuffer → Uint8Array
  const pdfData = new Uint8Array(arrayBuffer);

  // PDF.js を使って読み込み
  const pdf = await pdfjsLib.getDocument({ data: pdfData,cMapUrl: "node_modules/pdfjs-dist/cmaps/",cMapPacked: true, }).promise;

  let textContent = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const text = await page.getTextContent();
    textContent += text.items.map((i: any) => i.str).join(" ") + "\n";
  }
  console.log (textContent);
    // ファイルを文字列に変換する。
    const text=`
株式会社サンプル御中

【請求書】

件名: 2025年9月度 業務委託費

項目一覧
--------------------------------
作業費用        0円
交通費           0円
通信費           0円
--------------------------------

請求金額       220,000円
消費税       22,000円

合計金額       0円

`;
    
    const result = await extractStringData(textContent);

    console.log(`extractStringData 結果 ${result}`)
    
   
    

    return NextResponse.json({ ok: true, result: result });
  } catch (err: any) {
    console.error("❌ APIエラー:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function ocr_POST(req: NextRequest) {
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
  const proc = spawn("node", ["./server/runOCR.js", tmpPath]);

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