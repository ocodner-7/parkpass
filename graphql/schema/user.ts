export const userTypeDefs = `
  enum Role {
    OWNER
    MEMBER
  }

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    householdId: ID!
    role: Role!
  }
`