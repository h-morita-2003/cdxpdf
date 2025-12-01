"use client";
import CaneraArea from "components/CameraArea";
import FileUpLoader from "components/FileUploader";
import ResultView from "components/ResultView";
import Link from "next/link";
import { useUpload } from "hooks/useUpload";



export default function Home() {
  const { upLoad, loading, result, setResult} = useUpload();
  
  //const [judgementText, setJudementText] = useState(false);
  //const [judgementImage, setJudementImage] = useState(false);
  //const [judgementreceipt, setJudementreceipt] = useState(false);
  //const [ocrFromCamera, setOcrFromCamera] = useState("");
  //const [stream, setStream] = useState<MediaStream | null>(null);

    //const fileInput = e.currentTarget.querySelector(
   // const formInput = e.currentTarget.querySelector(
   //   "input[type=file]"
   // ) as HTMLInputElement;
   
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
      
        <CaneraArea
          onFile = {(file) => upLoad(file)}
          onOcrText = {(text) => setResult({ raw: text })}
         />
      
        <center>
          <FileUpLoader onSubmit={(file) => upLoad(file)} />
        </center>

         {loading && <p>解析中です…</p>}

         {/*読み込み結果  
         //検出されたら表示する*/}
        <ResultView result={result} />
        
    </div>
  )


}

