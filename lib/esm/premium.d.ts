export declare const premiumCall: (_calls: Array<any>, _commission: number) => Number;
export declare const premiumSms: (_sms: Array<any>, _commission: number) => Number;
export declare const premiumOffl: (_offl: Array<any>, _commission: number) => Number;
export declare const premiumRoaming: (_roaming: Array<any>, _ggsnData: Array<any>, _commission: number, _limitData: number) => number;
export declare const counter: (msc: Array<any>, offl: Array<any>, smsc: Array<any>, roaming: Array<any>) => any;
