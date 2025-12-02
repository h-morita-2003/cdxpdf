import { useState,DragEvent } from "react";

export const useFileHandler = () => {
    const [File, setFile] = useState<File | null>(null); 
    const [fileName, setFileName] = useState("");
    

    const handleFile = ( f: File | null) => {
        if (!f) return;

        if (f.type !== "application/pdf" && f.type !== "image/png") {
            alert("ファイルを選択してください");
            return;
            }
        setFile(f); 
        setFileName(f.name); //ファイル名表示更新処理
    };

    // ドラッグアンドドロップ 対応
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        handleFile(f);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    

    //元page内にあった↓はページリロードを防ぐためのものなのでここでは削除
    //const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    //   e.preventDefault();
    return{
        File,
        fileName,
        handleFile,
        handleDrop,
        handleDragOver,
    };
};