//pdfExtractor.ts
//正規表現

import { prisma } from "@/lib/db";

export interface StringData {
  total?: string;
  tax?: string;
  companyName?: string;
  items: { description: string; amount: string }[];
  day?: string;
}

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

export async function extractStringData(text: string): Promise<StringData> {
  const result: StringData = { items: [] };
  
  try {
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

    
    // 請求金額
    
    //const totalMatch =
      //text.match(/(小計|本体\（合計金額\）   |各合計|項|8%対象\(軽減税率対象\)|ヶ月|本体金額計  ¥0)[:：]?\s*¥?([\d,]+)\s*円?/);
      
    //RegExpMatchArray型（配列型またはnull）
    //totalMatchがnullではないと初回で終わってしまうので初期値はnull
    let totalMatch: RegExpMatchArray | null = null;
    for (const reg of RegKeySeikyuugaku){
      //
      totalMatch = text.match(reg);
      if (totalMatch) break;
    }
      //text.match(RegKeySeikyuugaku);
      //console.log(`請求金額 ${totalMatch}`)
     //if (totalMatch) result.total = result.total = (Number(totalMatch[2].replace(/,/g, "")) * 1.1).toLocaleString();
     if (totalMatch) {
      const amount = totalMatch[2].replace(/,/g, "");
      result.total = (Number(amount) * 1.1).toLocaleString();
     }

    // 消費税
    //const taxMatch =
      //text.match(/(消費税額|税抜金額|各合計|項|8%対象\(軽減税率対象\)|10％対象|1   ヶ月|株式会社|本体金額計  ¥0)[:：]?\s*¥?([\d,]+)\s*円?/);
    let taxMatch: RegExpMatchArray | null = null;
    for (const reg of RegKeyTax){
      //
      taxMatch = text.match(reg);
      if (taxMatch) break;
    }
      //text.match(RegKeyTax);
      //console.log(`消費税 ${taxMatch}`)
    //if (taxMatch) result.tax = (Number(taxMatch[2].replace(/,/g, "")) / 10).toLocaleString();
    if (taxMatch) {
      const amount = taxMatch[2].replace(/,/g, "");
      result.tax = (Number(amount) / 10).toLocaleString();
    }
    

    // 支払い日

    //const dayMatch =
    // text.match(RegKeyShiharaibi);
    let dayMatch:RegExpMatchArray | null = null;
    for (const reg of RegKeyShiharaibi){
      dayMatch = text.match(reg);
      if (dayMatch) break;
    }
     console.log(`西暦月日 ${dayMatch}`)
     result.day = dayMatch?.[0] ?? "";

   // 項目抽出
    //const itemRegex = /(\S+)\s+¥?([\d,]+)\s*円?/g;
    //const itemRegex = RegKeyHinmoku;
    for (const reg of RegKeyHinmoku){
      let match;
      while ((match = reg.exec(text)) !== null) {
      console.log(`項目${match}`)
      result.items.push({ description: match[1], amount: match[2] });
    }
    
    
    }
    //発行元会社抽出
    //宛先会社を変更して抽出したpdfの発行元会社以外の合わせれば発行元会社を出力することが可能
    //const allCompanies = [...text.matchAll(/(株式会社[^\s　]+)/g)]
    //const allCompanies = [...text.matchAll(RegKeyCompany)]
   //.map(m => m[1])
   //.filter(Boolean);

   let allCompanies : string[] = [];
   for (const reg of RegKeyCompany){
    const matches = [...text.matchAll(reg)].map(m => m[1]).filter(Boolean);
    allCompanies.push(...matches);
   }

  //除外リストに含まれる会社を除外
   //const issuerCompany = allCompanies.find(name => name !== "株式会社ヒューボ");
   //const issuerCompany = allCompanies.find(name => name !== KeyJogai);

   let issuerCompany = allCompanies.find(company =>{
    return !RegKeyJogai.some(jogaiReg => jogaiReg.test(company));
   });

   result.companyName = issuerCompany ?? "発行元不明";
   console.log("📦 検出された会社:", allCompanies);
   console.log("✅ 発行元会社:", result.companyName);

   return result;
    
  } catch (error) {
    console.log("エラー:", (error as Error).message);
    return result;
  }
}
