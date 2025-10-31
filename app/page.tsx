"use client";
import { Children, useState } from "react";
import Link from "next/link";

//設定項目
type Setting = {
  seikyuuGaku: number;
  company: string;
  hinmoku: string[];
  tax: number;
  shiharaibi: string;
  jogai: string;
}


export default function Home() {
  //ステート管理（現在、関数）＝usestate（初期値）
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  //フォーム送信時に実行
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

    setLoading(true);
    setResult(null);

    //PDF読み込みエラーの設定
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      console.log("📡 レスポンス status:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error("⚠️ APIエラー HTML:", text);
        throw new Error(`APIエラー: ${res.status}`);
      }

      const data = await res.json();
      console.log("📜 レスポンス body:", data);
      setResult(data.result);
    } catch (err) {
      console.error("❌ フロント側エラー:", err);
      alert("解析中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

//画面１
  //ファイルをドラッグ＆ドロップ
  return (
    <div>
      //設定ボタン
      <div> 
        <Link 
         href = "/settings"
         className="bg-blue-500 text-white px-4 py-2 rouded"
         >設定
         </Link>
       </div>
      //
      //PDFファイル入力    
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
            //フォーム送信ボタン
            <button type="submit">実行</button>
          </div>
        </form>
      </center>

      {loading && <p>解析中です…</p>}

      //読み込み結果  
      //検出されたら表示する
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
