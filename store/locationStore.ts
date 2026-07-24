import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Location } from "@/types/graphql";

interface LocationStore {
  activeLocation: Location | null;
  setActiveLocation: (location: Location | null) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      activeLocation: null,
      setActiveLocation: (location) => set({ activeLocation: location }),
      clearLocation: () => set({ activeLocation: null }),
    }),
    {
      name: "parkpass-location",
    },
  ),
);
