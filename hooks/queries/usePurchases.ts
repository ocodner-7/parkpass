import { gqlClient } from "@/lib/graphql-client";
import { PurchasesResponse } from "@/types/graphql";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-tag";

const GET_PURCHASES = gql`
  query GetPurchases($householdId: ID!) {
    purchases(householdId: $householdId) {
      id
      hoursPurchased
      createdAt
    }
  }
`;

export const usePurchases = (householdId: string) => {
  return useQuery<PurchasesResponse>({
    queryKey: ["purchases", householdId],
    queryFn: () =>
      gqlClient.request<PurchasesResponse>(GET_PURCHASES, { householdId }),
  });
};
