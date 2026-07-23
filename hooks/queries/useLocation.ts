import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-tag";
import { gqlClient } from "@/lib/graphql-client";
import { LocationResponse } from "@/types/graphql";

const GET_LOCATION = gql`
  query GetLocation($locationId: ID!) {
    location(locationId: $locationId) {
      id
      councilId
      city
      nickname
      postcode
      householdId
    }
  }
`;

export const useLocation = (locationId: string) => {
  return useQuery<LocationResponse>({
    queryKey: ["location", locationId],
    queryFn: () => gqlClient.request<LocationResponse>(GET_LOCATION, { locationId }),
  });
};
