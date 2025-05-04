import { AuthTokenResponsePassword } from "@supabase/supabase-js";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type authState = {
  event?: {
    id?: string;
    name?: string;
    dateEvent?: string;
    createdAt?: string;
  };
  session?: AuthTokenResponsePassword['data']['session'];
  user?: AuthTokenResponsePassword['data']['user'];
};

type authActions = {
  setAuthState: (state: Partial<authState>) => void;
};

export const useAuthStore = create<authState & authActions>()(
  persist(
    (set, get) => ({
      setAuthState(state) {
        set((prev) => ({
          ...prev,
          ...state,
        }));
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
