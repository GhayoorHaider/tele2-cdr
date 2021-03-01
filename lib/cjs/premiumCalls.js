"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.premiumCall = void 0;
const shared_1 = require("./shared");
const premiumCall = (_calls, _commission) => {
    let premiumCallAmount = 0;
    _calls.forEach(call => {
        if (shared_1.shouldChargeCall(call)) {
            premiumCallAmount += shared_1.getPercentageAmount(_commission, call.CHARGE_EXCL_VAT);
        }
    });
    return premiumCallAmount;
};
exports.premiumCall = premiumCall;
