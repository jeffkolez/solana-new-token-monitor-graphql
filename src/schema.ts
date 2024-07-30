export const typeDefs = `#graphql
  scalar Decimal

  type Token {
    address: String
    creator: String
    timestamp: String
    quoteAddress: String
    quoteDecimal: Float
    quoteLpAmount: Float
    metaData: TokenMetadata
  }

  type TokenMetadata {
    hasFreezeAuthority: Boolean
    hasMintAuthority: Boolean
  }

input TokenMetadataInput {
  hasFreezeAuthority: Boolean
  hasMintAuthority: Boolean
}

  type Query {
    latestTokens: [Token]
    getTokenMetadata(address: String!): TokenMetadata
  }

  type Mutation {
    addToken(
      address: String!,
      creator: String,
      timestamp: String,
      quoteAddress: String,
      quoteDecimal: Float,
      quoteLpAmount: Float,
      metaData: TokenMetadataInput
    ): Token
  }
`;
