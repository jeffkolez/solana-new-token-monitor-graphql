import gql from 'graphql-tag';

export const ADD_TOKEN_MUTATION = gql`
  mutation AddToken(
    $address: String!,
    $creator: String!,
    $timestamp: String!,
    $quoteAddress: String,
    $quoteDecimal: Float,
    $quoteLpAmount: Float
  ) {
    addToken(
      address: $address,
      creator: $creator,
      timestamp: $timestamp,
      quoteAddress: $quoteAddress,
      quoteDecimal: $quoteDecimal,
      quoteLpAmount: $quoteLpAmount
    ) {
      address
      creator
      timestamp
      quoteAddress
      quoteDecimal
      quoteLpAmount
    }
  }
`;
