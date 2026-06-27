export const locationTypeDefs = `
  type Location {
    id: ID!
    nickname: String
    addressLine1: String!
    addressLine2: String
    city: String!
    postcode: String!
    householdId: ID!
    councilId: ID!
  }
`