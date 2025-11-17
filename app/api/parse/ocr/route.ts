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
      // 配列にする
      let KeySeikyuugaku: string[] = [] ;
      let KeyCompany: string[] = [];
      let KeyHinmoku: string[] = [];
      let KeyTax: string[] = [];
      let KeyShiharaibi: string[] = [];
      let KeyJogai: string[] = [];

     //settings配列をループして該当する
      for (const row of settings){
        //正規表現を”|||”で区切り配列にいれ、空白を取り除く
        const regs = row.keywords.split("|||").map(r => r.trim()).filter(Boolean);
        switch(row.item){
          case "請求金額":
            KeySeikyuugaku= regs;
            break;
          case "会社名":
            KeyCompany= regs;
            break;
          case "品目":
            KeyHinmoku= regs;
            break;
          case "消費税":
            KeyTax= regs;
            break;
          case "支払日":
            KeyShiharaibi= regs;
            break;
          case "除外":
            KeyJogai= regs;
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
    // 配列にする
    //rは文字列、”g”は全文検索フラグ
    const RegKeySeikyuugaku = KeySeikyuugaku.map(r => new RegExp(r,"g"));
    const RegKeyCompany = KeyCompany.map(r => new RegExp(r,"g"));
    const RegKeyHinmoku = KeyHinmoku.map(r => new RegExp(r,"g"));
    const RegKeyTax = KeyTax.map(r => new RegExp(r,"g"));
    const RegKeyShiharaibi = KeyShiharaibi.map(r => new RegExp(r,"g"));
    const RegKeyJogai = KeyJogai.map(r => new RegExp(r,"g"));
    
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
  console.log(RegKeySeikyuugaku);
  //const taxMatch = output.match(/(?: 計 |L_ 1i0%\s*\|)[:：]?\s*¥?\s*([\d,]+)\s*円?/);
  const taxMatch = output.match(RegKeyTax);
  console.log(RegKeyTax);
  //日付
  const dayMatch =output.match(RegKeyShiharaibi);
  console.log(RegKeyShiharaibi);
  
  //const totalMatch = output.match(RegKeySeikyuugaku);

  //RegExpMatchArray型（配列型またはnull）
    //totalMatchがnullではないと初回で終わってしまうので初期値はnull
    let totalMatch: RegExpMatchArray | null = null;
    for (const reg of RegKeySeikyuugaku){
      //
      totalMatch =  output.match(reg);
      if (totalMatch) break;
    }
  
  //const taxMatch = output.match(/(?: 計 |L_ 1i0%\s*\|)[:：]?\s*¥?\s*([\d,]+)\s*円?/);
  //const taxMatch = output.match(RegKeyTax);
  let taxMatch: RegExpMatchArray | null = null;
    for (const reg of RegKeyTax){
      //
      taxMatch = output.match(reg);
      if (taxMatch) break;
    }

  const extracted = {
    total: totalMatch?.[1] ?? "未検出",
    tax: taxMatch?.[1] ?? "未検出",
    day: dayMatch?.[0] ?? "未検出",
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
