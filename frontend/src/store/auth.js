import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isHydrated: false,
  setSession: ({ user, accessToken }) =>
    set((state) => {
      const unchanged =
        state.user?.id === user?.id && state.accessToken === accessToken && state.isHydrated;
      if (unchanged) return state;
      return {
        user,
        accessToken,
        isHydrated: true,
      };
    }),
  setAccessToken: (accessToken) =>
    set((state) => {
      if (state.accessToken === accessToken) return state;
      return {
        accessToken,
        isHydrated: state.isHydrated,
      };
    }),
  setUser: (user) =>
    set((state) => {
      if (state.user?.id === user?.id && state.isHydrated) return state;
      return {
        user,
        isHydrated: true,
      };
    }),
  clearSession: () =>
    set((state) => {
      if (!state.user && !state.accessToken && state.isHydrated) return state;
      return { user: null, accessToken: null, isHydrated: true };
    }),
  markHydrated: () =>
    set((state) => {
      if (state.isHydrated) return state;
      return { isHydrated: true };
    }),
}));

export default useAuthStore;
