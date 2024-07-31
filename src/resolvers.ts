import { SolanaTokenMonitor } from './SolanaTokenMonitor';

let latestTokens: {
  address: string;
  creator: string;
  timestamp: string;
  quoteAddress: string;
  quoteDecimal: number;
  quoteLpAmount: number;
  metaData: {
    tokenName: string;
    tokenSymbol: string;
    tokenUri: string;
    tokenDescription: string;
    hasFreezeAuthority: boolean;
    hasMintAuthority: boolean;
  };
}[] = [];

export const resolvers = {
  Query: {
    latestTokens: () => latestTokens,
    getTokenMetadata: async (_: any, { address }: { address: string }) => {
      const solanaMonitor = new SolanaTokenMonitor();
      try {
        const metadata = await solanaMonitor.metaLookup(address);
        return {
          tokenName: metadata.tokenName,
          tokenSymbol: metadata.tokenSymbol,
          tokenUri: metadata.tokenUri,
          tokenDescription: metadata.tokenDescription,
          hasMintAuthority: metadata.hasMintAuthority ? true : false,
          hasFreezeAuthority: metadata.hasFreezeAuthority ? true : false,
        };
      } catch (error) {
        console.error('Error fetching token metadata:', error);
        throw new Error('Unable to fetch token metadata');
      }
    },
    getPriceData: async (_: any, { address }: { address: string }) => {
      const solanaMonitor = new SolanaTokenMonitor();
      try {
        const priceData = await solanaMonitor.fetchPrice(address);
        return {
          price: priceData.price,
          total5mVolume: priceData.total5mVolume,
          fdv: priceData.fdv,
          liquidityUsd: priceData.liquidityUsd,
          vwap: priceData.vwap
        };
      } catch (error) {
        console.error('Error fetching token price data:', error);
        throw new Error('Unable to fetch token price data');
      }
    },
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
        metaData,
      }: {
        address: string;
        creator: string;
        timestamp: string;
        quoteAddress: string;
        quoteDecimal: number;
        quoteLpAmount: number;
        metaData: {
          tokenName: string;
          tokenSymbol: string;
          tokenUri: string;
          tokenDescription: string;
          hasFreezeAuthority: boolean;
          hasMintAuthority: boolean;
        }
      }
    ) => {
      const newToken = {
        address,
        creator,
        timestamp,
        quoteAddress,
        quoteDecimal,
        quoteLpAmount,
        metaData
      };
      latestTokens.push(newToken);
      return newToken;
    },
  },
};
