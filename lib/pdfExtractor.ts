//pdfExtractor.ts
//正規表現
export interface StringData {
  totalAmount?: string;
  taxAmount?: string;
  companyName?: string;
  items: { description: string; amount: string }[];
}

export async function extractStringData(text: string): Promise<StringData> {
  const result: StringData = { items: [] };
  
  try {
    // 請求金額
    
    const totalMatch =
      text.match(/(小計|本体\（合計金額\）   |各合計|項|8%対象\(軽減税率対象\)|ヶ月|本体金額計  ¥0)[:：]?\s*¥?([\d,]+)\s*円?/);
      console.log(`請求金額 ${totalMatch}`)
     if (totalMatch) result.totalAmount = result.totalAmount = (Number(totalMatch[2].replace(/,/g, "")) * 1.1).toLocaleString();


    // 消費税
    const taxMatch =
      text.match(/(消費税額|税抜金額|各合計|項|8%対象\(軽減税率対象\)|10％対象|1   ヶ月|株式会社|本体金額計  ¥0)[:：]?\s*¥?([\d,]+)\s*円?/);
      console.log(`消費税 ${taxMatch}`)
    if (taxMatch) result.taxAmount = (Number(taxMatch[2].replace(/,/g, "")) / 10).toLocaleString();
    
    // 項目抽出
    
    const itemRegex = /(\S+)\s+¥?([\d,]+)\s*円?/g;
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      console.log(`項目${match}`)
      result.items.push({ description: match[1], amount: match[2] });
    }
    //発行元会社抽出
    //宛先会社を変更して抽出したpdfの発行元会社以外の合わせれば発行元会社を出力することが可能
    const allCompanies = [...text.matchAll(/(株式会社[^\s　]+)/g)]
   .map(m => m[1])
   .filter(Boolean);

   const issuerCompany = allCompanies.find(name => name !== "株式会社ヒューボ");

   result.companyName = issuerCompany ?? "発行元不明";
   console.log("📦 検出された会社:", allCompanies);
   console.log("✅ 発行元会社:", result.companyName);

   return result;
    
  } catch (error) {
    console.log("エラー:", (error as Error).message);
    return result;
  }
}