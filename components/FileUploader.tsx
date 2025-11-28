"use client"

import React from "react";
import { useFileHandler } from "hooks/useFileHandler";

type FileUpLoaderProps = {
    onSubmit : (file: File) => void;
};

export default function FileUpLoader({ onSubmit }:FileUpLoaderProps){
    const {File,
           fileName,
           handleFile,
           handleDrop,
           handleDragOver,} =
        useFileHandler();

    const submit = (e:React.FormEvent) => {
        e.preventDefault();
        if (!File) 
            return alert("ファイルを選択してください");
            onSubmit(File);
    };

    return(
        <form onSubmit={submit}>
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
            <button type="submit">実行</button>
          </div>
        </form>
    )
}