# TELE2 Call Directory Records Billing
## Module to calculate premium for tele2 call directory records.

![N|Solid](https://d4gi78dehuzrk.cloudfront.net/production/v1.15/assets/web/icons/icon-114x114.png)

![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)

#### Tele2 Cdr is a module used to calculate premium usage of users based on Call directory records of users based on Sweden Telecommunication network.

### All these modules lie under billing model and will be accessed like this.
##### tele2cdr.billing.premiumCall

## Modules currently supported

### premiumCall

- Module will take cdrs and commission as an input 
- It will verify which cdrs should be charged and commission and VAT should be added.
- It will look out for local numbers, emergency numbers amd katshing support numbers.

### premiumSms

- Module will take cdrs and commission as an input 
- It will verify which cdrs should be charged and commission and VAT should be added.
- It will look out for local numbers, emergency numbers amd katshing support numbers.

### premiumOffl

- Module will take cdrs and commission as an input 
- It will filter out mms and content services.
- All content services will be charged and only international mms will be charged.

### premiumRoaming

- Module will take data and roaming cdrs and commission as a parameter 
- It will filter each kind of cdrs ( SMO, MTC, MOC, GPRS ).
- GPRS data will be first calculated and will be charged if data exceedes from the allowed usage. 

### counter

- Module will take cdrs as a parameter
- It will return the count of sms, mms, calls and calls duration

### Scripts
```
npm run start : To build the app
```
#### Suggestions are always appreciated
#### Contact : ghayoornaqvi@outlook.com
## License

MIT

**Free Software, Hell Yeah!**
