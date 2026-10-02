import { GraphQLClient } from "graphql-request";
import { supabase } from "@/lib/supabase";

// Attaches the signed-in user's access token to every request, so the
// server can tell who is asking
export const gqlClient = new GraphQLClient(
  `${process.env.NEXT_PUBLIC_APP_URL}/api/graphql`,
  {
    requestMiddleware: async (request) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers = new Headers(request.headers);
      if (session?.access_token) {
        headers.set("Authorization", `Bearer ${session.access_token}`);
      }
      return { ...request, headers };
    },
  },
);