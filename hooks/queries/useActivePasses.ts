import { gqlClient } from "@/lib/graphql-client";
import { ActivePassesResponse } from "@/types/graphql";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-tag";

const GET_ACTIVE_PASSES = gql`
  query ActivePasses($locationId: ID!, $householdId: ID!) {
    activePasses(locationId: $locationId, householdId: $householdId) {
      id
      status
      startTime
      endTime
      householdId
      registration
    }
  }
`;

export const useActivePasses = (locationId: string, householdId: string) => {
    return useQuery<ActivePassesResponse>({
        queryKey: ["active-passes", locationId, householdId],
        queryFn: () => gqlClient.request<ActivePassesResponse>(GET_ACTIVE_PASSES, { locationId, householdId })
    });
};
