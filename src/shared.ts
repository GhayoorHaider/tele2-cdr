import { callNumbers, smsNumbers, emergencyNumbers, europeCodes, europeCountryCodes, bytesToGb } from './constants'

export const shouldChargeCall = (callRecord: any): boolean => {
  if (callRecord.B_PARTY_NUMBER.startsWith('00') &&
    !callRecord.B_PARTY_NUMBER.startsWith('0046')) {
    return true;
  }
  else if (
    (!callRecord.B_PARTY_NUMBER.startsWith('46') &&
      !callRecord.B_PARTY_NUMBER.startsWith('0046'))
  ) {
    // if (!isCallNumber(callRecord.B_PARTY_NUMBER)) {
    //   return callRecord.B_PARTY_NUMBER.length > 10;
    // }
    // return !isEmergencyNumber(callRecord.B_PARTY_NUMBER);
    if ( !isCallNumber( callRecord.B_PARTY_NUMBER ) ) {
      if ( callRecord.B_PARTY_NUMBER.length > 10 && !callRecord.B_PARTY_NUMBER.startsWith( '07' )){
        return true;
      }
      return false;
    } else if ( isEmergencyNumber( callRecord.B_PARTY_NUMBER ) ) {
      return false;
    }
    else {
      return true;
    }
  }
  else {
    return false;
  }
}

export const shouldChargeSms = (smsRecord: any): boolean => {
  if (
    (!smsRecord.B_PARTY_NUMBER.startsWith('46') &&
      !smsRecord.B_PARTY_NUMBER.startsWith('0046')) &&
    isSmsNumber(smsRecord.B_PARTY_NUMBER)
  ) return true;
  return false;
}

const isCallNumber = (number: string): boolean => {
  let a = callNumbers.find((x) => { return number.substring(0, 2) == x || number.substring(0, 3) == x || number.substring(0, 4) == x || number.substring(0, 5) == x });
  if (typeof a === 'undefined') return false;
  else return true;
}

const isSmsNumber = (number: string): boolean => {
  let startingValue: number = subStringValue(number)

  let a = smsNumbers.find(x => number.substring(startingValue, 2) === x || number.substring(startingValue, 3) === x || number.substring(startingValue, 4) === x || number.substring(startingValue, 5) === x);
  return typeof a === 'undefined' ? false : true
}

const isEmergencyNumber = (number: string): boolean => {
  let startingValue: number = subStringValue(number)

  let a = emergencyNumbers.find(x => number.substring(startingValue, 2) === x || number.substring(startingValue, 3) === x || number.substring(startingValue, 4) === x || number.substring(startingValue, 5) === x);
  return typeof a === 'undefined' ? false : true
}


export const getBoolIsLocal = (reciever: string): boolean => {
  return typeof reciever !== 'undefined' && ("46" == reciever.substring(0, 2) || "0046" == reciever.substring(0, 4) || ("0" == reciever.substring(0, 1) && parseInt(reciever.substring(1, 2)) > 0))
}

const subStringValue = (number: string) => {
  if (number.startsWith('46')) return 2;
  else if (number.startsWith('0046')) return 4;
  return 0
}

export const getPercentageAmount = (commission: number, amount: number): number => {
  let percentageAmount: number = 0;
  let newAmount: number = (amount * 0.25) + amount;
  if (commission > 0) {
    percentageAmount = newAmount * (commission / 100);
  }
  return percentageAmount + newAmount;
}

export const checkSMSCdr = (stats: any): boolean => {
  return getBoolIsLocal(stats.B_PARTY_NUMBER_NORM)
}

export const checkCallsCdr = (stats: any): boolean => {
  if (getBoolIsLocal(stats.B_PARTY_NUMBER_NORM) == true && checkCdrOrigin(stats) == false) {
    return true;
  } else if (checkCdrOrigin(stats) == true && getBoolIsLocal(stats.B_PARTY_NUMBER_NORM) == false && getIsEuropeanNumber(stats.B_PARTY_NUMBER_NORM) == false) {
    return true;
  }
  return false;
}

export const checkCallsMtc = (stats: any) => {
  return checkCdrOrigin(stats);
}

const checkCdrOrigin = (stats: any): boolean => {
  return europeCodes.includes(stats.PLMN_SENDER)
}

const getIsEuropeanNumber = (receiver: string) => {
  return typeof receiver !== 'undefined' && europeCountryCodes.includes(receiver.substring(0, 2))
}

export const groupDataByData = (roamingData: Array<any>, limitData: number): number => {
  let totalAmount = 0;
  let totalIntGGSN = 0;
  limitData = limitData * bytesToGb
  const group = roamingData.reduce((r, a) => {
    r[a.CALL_DATE] = [...(r[a.CALL_DATE] || []), a];
    return r;
  }, {});
  Object.keys(group).forEach((key) => {
    let items: Array<any> = group[key];
    if (items && items.length) {
      items.forEach(item => {
        let isEuropenData: boolean = item.type == 'GGSN' ? europeCodes.includes(item.NODE_ID) : europeCodes.includes(item.PLMN_SENDER);
        let dataExceed: boolean = totalIntGGSN > limitData;
        if (isEuropenData == true && dataExceed == false) {
          item.CHARGE_EXCL_VAT = 0;
          item.amount = 0;
        } else {
          /** Adding commission and VAT in charge */
          item.amount = getPercentageAmount(10, item.CHARGE_EXCL_VAT);
        }
        item.totalVolume = item.CALL_TOTAL_VOLUME;
        totalIntGGSN += item.totalVolume;
        /** Adding total data premium amount */
        totalAmount += item.amount;
      });
    }
  });
  return totalAmount;
}