"use client";

import React from "react";
//import { useCamera } from "hooks/useCamera";

type CameraAreaProps = {
    cameraOpen : boolean;
    photo : string | null;
    videoRef : React.RefObject<HTMLVideoElement | null>;
    canvasRef : React.RefObject<HTMLCanvasElement | null>;
    startCamera : () => void;
    stopCamera : () => void;
    takePhoto : () => void;
    ocrFromCamera : string | null;
};

export default function CameraArea({
        cameraOpen,
        photo,
        videoRef,
        canvasRef,
        startCamera,
        stopCamera,
        takePhoto,
        ocrFromCamera,   
    }: CameraAreaProps){
 
    return(
        <div>
           
            {/* 📷 カメラビュー */}
            {cameraOpen && (
                <div style={{ marginTop: 20 }}>
                  <video ref={videoRef} autoPlay playsInline 
                  style={{ width: 300 }} />
                  <br />
                  <button onClick={takePhoto} 
                  style={{ marginTop: 10 ,background: "#020202ff", color: "#fff", padding: "10px" }}>
                  📸 撮影して OCR
                  </button>
            
                  <button onClick={stopCamera} 
                  style={{ marginLeft: "10px" ,background: "#fc0000ff", color: "#ffffffff", padding: "10px" }}>
                  ■ カメラ停止
                  </button>

                  <canvas ref={canvasRef} 
                  style={{ width: 300, display: "block", marginTop: 20 }} />

                  <canvas    
                  id="outputCanvas"
                  width={300}
                  height={600}
                  style={{ width: 300, display: "block", marginTop: 20, border: "1px solid #ccc" }}
                  ></canvas>

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
    </div>
    );
}