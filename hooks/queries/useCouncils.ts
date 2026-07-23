import { gqlClient } from "@/lib/graphql-client";
import { CouncilsResponse } from "@/types/graphql";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-tag";

const GET_COUNCILS = gql`
  query GetCouncils {
    councils {
      id
      name
    }
  }
`;

export const useCouncils = () => {
  return useQuery<CouncilsResponse>({
    queryKey: ["councils"],
    queryFn: () =>
      gqlClient.request<CouncilsResponse>(GET_COUNCILS),
  });
};
