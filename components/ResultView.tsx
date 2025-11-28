"use client";

import { Result } from "types/result";


export default function ResultView({ result }:{result: Result | null }) {
    if (!result) return null;

    const { isReceipt, isText, isImagePdf } = result;
    
    return(
        <div style={{ marginTop: "20px" }}>

          <h2>抽出結果</h2>

          {isText && <h3>このPDFはテキスト型です✐</h3>}
          {isImagePdf && <h3>このPDFは画像型です🖼</h3>}
          {isReceipt && <h3>これはレシートです📋</h3>}

          <p>📌 請求金額（税込）: {result.total ?? "未検出"}</p>

          {result.total && result.tax && (
          <p>
            📌 本体価格（税抜）:{" "}
            {Math.round(
              Number(result.total.replace(/,/g, "")) -
              Number(result.tax.replace(/,/g, ""))
            ).toLocaleString()}
          </p>
          )}

          <p>
          📌 消費税価格　　　:{" "}
          {result.tax
            ? Math.round(Number(result.tax.replace(/,/g, ""))).toLocaleString()
            : "未検出"}
        </p>

        <h3>📋 項目</h3>
        <ul>
          {result.items && result.items.length > 0 ? (
            result.items.map((item: any, idx: number) => (
              <li key={idx}>
                {item.description} : ¥{item.amount}
              </li>
            ))
          ) : (
            <li>項目なし</li>
          )}
        </ul>

        <p>
          発行日:{result.day ?? "不明"}
          {result.day && (result.day.includes("年") || result.day.includes("月"))
            ? "日"
            : ""}
        </p>

        <p>🏢 発行元会社: {result.companyName ?? "不明"}</p>
      </div>
    );
}