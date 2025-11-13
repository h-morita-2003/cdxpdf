//pdfExtractor.ts
//正規表現

import { prisma } from "@/lib/db";

export interface StringData {
  total?: string;
  tax?: string;
  companyName?: string;
  items: { description: string; amount: string }[];
}

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
    const RegKeySeikyuugaku = new RegExp(KeySeikyuugaku);
    const RegKeyCompany = new RegExp(KeyCompany);
    const RegKeyHinmoku = new RegExp(KeyHinmoku);
    const RegKeyTax = new RegExp(KeyTax);
    const RegKeyShiharaibi = new RegExp(KeyShiharaibi);
    const RegKeyJogai = new RegExp(KeyJogai);
    
    {/* 山下追加終わり　*/}

    
    // 請求金額
    
    const totalMatch =
      //text.match(/(小計|本体\（合計金額\）   |各合計|項|8%対象\(軽減税率対象\)|ヶ月|本体金額計  ¥0)[:：]?\s*¥?([\d,]+)\s*円?/);
      text.match(RegKeySeikyuugaku);
      console.log(`請求金額 ${totalMatch}`)
     if (totalMatch) result.total = result.total = (Number(totalMatch[2].replace(/,/g, "")) * 1.1).toLocaleString();


    // 消費税
    const taxMatch =
      //text.match(/(消費税額|税抜金額|各合計|項|8%対象\(軽減税率対象\)|10％対象|1   ヶ月|株式会社|本体金額計  ¥0)[:：]?\s*¥?([\d,]+)\s*円?/);
      text.match(RegKeyTax);
      console.log(`消費税 ${taxMatch}`)
    if (taxMatch) result.tax = (Number(taxMatch[2].replace(/,/g, "")) / 10).toLocaleString();
    
    // 項目抽出
    
    //const itemRegex = /(\S+)\s+¥?([\d,]+)\s*円?/g;
    const itemRegex = RegKeyHinmoku;
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      console.log(`項目${match}`)
      result.items.push({ description: match[1], amount: match[2] });
    }
    //発行元会社抽出
    //宛先会社を変更して抽出したpdfの発行元会社以外の合わせれば発行元会社を出力することが可能
    //const allCompanies = [...text.matchAll(/(株式会社[^\s　]+)/g)]
    const allCompanies = [...text.matchAll(RegKeyCompany)]
   .map(m => m[1])
   .filter(Boolean);

   //const issuerCompany = allCompanies.find(name => name !== "株式会社ヒューボ");
   const issuerCompany = allCompanies.find(name => name !== KeyJogai);

   result.companyName = issuerCompany ?? "発行元不明";
   console.log("📦 検出された会社:", allCompanies);
   console.log("✅ 発行元会社:", result.companyName);

   return result;
    
  } catch (error) {
    console.log("エラー:", (error as Error).message);
    return result;
  }
}
