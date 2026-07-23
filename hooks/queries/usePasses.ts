import { gqlClient } from "@/lib/graphql-client";
import { PassesResponse } from "@/types/graphql";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-tag";

const GET_PASSES = gql`
  query Passes($locationId: ID!, $householdId: ID!) {
    passes(locationId: $locationId, householdId: $householdId) {
      id
      status
      startTime
      endTime
      householdId
      registration
    }
  }
`;

export const usePasses = (locationId: string, householdId: string) => {
    return useQuery<PassesResponse>({
        queryKey: ["passes", locationId, householdId],
        queryFn: () => gqlClient.request<PassesResponse>(GET_PASSES, { locationId, householdId })
    });
};
