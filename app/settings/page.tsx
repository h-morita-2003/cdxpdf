
"use client";

{/*設定ページ*/}

//
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


//設定画面構成

export default function SettingPage(){
    //設定項目を用意
    //useState[項目名,更新するための関数]= useState(初期値)
    //請求金額
    const [seikyuuGaku,SetSeikyuuGaku] = useState<number>(0);
    //会社名
    const [company,SetCompany] = useState("");
    //品目（複数）
    //複数設定できるか？
    const [hinmoku,SetHinmoku] = useState(""); 
    //税率
    const [tax,SetTax] = useState<number>(0);
    //支払日
    const [shiharaibi,SetShiharaibi] = useState("");
    //除外
    const [jogai,SetJogai] = useState("");
    //ルーター（ページ遷移）設定
    const router = useRouter;
    //
    //
    //設定保存ボタンの設定
    const saveSettings = async () => {
        //必須項目が設定されているかの確認
        if ((seikyuuGaku === 0 ) &&
           (company === "" ) &&
           (shiharaibi === "" ) &&
           (jogai === "")){
              console.error("")
           }else{
              //設定保存メソッドを呼び出し
              await fetch("/api/settings",{
                method : "post",
                headers : {"Content-type": "application/json"},
                body : JSON.stringify({seikyuuGaku,company,hinmoku,tax,shiharaibi,jogai}),
              });
            };

    };
    //
    //
    //input画面
    return(
        <div className="p-6">
            <h1 className="text-xl mb-4">設定画面</h1>
            {/*入力*/}
            <h1>請求金額</h1>
            <input
              type = "number"
              placeholder = "請求金額"
              value = {seikyuuGaku}
              onChange = {(e) => SetSeikyuuGaku(Number(e.target.value))}
              className = "border p-2 mb-2 block"
            />
            <h1>会社名</h1>
            <input
              type = "text"
              placeholder = "会社名"
              value = {company}
              onChange = {(e) => SetCompany(e.target.value)}
              className = "border p-2 mb-2 block"
            />
            <h1>品目（,で複数入力可）</h1>
            <input
              type="text"
              placeholder="品目"
              value = {hinmoku}
              onChange = {(e) => SetHinmoku(e.target.value)}
              className = "border p-2 mb-2 block"
            />
            <h1>税率</h1>
            <input
              type = "number"
              placeholder = "税率"
              value = {tax}
              onChange = {(e) => SetTax(Number(e.target.value))}
              className = "border p-2 mb-2 block"
            />
            <h1>支払日</h1>
            <input
              type="text"
              placeholder="支払日"
              value = {shiharaibi}
              onChange = {(e) => SetShiharaibi(e.target.value)}
              className = "border p-2 mb-2 block"
            />
            <h1>除外したい会社名</h1>
            <input
              type="text"
              placeholder="除外"
              value = {jogai}
              onChange = {(e) => SetJogai(e.target.value)}
              className = "border p-2 mb-2 block"
            />

            {/*設定保存ボタン*/}
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
    ) 

}