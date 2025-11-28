export type OCRitem = {
    description: string;
    amount: number | string;
}

export type Result = {
    isReceipt? : boolean;
    isText? : boolean;
    isImagePdf? : boolean;

    total? : string | null;
    tax? : string | null;
    day? : string | null;
    companyName? : string | null;

    items? : OCRitem[]
} 