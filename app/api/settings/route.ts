//APIルートを作成
//DBの保存と取得を記述

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

//設定を上書き保存
export async function post (req:Request){
    try{
      const data = await req.json();

      //データをDBに上書き保存
      //const saved = await prisma.setting.create({
      for (const row of data.items){
        //
        await prisma.setting.upsert({
            where: {item:row.item},
            update: {set:row.set},
            create: {item:row.item, set:row.set},
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
      const settings = await prisma.setting.findMany();
    //      orderBy : {created:"desc"},
    //      take : 1, //最新の設定を1件取得
      return NextResponse.json(settings);  
    //
    //取得エラーの場合出力
    }catch(error){
        console.error("設定取得エラー",error);
        return NextResponse.json({ error: "取得に失敗しました" }, { status: 500});
    }
}