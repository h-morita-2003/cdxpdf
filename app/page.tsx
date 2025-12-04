"use client";
import CameraArea from "components/CameraArea";
import FileUpLoader from "components/FileUploader";
import ResultView from "components/ResultView";
import Link from "next/link";
import { useUpload } from "hooks/useUpload";
import useCamera from "hooks/useCamera";
import { useFileHandler } from "hooks/useFileHandler";
import { useEffect } from "react";



export default function Home() {
  const { upLoad, loading, result, judgementText,judgementImage,judgementreceipt,} 
  = useUpload();
  const { cameraOpen, photo,videoRef,canvasRef,startCamera,stopCamera,takePhoto,ocrFromCamera,cameraFile,cameraFileName} 
  = useCamera();
  const {File,fileName,handleFile,handleDrop,handleDragOver,}
  = useFileHandler();
  useEffect(() =>{
    if(cameraFile){
      handleFile(cameraFile);
    }
  },[cameraFile]);
   
{/*画面１*/}
  return (
    <div >
      {/*設定ボタン*/} 
        <Link 
         href = "/settings"
         className="bg-blue-500 text-white px-4 py-2 rouded"
         >設定
         </Link>

        {/*PDFファイル入力*/}    

        <h1>本サイトにPDFまたはpngを選択、またはドラッグ＆ドロップ</h1>
        
         {/* 📷 カメラボタン */}
            <button
              onClick={startCamera}
              style={{ background: "#000000ff", color: "#fff", padding: "10px" }}
            >
            📷 カメラでレシート撮影（OCR）
            </button>
            
        <CameraArea
          cameraOpen = {cameraOpen}
          photo = {photo}
          videoRef = {videoRef}
          canvasRef = {canvasRef}
          startCamera = {startCamera}
          stopCamera = {stopCamera}  
          takePhoto = {takePhoto}
          ocrFromCamera = {ocrFromCamera}
         />
      
        <center>
           <FileUpLoader
            File = {File} 
            fileName = {fileName}
            handleFile = {handleFile}
            handleDrop = {handleDrop}
            handleDragOver = {handleDragOver}
            onExecute = {() => {
              if (!File) return alert("ファイルを選択してください");
              upLoad(File);
            }}
          />
        </center>

         {loading && <p>解析中です…</p>}

         {/*読み込み結果  
         //検出されたら表示する*/}
        <ResultView 
          result= {result}
          judgementText = {judgementText}
          judgementImage = {judgementImage}
          judgementReceipt = {judgementreceipt}
        />
        
    </div>
  )


}

