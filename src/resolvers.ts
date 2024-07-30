let latestTokens: {
  address: string;
  creator: string;
  timestamp: string;
  quoteAddress: string;
  quoteDecimal: number;
  quoteLpAmount: number;
}[] = [];

export const resolvers = {
  Query: {
    latestTokens: () => latestTokens,
    getTokenByAddress: () => latestTokens.find(token => token.address === address),
  },
  Mutation: {
    addToken: (
      _: any,
      {
        address,
        creator,
        timestamp,
        quoteAddress,
        quoteDecimal,
        quoteLpAmount,
      }: {
        address: string;
        creator: string;
        timestamp: string;
        quoteAddress: string;
        quoteDecimal: number;
        quoteLpAmount: number;
      }
    ) => {
      const newToken = {
        address,
        creator,
        timestamp,
        quoteAddress,
        quoteDecimal,
        quoteLpAmount,
      };
      latestTokens.push(newToken);
      return newToken;
    },
  },
};
