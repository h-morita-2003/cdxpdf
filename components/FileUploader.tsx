"use client"

import React from "react";
import { useFileHandler } from "hooks/useFileHandler";

type FileUpLoaderProps = {
    File : File | null;
    fileName : string;
    handleFile : (e:any) => void;
    handleDrop : (e:any) => void;
    handleDragOver : (e:any) => void;
    onExecute: () => void;
};

//export default function FileUpLoader({ onSubmit }:FileUpLoaderProps){
export default function FileUpLoader({
           File,
           fileName,
           handleFile,
           handleDrop,
           handleDragOver,
           onExecute,
        }: FileUpLoaderProps) {


    
    return(
        //<form onSubmit={submit}>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
              padding: "100px",
              marginBottom: "50px",
              border: "1px dashed #333333",
              background: "#fafafa",
            }}
          >
            
            <p>↓ここにPDF/pngをドラッグ＆ドロップ</p>
               {/*選択またはドラッグアンドドロップされたファイル名表示* */}
               {fileName && 
                <p style={{ color: "#0070f3",marginTop: "10px"}}>
                  選択中のファイル：{fileName}
                </p>
               }
              <input 
              type="file" name="file" accept="application/pdf, image/png" 
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
               />
            {/*フォーム送信ボタン*/}
            <center>
            <div style={{ marginLeft: "10px" ,
                          background: "#00e1ffff" , 
                          color: "#ffffffff", 
                          padding: "10px", 
                          width:"6%"}}>
            <button type="submit"onClick={onExecute} >実行</button>
            </div>
            </center>
          </div>
        //</form>
    )
}