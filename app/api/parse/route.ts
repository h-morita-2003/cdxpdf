import { extractStringData } from "@/lib/pdfExtractor";
import { NextResponse,NextRequest } from "next/server";
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js"; // ← Node向けバージョンを指定
// @ts-ignore
import "pdfjs-dist/legacy/build/pdf.worker.js";


export async function POST(req: Request) {
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
