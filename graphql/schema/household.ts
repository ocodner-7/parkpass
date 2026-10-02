import gql from "graphql-tag";

export const householdTypeDefs = gql`
  type Household {
    id: ID!
    name: String!
    members: [User!]!
    hoursBalance: Float!
    monthlyQuota: Int!
    quotaUsedThisMonth: Int!
  }
`;
