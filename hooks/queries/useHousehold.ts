import { gqlClient } from "@/lib/graphql-client";
import { HouseholdResponse } from "@/types/graphql";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-tag";

const GET_HOUSEHOLD = gql`
  query Household($householdId: ID!) {
    household(householdId: $householdId) {
      id
      members {
        id
        firstName
        lastName
        email
        role
      }
      monthlyQuota
      quotaUsedThisMonth
      hoursBalance
    }
  }
`;

export const useHousehold = (householdId: string) => {
  return useQuery<HouseholdResponse>({
    queryKey: ["household", householdId],
    queryFn: () =>
      gqlClient.request<HouseholdResponse>(GET_HOUSEHOLD, { householdId }),
  });
};
