import { Fields, Order } from './types';

export const RANGED_PREFIX = 'ranged__';

export const PER_PAGE: number = 10;

export const WAIT_BEFORE_APPLY: number = 300;

export const ORDER: Order = {
  ascending: 'asc',
  descending: 'desc',
}

export const FIELDS: Fields = {
  firstName: 'firstName',
  surname: 'surname',
  email: 'email',
  phoneNumber: 'phoneNumber',
  residenceCountry: 'account.residenceCountry',
  residenceCity: 'account.residenceCity',
  lastActive: 'lastActive',
  lastActiveStart: 'lastActiveStart',
  lastActiveEnd: 'lastActiveEnd',
}
