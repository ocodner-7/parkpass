import { userTypeDefs } from "./schema/user";
import { householdTypeDefs } from "./schema/household";
import { locationTypeDefs } from "./schema/location";
import { councilTypeDefs } from "./schema/council";
import { vehicleTypeDefs } from "./schema/vehicle";
import { passTypeDefs } from "./schema/pass";
import { mergeTypeDefs } from "@graphql-tools/merge";
import gql from "graphql-tag";
import { purchaseTypeDefs } from "./schema/purchase";

const queryTypeDefs = gql`
  type Query {
    locations(householdId: ID!): [Location!]!
    location(locationId: ID!): Location
    activePasses(locationId: ID!, householdId: ID!): [Pass!]!
    household(householdId: ID!): Household!
    vehicles(householdId: ID!): [Vehicle!]!
    councils: [Council!]!
    council(councilId: ID!): Council
    passes(locationId: ID!, householdId: ID!): [Pass!]!
    purchases(householdId: ID!): [Purchase!]!
  }
`;

export const typeDefs = mergeTypeDefs([
  userTypeDefs,
  householdTypeDefs,
  locationTypeDefs,
  councilTypeDefs,
  vehicleTypeDefs,
  passTypeDefs,
  purchaseTypeDefs,
  queryTypeDefs,
]);
