export declare const shouldChargeCall: (callRecord: any) => boolean;
export declare const shouldChargeSms: (smsRecord: any) => boolean;
export declare const getBoolIsLocal: (reciever: string) => boolean;
export declare const getPercentageAmount: (commission: number, amount: number) => number;
export declare const checkSMSCdr: (stats: any) => boolean;
export declare const checkCallsCdr: (stats: any) => boolean;
export declare const checkCallsMtc: (stats: any) => boolean;
export declare const groupDataByData: (roamingData: Array<any>, limitData: number) => number;
