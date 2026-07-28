import gql from "graphql-tag";

export const purchaseTypeDefs = gql`
  type Purchase {
    id: ID!
    householdId: ID!
    hoursPurchased: Int!
    createdAt: String!
  }
`;
