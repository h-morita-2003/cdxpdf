import {  useState, useRef, useEffect } from "react";
import { rectifyReceipt } from "@/utils/rectifyReceipt";

// 📷 カメラ用
//export const useCamera = (onPhotoTaken:(file: File)  => void, onCameraOCR: (text: string) => void) => {
    //引数1：Fileオブジェクト（名前：file）を受け取り、何も返さない関数onPhotoTaken
    //引数2：Stringオブジェクト（名前：text）を受け取り、何も返さない関数onCameraOCR
export default function useCamera(){

    const [cameraOpen, setCameraOpen] = useState(false);
    const [photo, setPhoto] = useState<string | null>(null);
    const [ocrFromCamera, setOcrFromCamera] = useState("");
    const [cameraFile,setCameraFile]= useState<File | null>(null);
    const [cameraFileName,setCameraFileName]= useState("");
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

    //台形補正の為のOpencv用のUseEfect追加
    const [cvReady, setCvReady] = useState(false);

    // OpenCV.js 読込
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
    setStream(stream);

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
    setStream(null);
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
    setCameraFile(file);
    setCameraFileName(file.name);
    // ⭐ OCR に送信
    sendToCameraOCR(base64);
  
    };

  // ★撮影と同時にカメラ専用OCRを動かしたいならここに残す
  //sendToCameraOCR(img); 
  // ================================
  // 📨 カメラ画像を OCR API に送信
  // ================================
    const sendToCameraOCR = async (imageBase64: string) => {

      //setLoading(true);
      const res = await fetch("/api/ocr-camera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });
  
    const data = await res.json();
    setOcrFromCamera(data.text);
    };

  return{
    cameraOpen,
    photo,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    takePhoto,
    ocrFromCamera,
    cameraFile,
    cameraFileName
  };

};
