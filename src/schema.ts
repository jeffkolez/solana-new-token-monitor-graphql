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

  type TokenPrice {
    price: Float
    total5mVolume: Float
    fdv: Float
    liquidityUsd: Float
    vwap: Float
  }

  type TokenMetadata {
    tokenName: String
    tokenSymbol: String
    tokenUri: String
    tokenDescription: String
    hasFreezeAuthority: Boolean
    hasMintAuthority: Boolean
  }

  input TokenMetadataInput {
    tokenName: String
    tokenSymbol: String
    tokenUri: String
    tokenDescription: String
    hasFreezeAuthority: Boolean
    hasMintAuthority: Boolean
  }

  type Query {
    latestTokens: [Token]
    getTokenMetadata(address: String!): TokenMetadata
    getPriceData(address: String!): TokenPrice
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
