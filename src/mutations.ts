import gql from 'graphql-tag';

export const ADD_TOKEN_MUTATION = gql`
  mutation AddToken(
    $address: String!,
    $creator: String!,
    $timestamp: String!,
    $quoteAddress: String,
    $quoteDecimal: Float,
    $quoteLpAmount: Float,
    $metaData: TokenMetadataInput
  ) {
    addToken(
      address: $address,
      creator: $creator,
      timestamp: $timestamp,
      quoteAddress: $quoteAddress,
      quoteDecimal: $quoteDecimal,
      quoteLpAmount: $quoteLpAmount,
      metaData: $metaData
    ) {
      address
      creator
      timestamp
      quoteAddress
      quoteDecimal
      quoteLpAmount
      metaData {
          hasMintAuthority
          hasFreezeAuthority
      }
    }
  }
`;
