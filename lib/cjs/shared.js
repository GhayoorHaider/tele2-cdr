"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupDataByData = exports.checkCallsMtc = exports.checkCallsCdr = exports.checkSMSCdr = exports.getPercentageAmount = exports.getBoolIsLocal = exports.shouldChargeSms = exports.shouldChargeCall = void 0;
const constants_1 = require("./constants");
const shouldChargeCall = (callRecord) => {
    if (callRecord.B_PARTY_NUMBER.startsWith('00') &&
        !callRecord.B_PARTY_NUMBER.startsWith('0046')) {
        return true;
    }
    else if ((!callRecord.B_PARTY_NUMBER.startsWith('46') &&
        !callRecord.B_PARTY_NUMBER.startsWith('0046'))) {
        if (!isCallNumber(callRecord.B_PARTY_NUMBER)) {
            return callRecord.B_PARTY_NUMBER.length > 10;
        }
        return !isEmergencyNumber(callRecord.B_PARTY_NUMBER);
    }
    else {
        return false;
    }
};
exports.shouldChargeCall = shouldChargeCall;
const shouldChargeSms = (smsRecord) => {
    if ((!smsRecord.B_PARTY_NUMBER.startsWith('46') &&
        !smsRecord.B_PARTY_NUMBER.startsWith('0046')) &&
        isSmsNumber(smsRecord.B_PARTY_NUMBER))
        return true;
    return false;
};
exports.shouldChargeSms = shouldChargeSms;
const isCallNumber = (number) => {
    let a = constants_1.callNumbers.find((x) => { return number.substring(0, 2) == x || number.substring(0, 3) == x || number.substring(0, 4) == x || number.substring(0, 5) == x; });
    if (typeof a === 'undefined')
        return false;
    else
        return true;
};
const isSmsNumber = (number) => {
    let startingValue = subStringValue(number);
    let a = constants_1.smsNumbers.find(x => number.substring(startingValue, 2) === x || number.substring(startingValue, 3) === x || number.substring(startingValue, 4) === x || number.substring(startingValue, 5) === x);
    return typeof a === 'undefined';
};
const isEmergencyNumber = (number) => {
    let startingValue = subStringValue(number);
    let a = constants_1.emergencyNumbers.find(x => number.substring(startingValue, 2) === x || number.substring(startingValue, 3) === x || number.substring(startingValue, 4) === x || number.substring(startingValue, 5) === x);
    return typeof a === 'undefined';
};
const getBoolIsLocal = (reciever) => {
    return typeof reciever !== 'undefined' && ("46" == reciever.substring(0, 2) || "0046" == reciever.substring(0, 4) || ("0" == reciever.substring(0, 1) && parseInt(reciever.substring(1, 2)) > 0));
};
exports.getBoolIsLocal = getBoolIsLocal;
const subStringValue = (number) => {
    if (number.startsWith('46'))
        return 2;
    else if (number.startsWith('0046'))
        return 4;
    return 0;
};
const getPercentageAmount = (commission, amount) => {
    let percentageAmount = 0;
    let newAmount = (amount * 0.25) + amount;
    if (commission > 0) {
        percentageAmount = newAmount * (commission / 100);
    }
    return percentageAmount + newAmount;
};
exports.getPercentageAmount = getPercentageAmount;
const checkSMSCdr = (stats) => {
    return exports.getBoolIsLocal(stats.B_PARTY_NUMBER_NORM);
};
exports.checkSMSCdr = checkSMSCdr;
const checkCallsCdr = (stats) => {
    if (exports.getBoolIsLocal(stats.B_PARTY_NUMBER_NORM) == true && checkCdrOrigin(stats) == false) {
        return true;
    }
    else if (checkCdrOrigin(stats) == true && exports.getBoolIsLocal(stats.B_PARTY_NUMBER_NORM) == false && getIsEuropeanNumber(stats.B_PARTY_NUMBER_NORM) == false) {
        return true;
    }
    return false;
};
exports.checkCallsCdr = checkCallsCdr;
const checkCallsMtc = (stats) => {
    return checkCdrOrigin(stats);
};
exports.checkCallsMtc = checkCallsMtc;
const checkCdrOrigin = (stats) => {
    return constants_1.europeCodes.includes(stats.PLMN_SENDER);
};
const getIsEuropeanNumber = (receiver) => {
    return typeof receiver !== 'undefined' && constants_1.europeCountryCodes.includes(receiver.substring(0, 2));
};
const groupDataByData = (roamingData, limitData) => {
    let totalAmount = 0;
    let totalIntGGSN = 0;
    limitData = limitData * constants_1.bytesToGb;
    const group = roamingData.reduce((r, a) => {
        r[a.CALL_DATE] = [...(r[a.CALL_DATE] || []), a];
        return r;
    }, {});
    Object.keys(group).forEach((key) => {
        let items = group[key];
        if (items && items.length) {
            items.forEach(item => {
                let isEuropenData = item.type == 'GGSN' ? constants_1.europeCodes.includes(item.NODE_ID) : constants_1.europeCodes.includes(item.PLMN_SENDER);
                let dataExceed = totalIntGGSN > limitData;
                if (isEuropenData == true && dataExceed == false) {
                    item.CHARGE_EXCL_VAT = 0;
                    item.amount = 0;
                }
                else {
                    /** Adding commission and VAT in charge */
                    item.amount = exports.getPercentageAmount(10, item.CHARGE_EXCL_VAT);
                }
                item.totalVolume = item.CALL_TOTAL_VOLUME;
                totalIntGGSN += item.totalVolume;
                /** Adding total data premium amount */
                totalAmount += item.amount;
            });
        }
    });
    return totalAmount;
};
exports.groupDataByData = groupDataByData;
