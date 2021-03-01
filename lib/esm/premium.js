import { shouldChargeSms, shouldChargeCall, getPercentageAmount, getBoolIsLocal, checkSMSCdr, checkCallsMtc, checkCallsCdr, groupDataByData } from './shared';
export const premiumCall = (_calls, _commission) => {
    let premiumCallAmount = 0;
    _calls.forEach(call => {
        if (shouldChargeCall(call)) {
            premiumCallAmount += getPercentageAmount(_commission, call.CHARGE_EXCL_VAT);
        }
    });
    return premiumCallAmount;
};
export const premiumSms = (_sms, _commission) => {
    let premiumSmsAmount = 0;
    _sms.forEach(sms => {
        if (shouldChargeSms(sms)) {
            premiumSmsAmount += getPercentageAmount(_commission, sms.CHARGE_EXCL_VAT);
        }
    });
    return premiumSmsAmount;
};
export const premiumOffl = (_offl, _commission) => {
    const regex = new RegExp(/[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm);
    let premiumOfflAmount = 0;
    _offl.forEach(offl => {
        if (offl.OFFL_PARTNER_DESC.substring(0, 3) == "MMS") {
            if (getBoolIsLocal(offl.B_PARTY_NUMBER) === true || (regex.test(offl.B_PARTY_NUMBER) == true)) {
                offl.CHARGE_EXCL_VAT = 0;
                offl.OFFL_CHARGE_EXCL_VAT = 0;
            }
            premiumOfflAmount += getPercentageAmount(_commission, offl.CHARGE_EXCL_VAT);
        }
        else {
            premiumOfflAmount += (offl.OFFL_CHARGE_EXCL_VAT + (offl.OFFL_CHARGE_EXCL_VAT) / 100 * 25);
        }
    });
    return premiumOfflAmount;
};
export const premiumRoaming = (_roaming, _ggsnData, _commission, _limitData) => {
    let totalRoamingAmount = 0;
    let roamingData = [];
    _roaming.forEach(roaming => {
        let cdrCheck = false;
        if (roaming.SUB_RECORD_TYPE === 'SMO') {
            cdrCheck = checkSMSCdr(roaming);
        }
        else if (roaming.SUB_RECORD_TYPE === 'MTC') {
            cdrCheck = checkCallsMtc(roaming);
        }
        else if (roaming.SUB_RECORD_TYPE === 'MOC') {
            cdrCheck = checkCallsCdr(roaming);
        }
        else if (roaming.SUB_RECORD_TYPE === 'GPRS') {
            roamingData.push(roaming);
        }
        if (cdrCheck === false) {
            roaming.CHARGE_EXCL_VAT = 0;
        }
        if (roaming.SUB_RECORD_TYPE !== "GPRS") {
            totalRoamingAmount += getPercentageAmount(_commission, roaming.CHARGE_EXCL_VAT);
        }
    });
    const data = _ggsnData.concat(roamingData);
    totalRoamingAmount += groupDataByData(data, _limitData);
    return totalRoamingAmount;
};
export const counter = (msc, offl, smsc, roaming) => {
    let sms = 0;
    let calls = 0;
    let mms = 0;
    let callsDuration = 0;
    sms += smsc.length;
    calls += msc.length;
    sms += roaming.filter(x => x.SUB_RECORD_TYPE == 'SMO').length;
    calls += roaming.filter(x => x.SUB_RECORD_TYPE == 'MOC' || x.SUB_RECORD_TYPE == 'MTC').length;
    mms += offl.filter(x => x.OFFL_PARTNER_DESC.substring(0, 3) == 'MMS').length;
    msc.forEach(item => {
        callsDuration += Number(item.CALL_DURATION_SEC);
    });
    msc.forEach(item => {
        if (item.SUB_RECORD_TYPE === 'MTC' || item.SUB_RECORD_TYPE === 'MOC')
            callsDuration += Number(item.CALL_DURATION_SEC);
    });
    return {
        sms: sms,
        calls: calls,
        mms: mms,
        duration: callsDuration
    };
};
