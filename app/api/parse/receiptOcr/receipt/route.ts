import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

import { prisma } from "@/lib/db";

/* 山下追加 */
export async function getSettingKeywords() {
  try {
    const settings = await prisma.setting.findMany({
      select: { item: true, keywords: true },
    });

    let KeySeikyuugaku: string[] = [];
    let KeyCompany: string[] = [];
    let KeyHinmoku: string[] = [];
    let KeyTax: string[] = [];
    let KeyShiharaibi: string[] = [];
    let KeyJogai: string[] = [];

    for (const row of settings) {
      const regs = row.keywords.split("|||").map(r => r.trim()).filter(Boolean);
      switch (row.item) {
        case "請求金額": KeySeikyuugaku = regs; break;
        case "会社名": KeyCompany = regs; break;
        case "品目": KeyHinmoku = regs; break;
        case "消費税": KeyTax = regs; break;
        case "支払日": KeyShiharaibi = regs; break;
        case "除外": KeyJogai = regs; break;
        default:
          console.error("正規表現取得項目エラー", row.item);
      }
    }
    return { KeySeikyuugaku, KeyCompany, KeyHinmoku, KeyTax, KeyShiharaibi, KeyJogai };
  } catch (error) {
    console.error("正規表現取得エラー:", error);
    throw error;
  }
}
/* 山下追加終わり */


export async function POST(req: NextRequest) {

  const {
    KeySeikyuugaku, KeyCompany, KeyHinmoku,
    KeyTax, KeyShiharaibi, KeyJogai
  } = await getSettingKeywords();

  const RegKeySeikyuugaku = KeySeikyuugaku.map(r => new RegExp(r, ""));
  const RegKeyCompany = KeyCompany.map(r => new RegExp(r, ""));
  const RegKeyHinmoku = KeyHinmoku.map(r => new RegExp(r, ""));
  const RegKeyTax = KeyTax.map(r => new RegExp(r, ""));
  const RegKeyShiharaibi = KeyShiharaibi.map(r => new RegExp(r, ""));
  const RegKeyJogai = KeyJogai.map(r => new RegExp(r, ""));

  // ここから変換削除版 ------------------------

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const arrayBuffer = await file.arrayBuffer();

  // 元コードでは PDF → PNG があったが削除
  // その代わり file を直接 OCR に渡す
  const tmpPath = path.join(process.cwd(), "upload_input");

  await fs.promises.writeFile(tmpPath, Buffer.from(arrayBuffer));

  console.log("🔍 OCR処理中...");

  const ocrScript = path.resolve(process.cwd(), "server", "runOCR.js");
  const proc = spawn("node", [ocrScript, tmpPath]);

  let output = "";
  let errorOutput = "";

  proc.stdout.on("data", (data) => {
    output += data.toString();
  });

  proc.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  await new Promise((resolve) => proc.on("close", resolve));

  console.log("✅ OCR完了");

  if (errorOutput) console.error("⚠️ OCRエラー:", errorOutput);

  console.log("🧠 OCR結果全文:\n" + (output.trim() || "(空の結果)"));

  // 抽出処理
  let totalMatch: RegExpMatchArray | null = null;
  for (const reg of RegKeySeikyuugaku) {
    totalMatch = output.match(reg);
    if (totalMatch) break;
  }

  let taxMatch: RegExpMatchArray | null = null;
  for (const reg of RegKeyTax) {
    taxMatch = output.match(reg);
    if (taxMatch) break;
  }

  let dayMatch: RegExpMatchArray | null = null;
  for (const reg of RegKeyShiharaibi) {
    dayMatch = output.match(reg);
    if (dayMatch) break;
  }

  const extracted = {
    total: totalMatch?.[1] ?? "未検出",
    tax: taxMatch?.[1] ?? "未検出",
    day: dayMatch?.[0] ?? "未検出",
  };

  if (totalMatch?.[1]) {
    extracted.total = Math.round(Number(totalMatch[1].replace(/,/g, "")) * 1.1)
      .toLocaleString();
  }
  if (taxMatch?.[1]) {
    extracted.tax = (
      Number(taxMatch[1].replace(/,/g, "")) / 10
    ).toLocaleString();
  }

  console.log("💰 抽出結果:", extracted);

  return NextResponse.json({
    ok: true,
    text: output,
    result: extracted,
  });
}
