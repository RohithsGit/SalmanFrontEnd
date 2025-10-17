import { configureStore, createSlice } from '@reduxjs/toolkit';

const initialAuthState = {
  user: null,
  isLoading: false,
  error: null,
  success: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
      state.success = null;
    },
    loginSuccess(state, action) {
      state.isLoading = false;
      state.user = action.payload.user;
      state.success = action.payload.message;
      state.error = null;
    },
    loginFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
      state.success = null;
      state.user = null;
    },
    resetAuthState(state) {
      state.isLoading = false;
      state.error = null;
      state.success = null;
      state.user = null;
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, resetAuthState } = authSlice.actions;

export const urlPrefix = "https://localhost:7012/api/Salman/"; // update as needed
export const urlPrefixLive=""//for live (Internet)
const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  }
});

export default store;