"use client";
import { Children, useState,DragEvent,useCallback,useRef, useEffect,  } from "react";
import Link from "next/link";

{/*山下追加
  設定項目*/}
type Setting = {
  item: string;
  keywords: string;
}
{/*山下追加終わり*/}


export default function Home() {
  {/*ステート管理（現在、関数）＝usestate（初期値）*/}
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [judgementText, setJudementText] = useState(false);
  const [judgementImage, setJudementImage] = useState(false);
  const [judgementreceipt, setJudementreceipt] = useState(false);
  //山下追加
  const [droppedFile, setDroppedFile] = useState<File | null>(null); 
  const [fileName, setFileName] = useState("");
    // 📷 カメラ用
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [ocrFromCamera, setOcrFromCamera] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // ================================
  // 📷 カメラ起動
  // ================================
  const startCamera = async () => {
    setCameraOpen(true);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    if (videoRef.current) {
       videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  };
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setCameraOpen(false);
  };

  // ================================
  // 📷 撮影 → Base64 作成
  // ================================
  const takePhoto = () => {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  if (!video || !canvas) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

  const img = canvas.toDataURL("image/png");
  setPhoto(img);

  // ================================
  // Base64 → Blob → File
  // ================================
  fetch(img)
    .then((res) => res.blob())
    .then((blob) => {
      const file = new File([blob], `camera_receipt_${Date.now()}.png`, {
        type: "image/png",
      });
      
      // ★ 撮影画像を既存の処理に流す
      handleFile(file);

      
      
    });

  // ★撮影と同時にカメラ専用OCRを動かしたいならここに残す
  sendToCameraOCR(img);
};
  // ================================
  // 📨 カメラ画像を OCR API に送信
  // ================================
  const sendToCameraOCR = async (imageBase64: string) => {
    setLoading(true);

    const res = await fetch("/api/ocr-camera", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageBase64 }),
    });

    const data = await res.json();

    // runOCR.js の全文が返るのでそのまま表示
    setOcrFromCamera(data.text);
    setResult({ raw: data.text });

    setJudementreceipt(true);
    setLoading(false);
  };

  // どちら（input or D&D）からでも同じ処理を使う
  const handleFile = ( file: File | null) => {
    if (!file) return;

    if (file.type !== "application/pdf" && file.type !== "image/png") {
      alert("ファイルを選択してください");
      return;
    }

    setDroppedFile(file); // ←後で handleUpload で使う
    setFileName(file.name); //ファイル名表示更新処理
  };

  // ドラッグアンドドロップ 対応
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };


  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    //山下追加
    //const fileInput = e.currentTarget.querySelector(
    const formInput = e.currentTarget.querySelector(
      "input[type=file]"
    ) as HTMLInputElement;
   

    //ドラッグアンドドロップまたは選択したファイルを設定
    const file = droppedFile ?? formInput.files?.[0];

    //if (!fileInput.files?.[0]) {
    if (!file) {
      alert("ファイルを選択してください");
      return;
    }

    // ✅ FormDataを自分で作って確実にfileをセット
    const formData = new FormData();
    //formData.append("file", fileInput.files[0]);
    formData.append("file", file);
    //山下追加終わり
    
    //ここでtext処理かocrか判断する
    setLoading(true);
    setResult(null);

    {/*PDF読み込みエラーの設定*/}
    try {


      // ▼ まずPDFからテキストを抽出して単語数を判定
      let apiUrl = "";
      let apiMethod = "POST";
      if(file.type == "application/pdf"){
      const wordCountRes = await fetch("/api/parse/wordcount/count/count", {
        method: "POST",
        body: formData,
      });
      const wordData = await wordCountRes.json();
      console.log("🔍 wordData:", wordData);
      const wordCount = wordData.wordCount ?? 0;

      console.log("🧩 PDF単語数:", wordCount);

      // ▼ テキストがあるかないかで処理先を分岐

      setJudementText(false);
      setJudementImage(false);
      setJudementreceipt(false);
      if (wordCount > 0) {
        console.log("✅ テキストPDF → /api/parse に送信");
        apiUrl = "/api/parse";
        apiMethod = "POST"; // ← method名は 'pdf_POST' ではなく 'POST'！
        setJudementText(true);
      } else {
        console.log("🖼 画像PDF → /api/parse/ocr に送信");
        apiUrl = "/api/parse/ocr";
        apiMethod = "POST"; // ← 'ocr_POST' ではなく 'POST'
        setJudementImage(true);
      }
     }else{ 
     apiUrl = "/api/parse/receiptOcr/receipt";
     apiMethod = "POST"; //
     setJudementreceipt(true);
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
      console.log("📜 レスポンス body:", data.result);
      setResult(data.result);
    } catch (err) {
      console.error("❌ エラー:", err);
      setResult({ error: "処理中にエラーが発生しました" });
    } finally {
      setLoading(false);
    }
  };

