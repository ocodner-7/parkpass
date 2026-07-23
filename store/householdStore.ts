import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Household {
  id: string;
  name: string;
  hoursBalance: number;
  monthlyQuota: number;
  quotaUsedThisMonth: number;
}

interface HouseholdStore {
  household: Household | null;
  setHousehold: (household: Household) => void;
  clearHousehold: () => void;
}

export const useHouseholdStore = create<HouseholdStore>()(
  persist(
    (set) => ({
      household: null,
      setHousehold: (household) => set({ household }),
      clearHousehold: () => set({ household: null }),
    }),
    {
      name: "parkpass-household",
    },
  ),
);
