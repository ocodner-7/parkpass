// src/app/api/graphql/route.ts
import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { NextRequest } from 'next/server'
import { typeDefs } from '@/graphql'

const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL!',
  },
}

const server = new ApolloServer({ typeDefs, resolvers })
const handler = startServerAndCreateNextHandler<NextRequest>(server)

export async function GET(request: NextRequest) {
  const response = await handler(request)
  response.headers.set('Access-Control-Allow-Origin', '*')
  return response
}

export async function POST(request: NextRequest) {
  const response = await handler(request)
  response.headers.set('Access-Control-Allow-Origin', '*')
  return response
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}