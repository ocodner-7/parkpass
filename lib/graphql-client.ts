import { GraphQLClient } from 'graphql-request'

console.log('GraphQL URL:', process.env.NEXT_PUBLIC_APP_URL)

export const gqlClient = new GraphQLClient(
  `${process.env.NEXT_PUBLIC_APP_URL}/api/graphql`
)