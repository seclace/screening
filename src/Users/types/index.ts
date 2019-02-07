export interface User {
  id: string,
  account: {
    address1: string,
    address2: string,
    defaultRefundMethodId: string,
    displayName: string,
    email: string,
    dob: number,
    firstName: string,
    passportNo: string,
    residenceCity: string,
    residenceCountry: string,
    surname: string,
  }
  email: string,
  firstName: string,
  name: string,
  surname: string,
  lastActive: number,
  meta: {
    creationTime: number,
    lastSignInTime?: number,
  },
};

export interface Filter {
  value: any,
  condition: firebase.firestore.WhereFilterOp,
};

export type FieldID = 
  | 'firstName'
  | 'surname'
  | 'email'
  | 'phoneNumber'
  | 'account.residenceCountry'
  | 'account.residenceCity'
  | 'lastActive'
  | 'lastActiveStart'
  | 'lastActiveEnd';

export type Fields = {
  firstName: FieldID,
  surname: FieldID,
  email: FieldID,
  phoneNumber: FieldID,
  residenceCountry: FieldID,
  residenceCity: FieldID,
  lastActive: FieldID,
  lastActiveStart: FieldID,
  lastActiveEnd: FieldID,
};

export type Order = {
  ascending: 'asc',
  descending: 'desc',
};

export type OrderBy = [FieldID, Order["descending"] | Order["ascending"]] | [];

export type StartAfter = Array<firebase.firestore.QueryDocumentSnapshot | undefined>
