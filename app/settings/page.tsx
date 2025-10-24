//設定ページ
"use client";

//
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


//設定画面構成

export default function SettingPage(){
    //設定項目
    //請求金額
    const [seikyuuGaku,SetSeikyuuGaku] = useState<number>(0);
    //会社名
    const [company,SetCompany] = useState("");
    //品目（複数）
    //複数設定できるか？
    const [hinmoku,SetHinmoku] = useState(); 
    //税率
    const [tax,SetTax] = useState<number>(0);
    //支払日
    //　　　　　？型どうする？
    const [shiharaibi,SetShiharaibi] = useState<number>(0);
    //除外
    const [jogai,SetJogai] = useState("");
    //ルーター（ページ遷移）設定
    const router = useRouter;
    //
    //
    //設定保存ボタンの設定
    const saveSettings = async () => {
        await fetch("/api/settings",{
            method : "post",
            headers : {"Content-type": "application/json"},
            body : JSON.stringify({seikyuuGaku,company,hinmoku,tax,shiharaibi,jogai}),
        });
    };
    //
    //
    //input画面
    return(
        <div className="p-6">
            <h1 className="text-xl mb-4">設定画面</h1>
            //入力
            <input
              type="text"
              placeholder="支払日"
              value={seikyuuGaku}
              onChange={(e) => SetSeikyuuGaku(Number(e.target.value))}
              className="border p-2 mb-2 block"
            />
            //つづく


            //設定保存ボタン
            //　　？必須項目を入れてないと保存できないようにしたい
            <button
              onClick= {saveSettings}
              className = "bg-blue-500 text-white px-4 py-2 rounded"
            >
            //戻るボタン
            </button>
            <Link
              href = "/"
              className = "bg-gray-500 text-white px-4 py-2 rounded"
            >
                戻る
            </Link>
        </div>
    ) 

}