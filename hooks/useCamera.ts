import {  useState, useRef } from "react";

// 📷 カメラ用
export const useCamera = (onPhotoTaken:(file: File)  => void, onCameraOCR: (text: string) => void) => {
    //引数1：Fileオブジェクト（名前：file）を受け取り、何も返さない関数onPhotoTaken
    //引数2：Stringオブジェクト（名前：text）を受け取り、何も返さない関数onCameraOCR

    const [cameraOpen, setCameraOpen] = useState(false);
    const [photo, setPhoto] = useState<string | null>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

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
  // 📷 撮影 → Base64 作成
  // ================================
  const takePhoto = async() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
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
    //fetch(img)
    //.then((res) => res.blob())
    //.then((blob) => {
      //const file = new File([blob], `camera_receipt_${Date.now()}.png`, {
      //  type: "image/png",
      //});
    //↑thenのネストが多いので変更（処理内容は同じ）
    const blob = await fetch(img).then((res) => res.blob());
    const file = new File([blob], `camera_receipt_${Date.now()}.png`, {
        type: "image/png",
    });
      
    //
    //handleFile(file);
    onPhotoTaken(file);

  // ================================
  // 📨 カメラ画像を OCR API に送信
  // ================================
    const res = await fetch("/api/ocr-camera", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    //  body: JSON.stringify({ image: imageBase64 }),
      body: JSON.stringify({ image: img }),
    });

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
