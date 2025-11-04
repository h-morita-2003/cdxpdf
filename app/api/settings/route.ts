//APIルートを作成
//DBの保存と取得を記述

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

//設定保存
export async function post (req:Request){
    try{
      const data = await req.json();

      //データをDBに保存
      const saved = await prisma.setting.create({
          data:{
              seikyuuGaku : data.seikyuuGaku,
              company : data.company,
              hinmoku : data.hinmoku,
              tax : data.tax,
              shiharaibi : data.shiharaibi,
              jogai : data.jogai,
          },
      });
    //保存エラーの場合出力
    return NextResponse.json(saved, { status: 201});
    }catch(error){
        console.error("設定保存エラー",error);
        return NextResponse.json({ error: "保存に失敗しました" }, {status: 500});
    }
}

//設定取得
export async function GET() {
    try{
      const settings = await prisma.setting.findMany({
          orderBy : {created:"desc"},
          take : 1, //最新の設定を1件取得
      });
      
    //
    //取得エラーの場合出力
    return NextResponse.json(settings[0] || null);
    }catch(error){
        console.error("設定取得エラー",error);
        return NextResponse.json({ error: "取得に失敗しました" }, { status: 500});
    }
}