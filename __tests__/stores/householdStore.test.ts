import { describe, it, expect, beforeEach } from "vitest";
import { useHouseholdStore } from "@/store/householdStore";
import { Household } from "@/types/graphql";

const mockHousehold: Household = {
  id: "household-1",
  name: "my house",
  members: [
    {
      email: "user-1@email.com",
      firstName: "John",
      lastName: "Doe",
      householdId: "household-1",
      id: "user-1",
      role: "OWNER",
    },
    {
      email: "user-2@email.com",
      firstName: "Jane",
      lastName: "Doe",
      householdId: "household-1",
      id: "user-2",
      role: "MEMBER",
    },
  ],
  hoursBalance: 30,
  monthlyQuota: 50,
  quotaUsedThisMonth: 25,
};

describe("householdStore", () => {
  beforeEach(() => {
    useHouseholdStore.setState({ household: null });
  });

  it("it should initialise with no household", () => {
    const { household } = useHouseholdStore.getState();
    expect(household).toBeNull();
  });

  it("should set a household", () => {
    useHouseholdStore.getState().setHousehold(mockHousehold);
    const { household } = useHouseholdStore.getState();
    expect(household).toEqual(mockHousehold);
  });

  it("should clear household", () => {
    useHouseholdStore.getState().setHousehold(mockHousehold);
    useHouseholdStore.getState().clearHousehold();
    const { household } = useHouseholdStore.getState();
    expect(household).toBeNull();
  })
});
