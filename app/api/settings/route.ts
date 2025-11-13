//APIルートを作成
//DBの保存と取得を記述

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

//設定を上書き保存
export async function POST(req:Request){
    try{
      console.log("aaa");
      const data = await req.json();

      //データをDBに上書き保存
      //const saved = await prisma.setting.create({
      for (const row of data.items){
        //
        await prisma.setting.upsert({
            where: {item:row.item},
            update: {keywords:row.keywords},
            create: {item:row.item, keywords:row.keywords},
        })
          }
        // });
    return NextResponse.json( { ok:true });
    //保存エラーの場合出力
    }catch(error){
        console.error("設定保存エラー",error);
        return NextResponse.json({ error: "保存に失敗しました" }, {status: 500});
    }
}

//設定取得
//変える
export async function GET() {
    try{
      //itemとkeywordsのみ取得
      const settings = await prisma.setting.findMany({
        select:{ item: true, keywords: true }
      });
    //      
      return NextResponse.json(settings);  

    //
    //取得エラーの場合出力
    }catch(error){
        console.error("設定取得エラー",error);
        return NextResponse.json({ error: "取得に失敗しました" }, { status: 500});
    }
}