import { describe, it, expect, beforeEach } from "vitest";
import { useLocationStore } from "@/store/locationStore";
import { Location } from "@/types/graphql";

const mockLocation: Location = {
  id: "location-1",
  nickname: "Home",
  addressLine1: "15 Oak Avenue",
  addressLine2: null,
  city: "London",
  postcode: "E5 9RB",
  councilId: "council-1",
  householdId: "household-1",
  isDefault: false,
  activePassCount: 0,
};

describe("locationStore", () => {
  beforeEach(() => {
    useLocationStore.setState({ activeLocation: null });
  });

  it("should initialise with no active location", () => {
    const { activeLocation } = useLocationStore.getState();
    expect(activeLocation).toBeNull();
  });

  it("should set active location", () => {
    useLocationStore.getState().setActiveLocation(mockLocation);
    const { activeLocation } = useLocationStore.getState();
    expect(activeLocation).toEqual(mockLocation);
  });

  it("should clear location", () => {
    useLocationStore.getState().setActiveLocation(mockLocation);
    useLocationStore.getState().clearLocation();
    const { activeLocation } = useLocationStore.getState();
    expect(activeLocation).toBeNull();
  });
});
