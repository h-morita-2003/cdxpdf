import {  useState, useRef, useEffect } from "react";

// 📷 カメラ用
export const useCamera = (onPhotoTaken:(file: File)  => void, onCameraOCR: (text: string) => void) => {
    //引数1：Fileオブジェクト（名前：file）を受け取り、何も返さない関数onPhotoTaken
    //引数2：Stringオブジェクト（名前：text）を受け取り、何も返さない関数onCameraOCR

   {/*ステート管理（現在、関数）＝usestate（初期値）*/}
    //台形補正の為のOpencv用のUseEfect追加
    const [cvReady, setCvReady] = useState(false);


    useEffect(() => {
      const script = document.createElement("script");
      script.src = "/opencv.js";
      script.async = true;
      script.onload = () => {
        console.log("✅ OpenCV.js 読み込み完了");
        setCvReady(true);
      };
      document.body.appendChild(script);
    }, []);

    const [cameraOpen, setCameraOpen] = useState(false);
    const [photo, setPhoto] = useState<string | null>(null);
    const [ocrFromCamera, setOcrFromCamera] = useState("");
    const base64ToFile = (base64: string, filename: string) => {
    let mime = "image/png"; // デフォルト

    // dataURL 形式なら mime を抽出
    const headerMatch = base64.match(/^data:(.*?);base64,/);
    if (headerMatch) {
      mime = headerMatch[1];
      base64 = base64.replace(/^data:.*;base64,/, "");
     }

    const bstr = atob(base64);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
    };
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

  //
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
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    //setStream(null);
    setCameraOpen(false);
  };

  // ================================
  // 📷 撮影 → 台形補正 → Base64 作成
  // ================================
  const takePhoto = async() => {

    if (!cvReady) {
      alert("OpenCV.jsを読み込み中です。1〜2秒後に再実行してください。");
      return;
    }
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    // ⭐ 台形補正
    const corrected = rectifyReceipt(canvas);

    // ⭐ 補正後の画像を画面に表示
    const base64 = corrected ?? canvas.toDataURL("image/png");
    setPhoto(base64);
    //const img = canvas.toDataURL("image/png");
    //setPhoto(img);

    // ⭐ File 化する
    const file = base64ToFile(base64, `camera_receipt_${Date.now()}.png`);
    //handleFile(file);

    // ================================
    // Base64 → Blob → File
    // ================================
    //fetch(img)
    //.then((res) => res.blob())
    //.then((blob) => {
      //const file = new File([blob], `camera_receipt_${Date.now()}.png`, {
      //  type: "image/png",
      //});
    //↑thenのネストが多いので変更（処理内容は同じ）
    //const blob = await fetch(img).then((res) => res.blob());
    //const file = new File([blob], `camera_receipt_${Date.now()}.png`, {
    //    type: "image/png",
    //});
      
    //
    //handleFile(file);
    onPhotoTaken(file);

  // ================================
  // 📨 カメラ画像を OCR API に送信
  // ================================
    //const res = await fetch("/api/ocr-camera", {
    //  method: "POST",
    //  headers: { "Content-Type": "application/json" },
    ////  body: JSON.stringify({ image: imageBase64 }),
    //  body: JSON.stringify({ image: img }),
    //});
    const sendToCameraOCR = async (imageBase64: string) => {
    setLoading(true);

    const data = await res.json();
    onCameraOCR(data.text);
  };

  return{
    cameraOpen,
    photo,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    takePhoto,
  };

};
