
"use client";

{/*設定ページ*/}

//
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


//設定画面構成

export default function SettingPage(){
    //設定項目を用意
    //useState[項目名,更新するための関数]= useState(初期値)

    //請求金額
    //const [seikyuuGaku,SetSeikyuuGaku] = useState<number>(0);
    const [seikyuuGaku,SetSeikyuuGaku] = useState("");
    //会社名
    const [company,SetCompany] = useState("");
    //品目
    const [hinmoku,SetHinmoku] = useState(""); 
    //消費税
    //const [tax,SetTax] = useState<number>(0);
    const [tax,SetTax] = useState("");
    //支払日
    const [shiharaibi,SetShiharaibi] = useState("");
    //除外
    const [jogai,SetJogai] = useState("");

    //
    const [loading,setLoding] = useState(true);
    const [error,setError] = useState< string | null >(null);

    
    //ルーター（ページ遷移）設定
    const router = useRouter();
    //

    //初期表示時にDBから値を取得しstateにセット
    useEffect(() => {
      const fetchSettings = async () => {
        try{
          const res = await fetch("/api/settings");
          //
          if(!res.ok) throw new Error('取得エラー: ${res.status}');
          const settings: { item:string; keywords:string }[] = await res.json();
          //
          //const map = Object.fromEntries(data.map(s => [s.item,s.keywords]));
        
          //setting配列をループして該当するstateをセット
          for (const s of settings){
            switch(s.item){
              case "請求金額":
                SetSeikyuuGaku(s.keywords ?? "");
                break;
              case "会社名":
                SetCompany(s.keywords ?? "");
                break;
              case "品目":
                SetHinmoku(s.keywords ?? "");
                break;
              case "消費税":
                SetTax(s.keywords ?? "");
                break;
              case "支払日":
                SetShiharaibi(s.keywords ?? "");
                break;
              case "除外":
                SetJogai(s.keywords ?? "");
                break;
              default:
                //上記以外
                console.error("設定取得項目エラー", s.item);
            }
          }
          //入力欄が空白に見えないようにするためfalse
          setLoding(false);
        }catch(err: any){
          console.error("設定取得失敗エラー",err);
          setError(String(err.message ?? err));
          setLoding(false);
        }
      };

      fetchSettings();
    },[]
    );

    //
    //設定保存ボタン押下
    const saveSettings = async () => {
      console.log("設定保存ボタン 押下");
        //必須項目が設定されているかの確認
        if ( (seikyuuGaku === "") || 
             (company === "" ) ||
             (shiharaibi === "" ) || 
             (jogai === "")){
              {/*必須項目がないとエラー */}
              console.error("必須項目未入力")
              alert("必須項目を入力してください")
              return;
           }          
           
           try{
            //設定保存メソッドを呼び出し
             const res = await fetch("/api/settings",{
              method : "post",
              headers : {"Content-type": "application/json"},
              body : JSON.stringify({
                items:[
                  { item: "請求金額" , keywords: seikyuuGaku },
                  { item: "会社名" , keywords: company },
                  { item: "品目" , keywords: hinmoku },
                  { item: "消費税" , keywords: tax },
                  { item: "支払日" , keywords: shiharaibi },
                  { item: "除外" , keywords: jogai },
                ],
              }),
            });

            const hozonResult = await res.json();
            console.log("保存結果", hozonResult);
            if(res.ok) {
              alert("保存しました")
            }else{
              throw new Error(hozonResult?.error || "保存に失敗しました")}
           }catch(err:any){
            console.error("設定保存エラー",err);
            alert("保存に失敗しました" + (err.message ?? err))
           }
           
    };
    
    {/*input画面*/}
    return(
        <div className="p-6">
            <h1 className="text-xl mb-4">設定画面</h1>
            {/*入力*/}
            <h1>請求金額／合計金額（必須）</h1>
            <input
              type = "text"
              placeholder = "請求金額／合計金額"
              value = {seikyuuGaku}
              //onChange = {(e) => SetSeikyuuGaku(Number(e.target.value))}
              onChange = {(e) => SetSeikyuuGaku(e.target.value)}
              className = "border p-2 mb-2 block w-4/5"
            />
            <h1>会社名／店舗名（必須）</h1>
            <input
              type = "text"
              placeholder = "会社名／店舗名"
              value = {company}
              onChange = {(e) => SetCompany(e.target.value)}
              className = "border p-2 mb-2 block w-4/5"
            />
            <h1>品目</h1>
            <input
              type="text"
              placeholder="品目"
              value = {hinmoku}
              onChange = {(e) => SetHinmoku(e.target.value)}
              className = "border p-2 mb-2 block w-4/5"
            />
            <h1>消費税</h1>
            <input
              type = "text"
              placeholder = "消費税"
              value = {tax}
              onChange = {(e) => SetTax(e.target.value)}
              className = "border p-2 mb-2 block w-4/5"
            />
            <h1>支払日（必須）</h1>
            <input
              type="text"
              placeholder="支払日"
              value = {shiharaibi}
              onChange = {(e) => SetShiharaibi(e.target.value)}
              className = "border p-2 mb-2 block w-4/5"
            />
            <h1>除外したい会社／店舗名（必須）</h1>
            <input
              type="text"
              placeholder="除外したい会社／店舗名"
              value = {jogai}
              onChange = {(e) => SetJogai(e.target.value)}
              className = "border p-2 mb-2 block w-4/5"
            />

            {/*設定保存ボタン*/}
            <div className="flex gap-8">
            <button
              onClick= {saveSettings}
              className = "bg-blue-500 text-white px-4 py-2 rounded"
            >設定保存
            </button>
            {/*戻るボタン*/}
            <Link
              href = "/"
              className = "bg-gray-500 text-white px-4 py-2 rounded"
            >
              戻る
            </Link>
            </div>
        </div>
    ) 

}