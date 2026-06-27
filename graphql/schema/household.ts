export const householdTypeDefs = `
  type Household {
    id: ID!
    members: [User!]!
    hoursBalance: Float!
    monthlyQuota: Int!
    quotaUsedThisMonth: Int!
  }
`