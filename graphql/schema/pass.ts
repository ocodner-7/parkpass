import gql from "graphql-tag";

export const passTypeDefs = gql`
  enum PassStatus {
    ACTIVE
    EXPIRED
    CANCELLED
  }

  type Pass {
    id: ID!
    startTime: String!
    endTime: String!
    registration: String!
    locationId: ID!
    householdId: ID!
    issuedBy: ID!
    status: PassStatus!
  }
`