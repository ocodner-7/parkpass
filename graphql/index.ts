import { userTypeDefs } from './schema/user'
import { householdTypeDefs } from './schema/household'
import { locationTypeDefs } from './schema/location'
import { councilTypeDefs } from './schema/council'
import { vehicleTypeDefs } from './schema/vehicle'
import { passTypeDefs } from './schema/pass'
import gql from 'graphql-tag'

export const typeDefs = gql`
  ${userTypeDefs}
  ${householdTypeDefs}
  ${locationTypeDefs}
  ${councilTypeDefs}
  ${vehicleTypeDefs}
  ${passTypeDefs}

  type Query {
    hello: String
  }
`