import { NextResponse } from "next/server";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import "pdfjs-dist/legacy/build/pdf.worker.js";

/**
 * PDF内のテキスト抽出 → 単語数を返す
 * - コピペ可能なPDFなら単語数 > 0
 * - 画像PDFなら単語数 = 0 になる
 */
export async function POST(req: Request) {
  try {
    // フォームデータ受け取り
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "ファイルがありません" }, { status: 400 });
    }

    // PDFを データ(バイナリ)に変換
    const buffer = await file.arrayBuffer();
    const pdfData = new Uint8Array(buffer);

    // PDF.jsで読み込み
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

    let text = "";
    //テキスト抽出
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ");
    }

    // 単語数カウント（スペース区切り + フィルタ）
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    console.log(`🧩 PDF内単語数: ${wordCount}`);
    //レスポンス
    return NextResponse.json({ wordCount });
    //エラーハンドリング
  } catch (err: any) {
    console.error("❌ /api/wordcount エラー:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
