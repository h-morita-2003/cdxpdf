"use client";
import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const fileInput = e.currentTarget.querySelector(
      "input[type=file]"
    ) as HTMLInputElement;

    if (!fileInput.files?.[0]) {
      alert("PDFファイルを選択してください");
      return;
    }

    // ✅ FormDataを自分で作って確実にfileをセット
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    //ここでtext処理かocrか判断する
    setLoading(true);
    setResult(null);

    try {
      const input = e.currentTarget.querySelector("input[type=file]") as HTMLInputElement;
      if (!input.files?.[0]) return alert("PDFを選択してください");

      const file = input.files[0];
      const formData = new FormData();
      formData.append("file", file);

      // ▼ まずPDFからテキストを抽出して単語数を判定
      const wordCountRes = await fetch("/api/parse/wordcount/count/count", {
        method: "POST",
        body: formData,
      });
      const wordData = await wordCountRes.json();
      const wordCount = wordData.wordCount ?? 0;

      console.log("🧩 PDF単語数:", wordCount);

      // ▼ テキストがあるかないかで処理先を分岐
      let apiUrl = "";
      let apiMethod = "POST";

      if (wordCount > 0) {
        console.log("✅ テキストPDF → /api/parse に送信");
        apiUrl = "/api/parse";
        apiMethod = "POST"; // ← method名は 'pdf_POST' ではなく 'POST'！
      } else {
        console.log("🖼 画像PDF → /api/parse/ocr に送信");
        apiUrl = "/api/parse/ocr";
        apiMethod = "POST"; // ← 'ocr_POST' ではなく 'POST'
      }

      const res = await fetch(apiUrl, {
        method: apiMethod,
        body: formData,
      });

      console.log("📡 レスポンス status:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error("⚠️ APIエラー応答:", text);
        throw new Error(`APIエラー: ${res.status}`);
      }

      const data = await res.json();
      console.log("📜 レスポンス body:", data);
      setResult(data);
    } catch (err) {
      console.error("❌ エラー:", err);
      setResult({ error: "処理中にエラーが発生しました" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>本サイトにPDFを選択、またはドラッグ＆ドロップ</h1>
      <center>
        <form onSubmit={handleUpload}>
          <div
            style={{
              padding: "100px",
              marginBottom: "50px",
              border: "1px dashed #333333",
            }}
          >
            <div id="dropArea">↓ここにPDFをドラッグ＆ドロップ</div>
            <div
              style={{
                padding: "30px",
                marginBottom: "10px",
                border: "1px dashed #333333",
              }}
            >
              {/* ✅ name="file" をつけるのも大事 */}
              <input type="file" name="file" accept="application/pdf" />
            </div>
            <button type="submit">実行</button>
          </div>
        </form>
      </center>

      {loading && <p>解析中です…</p>}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h2>抽出結果</h2>
          <p>📌 請求金額（税込）: {result.totalAmount ?? "未検出"}</p>
          {result.totalAmount && result.taxAmount && (
          <p>📌 本体価格（税抜）:{" "}
              {
               // カンマ削除 → 数値化 → 差分計算 → カンマ付き出力
                (
                Number(result.totalAmount.replace(/,/g, "")) -
                Number(result.taxAmount.replace(/,/g, ""))
                ).toLocaleString()
               }</p>
              )}
          <p>📌 消費税価格　　　: {result.taxAmount ?? "未検出"}</p>
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
          <p>🏢 発行元会社: {result.companyName ?? "不明"}</p>
        </div>
      )}
    </div>
  );
}
