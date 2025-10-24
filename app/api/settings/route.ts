//APIルートを作成
//DBの保存と取得を記述

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

//設定保存
export async function post (req:Request){
    const data = await req.json();

    //
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
}

//設定取得
export async function GET() {
    const settings = await prisma.setting.findMany({
        orderBy : {created:"desc"},
        take : 1, //最新の設定を1件取得
    });
    //
    return NextResponse.json(settings[0] || null);
}