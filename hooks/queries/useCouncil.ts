import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-tag";
import { gqlClient } from "@/lib/graphql-client";
import { CouncilResponse } from "@/types/graphql";

const GET_COUNCIL = gql`
  query GetCouncil($councilId: ID!) {
    council(councilId: $councilId) {
      id
      name
      monthlyQuotaHours
      hoursRollOver
      pricePerHour
      requiresVehicleReg
      maxHoursPerPass
      availableDurations
      operatingHoursStart
      operatingHoursEnd
    }
  }
`;

export const useCouncil = (councilId: string) => {
  return useQuery<CouncilResponse>({
    queryKey: ["council", councilId],
    queryFn: () => gqlClient.request<CouncilResponse>(GET_COUNCIL, { councilId }),
  });
};
