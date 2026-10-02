// src/app/api/graphql/route.ts
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
import { typeDefs } from "@/graphql";
import { queryResolvers } from "@/graphql/resolvers/query";
import { createContext, type GraphQLContext } from "@/app/api/graphql/context";

const resolvers = {
  Query: queryResolvers,
};

const server = new ApolloServer<GraphQLContext>({ typeDefs, resolvers });

// No CORS headers: the app calls this from its own origin, so other
// websites have no reason to reach it
const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(
  server,
  { context: createContext },
);

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}