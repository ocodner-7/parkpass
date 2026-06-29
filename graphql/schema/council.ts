import gql from "graphql-tag";

export const councilTypeDefs = gql`
  type Council {
    id: ID!
    name: String!
    monthlyQuotaHours: Int!
    hoursRollOver: Boolean!
    pricePerHour: Int!
    requiresVehicleReg: Boolean!
    maxHoursPerPass: Int!
    availableDurations: [Int!]!
    operatingHoursStart: Int
    operatingHoursEnd: Int
  }
`