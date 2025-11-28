import { useState } from "react";

export const useUpload = () => {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const upLoad = async ( file : File ) => {
        setLoading(true);
        // runOCR.js の全文が返るのでそのまま表示
        //setOcrFromCamera(data.text);
        //setResult({ raw: data.text });
        setResult(null)

        //setJudementreceipt(true);
        //setLoading(false);
        
        // ✅ FormDataを自分で作って確実にfileをセット
        const formData = new FormData();
        formData.append("file", file);

        let apiUrl = "";
        let isReceipt = false;
        let isText = false;
        let isImagePdf = false;

        // ▼ まずPDFからテキストを抽出して単語数を判定
        try{
            if(file.type === "application/pdf"){
                const wordCountRes = await fetch("/api/parse/wordcount/count/count", {
                    method: "POST",body: formData,
                });
                const wordData = await wordCountRes.json();
                console.log("🔍 wordData:", wordData);
                const wordCount = wordData.wordCount ?? 0;
                console.log("🧩 PDF単語数:", wordCount);

                if (wordCount  > 0){
                    isText = true;
                    console.log("✅ テキストPDF → /api/parse に送信");
                    apiUrl = "/api/parse";
                    //apiMethod = "POST"; // ← method名は 'pdf_POST' ではなく 'POST'！
                }else {
                    isImagePdf = true;
                    console.log("🖼 画像PDF → /api/parse/ocr に送信");
                    apiUrl = "/api/parse/ocr";
                    //apiMethod = "POST"; // ← method名は 'pdf_POST' ではなく 'POST'！
                }
            }else{
                //レシートの場合
                isReceipt = true;
                apiUrl = "/api/parse/receiptOcr/receipt";
                //setJudementreceipt(true);
            }
            const res = await fetch(apiUrl, {
            //    method: apiMethod,
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            console.log("📜 レスポンス body:", data.result);
            setResult({
                ...data.result,
                isReceipt,
                isText,
                isImagePdf,
            });
        } catch (err) {
            console.error("❌ エラー:", err);
            setResult({ error: "処理中にエラーが発生しました" });
        } finally {
            setLoading(false);
        }
    };

    return {upLoad,loading,result,setResult }
};