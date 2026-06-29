import gql from "graphql-tag";

export const householdTypeDefs = gql`
  type Household {
    id: ID!
    members: [User!]!
    hoursBalance: Float!
    monthlyQuota: Int!
    quotaUsedThisMonth: Int!
  }
`