import { getEnvironmentConfig } from '../config/environments';

const env = getEnvironmentConfig();

export const testData = {
  users: {
    valid: {
      username: env.username,
      password: env.password,
    },
    locked: {
      username: env.lockedUsername,
      password: env.password,
    },
    invalidPassword: {
      username: env.username,
      password: env.invalidPassword,
    },
  },
  transfer: {
    validRecipient: 'Alice Ledgercheck_circle',
    blockedRecipient: 'blocked-recipient',
    selfRecipient: env.username,
    minAmount: '1.00',
    maxAmount: '50000.00',
    decimalAmount: '500',
    invalidLowAmount: '0.10',
    invalidHighAmount: '999999.00',
  },
  paymentMethod: {
    cardholderName: 'Flash Guard QA',
    cardNumber: '4111111111111111',
    expiry: '12/30',
    cvv: '123',
  },
};
