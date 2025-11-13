import { NextRequest, NextResponse } from "next/server";
import { pdfToPng } from "@/lib/pdfToImage";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

import { prisma } from "@/lib/db";

 {/* 山下追加　*/}

  export async function getSettingKeywords() {
    try{
      //DBから正規表現を取得
      const settings = await prisma.setting.findMany({
      select: { item: true, keywords: true },
    });

      //正規表現の初期値
      let KeySeikyuugaku = "";
      let KeyCompany = "";
      let KeyHinmoku = "";
      let KeyTax = "";
      let KeyShiharaibi = "";
      let KeyJogai = "";

     //settings配列をループして該当する
      for (const row of settings){
        switch(row.item){
          case "請求金額":
            KeySeikyuugaku= row.keywords;
            break;
          case "会社名":
            KeyCompany= row.keywords;
            break;
          case "品目":
            KeyHinmoku= row.keywords;
            break;
          case "消費税":
            KeyTax= row.keywords;
            break;
          case "支払日":
            KeyShiharaibi= row.keywords;
            break;
          case "除外":
            KeyJogai= row.keywords;
            break;
          default:
          //上記以外
            console.error("正規表現取得項目エラー", row.item);
        }
      }
    return { KeySeikyuugaku, KeyCompany,KeyHinmoku,KeyTax,KeyShiharaibi,KeyJogai};
    

    }catch(error){
      console.error("正規表現取得エラー:", error);
      throw error;
    }
  }
  {/* 山下追加終わり　*/}


export async function POST(req: NextRequest) {

  {/* 山下追加　*/}
      const { KeySeikyuugaku, KeyCompany, KeyHinmoku, KeyTax, KeyShiharaibi, KeyJogai } = await getSettingKeywords(); 
      //console.log("DB取得", "請求額",KeySeikyuugaku, "会社",KeyCompany,"品目",KeyHinmoku,"税率",KeyTax,"支払日",KeyShiharaibi,"除外",KeyJogai); 
  
      //正規表現
      //請求金額：KeySeikyuugaku
      //会社:KeyCompany
      //品目:KeyHinmoku
      //税率:KeyTax
      //支払日:KeyShiharaibi
      //除外:KeyJogai
      
      //正規表現（RegExp）型に変換
      const RegKeySeikyuugaku = new RegExp(KeySeikyuugaku);
      const RegKeyCompany = new RegExp(KeyCompany);
      const RegKeyHinmoku = new RegExp(KeyHinmoku);
      const RegKeyTax = new RegExp(KeyTax);
      const RegKeyShiharaibi = new RegExp(KeyShiharaibi);
      const RegKeyJogai = new RegExp(KeyJogai);
    
  {/* 山下追加終わり　*/}

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

  //const totalMatch = output.match(/(?: 計 |L_ 1i0%\s*\|)[:：]?\s*¥?\s*([\d,]+)\s*円?/);
  const totalMatch = output.match(RegKeySeikyuugaku);
  
  //const taxMatch = output.match(/(?: 計 |L_ 1i0%\s*\|)[:：]?\s*¥?\s*([\d,]+)\s*円?/);
  const taxMatch = output.match(RegKeyTax);

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
