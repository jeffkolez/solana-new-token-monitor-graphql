export const typeDefs = `#graphql
  scalar Decimal

  type Token {
    address: String
    creator: String
    timestamp: String
    quoteAddress: String
    quoteDecimal: Float
    quoteLpAmount: String
  }

  type Query {
    latestTokens: [Token]
  }

  type Mutation {
    addToken(
      address: String!,
      creator: String!,
      timestamp: String!,
      quoteAddress: String,
      quoteDecimal: Float,
      quoteLpAmount: Float
    ): Token
  }
`;
