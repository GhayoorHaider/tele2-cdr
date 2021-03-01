import { shouldChargeCall, getPercentageAmount } from './shared';
export const premiumCall = (_calls, _commission) => {
    let premiumCallAmount = 0;
    _calls.forEach(call => {
        if (shouldChargeCall(call)) {
            premiumCallAmount += getPercentageAmount(_commission, call.CHARGE_EXCL_VAT);
        }
    });
    return premiumCallAmount;
};
