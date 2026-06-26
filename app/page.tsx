"use client";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { gqlClient } from "@/lib/graphql-client";

const HELLO = gql`
  query {
    hello
  }
`;

export default function TestPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["hello"],
    queryFn: async () => {
      const result = await gqlClient.request(HELLO);
      console.log("raw result:", result);
      return result;
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {JSON.stringify(error)}</p>;
  return <p>{data?.hello}</p>;
}
