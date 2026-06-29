import gql from "graphql-tag";

export const vehicleTypeDefs = gql`
  type Vehicle {
    id: ID!
    nickname: String
    registration: String!
    userId: ID!
    householdId: ID!
  }
`