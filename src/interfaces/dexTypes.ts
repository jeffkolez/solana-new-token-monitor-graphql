export interface Token {
    address: string;
    name: string;
    symbol: string;
  }
  
  export interface Txns {
    m5: {
      buys: number;
      sells: number;
    };
    h1: {
      buys: number;
      sells: number;
    };
    h6: {
      buys: number;
      sells: number;
    };
    h24: {
      buys: number;
      sells: number;
    };
  }
  
  export interface Volume {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  }
  
  export interface PriceChange {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  }
  
  export interface Liquidity {
    usd: number;
    base: number;
    quote: number;
  }
  
  export interface Info {
    imageUrl: string;
    websites: { label: string; url: string }[];
    socials: { type: string; url: string }[];
  }
  
  export interface Pair {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: Token;
    quoteToken: Token;
    priceNative: string;
    priceUsd: string;
    txns: Txns;
    volume: Volume;
    priceChange: PriceChange;
    liquidity: Liquidity;
    fdv: number;
    pairCreatedAt: number;
    info: Info;
  }
  
  export interface Data {
    schemaVersion: string;
    pairs: Pair[];
  }
  