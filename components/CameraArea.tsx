"use client";

import React from "react";
import { useCamera } from "hooks/useCamera";

type CameraAreaProps = {
    onFile : (file: File) => void;
    onOcrText : (text: string) => void;
};

export default function CameraArea({ onFile, onOcrText}: CameraAreaProps){
    const{
        cameraOpen,
        photo,
        videoRef,
        canvasRef,
        startCamera,
        stopCamera,
        takePhoto,        
    } = useCamera(onFile, onOcrText);

    return(
        <div>
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

                  <canvas ref={canvasRef} style={{ width: 300, display: "block", marginTop: 20 }} />

                  {photo && (
                    <div>
                      <h3>撮影画像</h3>
                      <img src={photo} style={{ width: 300 }} />
                    </div>
                  )}

                 {/* 
                  {ocrFromCamera && (
                     <pre style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>
                        {ocrFromCamera}
                    </pre>
                  )}
                 */}
                </div>
            )}
    </div>
    );
}