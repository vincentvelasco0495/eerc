import { AUTH_RESET, AUTH_FLASH_SET, AUTH_FLASH_CLEAR } from './auth.types';

export const authReset = () => ({ type: AUTH_RESET });

/** @param {{ severity: 'success' | 'error'; message: string }} payload */
export const authFlashSet = (payload) => ({ type: AUTH_FLASH_SET, payload });

export const authFlashClear = () => ({ type: AUTH_FLASH_CLEAR });
