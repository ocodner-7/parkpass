import { gqlClient } from "@/lib/graphql-client";
import { VehiclesResponse } from "@/types/graphql";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-tag";

const GET_VEHICLES = gql`
  query GetVehicles($householdId: ID!) {
    vehicles(householdId: $householdId) {
      id
      nickname
      registration
      userId
      householdId
    }
  }
`;

export const useVehicles = (householdId: string) => {
  return useQuery<VehiclesResponse>({
    queryKey: ["vehicles", householdId],
    queryFn: () =>
      gqlClient.request<VehiclesResponse>(GET_VEHICLES, { householdId }),
  });
};
