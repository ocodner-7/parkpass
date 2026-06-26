import { create } from "zustand";

interface Location {
    id: string;
    address: string;
    postcode: string;
    councilId: string;
};

interface LocationStore {
    activeLocation: Location | null;
    setActiveLocation: (location: Location) => void;
};

export const useLocationStore = create<LocationStore>((set) => ({
    activeLocation: null,
    setActiveLocation: (location) => set({ activeLocation: location })
}));