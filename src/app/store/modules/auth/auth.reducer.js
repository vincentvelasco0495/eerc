import { AUTH_RESET, AUTH_FLASH_SET, AUTH_FLASH_CLEAR } from './auth.types';

const initialState = {
  /** Set true after you hydrate session/user into Redux */
  initialized: false,
  flash: null,
};

/**
 * Placeholder slice: app auth today lives in `src/auth/context/*`.
 * Expand this reducer when syncing tokens or user profile into the store.
 */
export function authReducer(state = initialState, action) {
  switch (action.type) {
    case AUTH_RESET:
      return { ...initialState };
    case AUTH_FLASH_SET:
      return { ...state, flash: action.payload };
    case AUTH_FLASH_CLEAR:
      return { ...state, flash: null };
    default:
      return state;
  }
}
