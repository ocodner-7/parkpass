import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Location } from "@/types/graphql";

interface LocationStore {
  activeLocation: Location | null;
  setActiveLocation: (location: Location) => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      activeLocation: null,
      setActiveLocation: (location) => set({ activeLocation: location }),
    }),
    {
      name: "parkpass-location", // localStorage key
    },
  ),
);
