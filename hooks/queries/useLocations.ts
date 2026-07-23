import { gqlClient } from "@/lib/graphql-client";
import { LocationsResponse } from "@/types/graphql";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-tag";

const GET_LOCATIONS = gql`
  query GetLocations($householdId: ID!) {
    locations(householdId: $householdId) {
      id
      nickname
      addressLine1
      postcode
      councilId
      activePassCount
    }
  }
`;

export const useLocations = (householdId: string) => {
  return useQuery<LocationsResponse>({
    queryKey: ["locations", householdId],
    queryFn: () => gqlClient.request<LocationsResponse>(GET_LOCATIONS, { householdId }),
  });
};

