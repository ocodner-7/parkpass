import { GraphQLError } from "graphql";
import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase.server";

export type GraphQLContext = {
  userId: string | null;
  householdId: string | null;
};

/**
 * Runs once per request. Verifies the Supabase access token the browser
 * sends, then looks up which household that user belongs to. Resolvers
 * use this instead of trusting IDs passed in from the client.
 */
export async function createContext(req: NextRequest): Promise<GraphQLContext> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return { userId: null, householdId: null };

  const {
    data: { user },
  } = await supabaseServer.auth.getUser(token);
  if (!user) return { userId: null, householdId: null };

  const { data: membership } = await supabaseServer
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return { userId: user.id, householdId: membership?.household_id ?? null };
}

export function requireUser(ctx: GraphQLContext): string {
  if (!ctx.userId) {
    throw new GraphQLError("You need to sign in.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return ctx.userId;
}

/**
 * Throws unless the signed-in user belongs to the requested household.
 * Returns null for an empty ID, which the hooks send before the household
 * has loaded, so resolvers can return an empty result instead of an error.
 */
export function requireHousehold(
  ctx: GraphQLContext,
  householdId: string,
): string | null {
  requireUser(ctx);
  if (!householdId) return null;
  if (ctx.householdId !== householdId) {
    throw new GraphQLError("You don't have access to this household.", {
      extensions: { code: "FORBIDDEN" },
    });
  }
  return householdId;
} 