{/*画面１*/}
{/*ファイルをドラッグ＆ドロップ*/}
  return (
    <div>

      {/*山下追加*/}
      {/*設定ボタン*/}
      <div className="flex gap-4"> 
        <Link 
         href = "/settings"
         className="bg-blue-500 text-white px-4 py-2 rouded"
         >設定
         </Link>
       </div>
      {/*山下追加終わり*/}
      
      
      {/*PDFファイル入力*/}    

      <h1>本サイトにPDFまたはpngを選択、またはドラッグ＆ドロップ</h1>
      
      {/* 📷 カメラボタン */}
      <button
        onClick={startCamera}
        style={{ background: "#000000ff", color: "#fff", padding: "10px" }}
      >
        📷 カメラでレシート撮影（OCR）
      </button>
      {/* 📷 カメラビュー */}
      {cameraOpen && (
        <div style={{ marginTop: 20 }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: 300 }} />
          <br />
         <button onClick={takePhoto} style={{ marginTop: 10 ,background: "#020202ff", color: "#fff", padding: "10px" }}>
            📸 撮影して OCR
          </button>
            
           <button onClick={stopCamera} style={{ marginLeft: "10px" ,background: "#fc0000ff", color: "#ffffffff", padding: "10px" }}>
              ■ カメラ停止
            </button>
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {photo && (
            <div>
              <h3>撮影画像</h3>
              <img src={photo} style={{ width: 300 }} />
            </div>
          )}

          {ocrFromCamera && (
            <pre style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>
              {ocrFromCamera}
            </pre>
          )}
        </div>
      )}

      

      <center>
        <form onSubmit={handleUpload}>
          <div
            //山下追加
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            //山下追加終わり
            style={{
              padding: "100px",
              marginBottom: "50px",
              border: "1px dashed #333333",
              background: "#fafafa",
            }}
          >
            <div id="dropArea">↓ここにPDF/pngをドラッグ＆ドロップ
              {/*山下追加*/}
              <br />
               {/*選択またはドラッグアンドドロップされたファイル名表示* */}
               {fileName && (
                <p style={{ color: "#0070f3",marginTop: "10px"}}>
                  選択中のファイル：{fileName}
                </p>
               )}
               {/*山下追加終わり */}
            </div>
            {/*通常ファイル選択 */}
            <div
              style={{
                padding: "30px",
                marginBottom: "10px",
                border: "1px dashed #333333",
              }}
            >
              {/* ✅ name="file" をつけるのも大事 */}
              <input type="file" name="file" accept="application/pdf, image/png" 
              //山下追加
               onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              //山下追加終わり 
               />
            </div>
            {/*フォーム送信ボタン*/}
            <button type="submit">実行</button>
          </div>
        </form>
      </center>

      {loading && <p>解析中です…</p>}

      {/*読み込み結果  
      //検出されたら表示する*/}
      {result && (
        <div style={{ marginTop: "20px" }}>

          <h2>抽出結果</h2>
          
        {droppedFile?.type === "application/pdf" ? (
        <>
        {judgementText && <h3>このPDFはテキスト型です✐</h3>}
        {judgementImage && <h3>このPDFは画像型です🖼</h3>}
        

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
      </>
    ) : droppedFile?.type === "image/png" ? (
      <>
        {/* 🔽 ここが PNG の時の表示 */}
        {judgementreceipt && <h3>これはレシートです📋</h3>}
        {/* PNG専用の処理をここに書く */}
        <p>📌 請求金額（税込）: {result.total ?? "未検出"}</p>
        <p>
          発行日:{result.day ?? "不明"}
          {result.day && (result.day.includes("年") || result.day.includes("月"))
            ? "日"
            : ""}
        </p>
        <p>🏢 発行元: {result.companyName ?? "不明"}</p>
      </>
    ) : (
      <>
        {/* それ以外のとき */}
      </>
    )}
  </div>
)}
    </div>
  );

}
