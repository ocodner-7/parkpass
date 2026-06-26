// src/app/api/graphql/route.ts
import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'

const typeDefs = `
  type Query {
    hello: String
  }
`

const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL!',
  },
}

const server = new ApolloServer({ typeDefs, resolvers })
const handler = startServerAndCreateNextHandler(server)

export { handler as GET, handler as POST }