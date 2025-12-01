export type OCRitem = {
    description: string;
    amount: number | string;
}

export type Result = {
    //PDFかレシート判定
    isReceipt? : boolean;
    isText? : boolean;
    isImagePdf? : boolean;

    //各項目
    total? : string | null;
    tax? : string | null;
    day? : string | null;
    companyName? : string | null;
    //明細項目（複数）
    items? : OCRitem[]
} 