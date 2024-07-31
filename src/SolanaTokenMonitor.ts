import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';
import { default as pkg } from '@apollo/client';
const { ApolloClient, InMemoryCache } = pkg;
import { rayFee, solanaConnection } from '../constants';
import { ADD_TOKEN_MUTATION } from './mutations';
import { programs } from '@metaplex/js';
import { TokenData } from './interfaces/tokenData';
import { DexCalculators } from './dexCalculators';

export class SolanaTokenMonitor {
    connection: Connection;
    signature: PublicKey;

    constructor() {
        this.connection = solanaConnection;
        this.signature = rayFee;
    }

    async monitor(): Promise<TokenData | null> {
        console.log(`monitoring new solana tokens...`);
        const client = new ApolloClient({
            uri: process.env.GRAPHQL_SERVER_ENDPOINT,
            cache: new InMemoryCache(),
          });
        try {
            this.connection.onLogs(
                rayFee,
                async ({ logs, err, signature }) => {
                    try {
                        if (err) {
                            console.error(`connection contains error, ${err}`);
                            return;
                        }

                        let signer = '';
                        let baseAddress = '';
                        let baseDecimals = 0;
                        let baseLpAmount = 0;
                        let quoteAddress = '';
                        let quoteDecimals = 0;
                        let quoteLpAmount = 0;

                        const parsedTransaction = await this.connection.getParsedTransaction(
                            signature,
                            {
                                maxSupportedTransactionVersion: 0,
                                commitment: 'confirmed',
                            }
                        );

                        if (parsedTransaction && parsedTransaction?.meta?.err == null) {

                            signer =
                            parsedTransaction?.transaction.message.accountKeys[0].pubkey.toString();

                            const postTokenBalances = parsedTransaction?.meta?.postTokenBalances;

                            const baseInfo = postTokenBalances?.find(
                                (balance) =>
                                    balance.owner ===
                                        '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1' &&
                                        balance.mint !== 'So11111111111111111111111111111111111111112'
                            );

                            if (baseInfo) {
                                baseAddress = baseInfo.mint;
                                baseDecimals = baseInfo.uiTokenAmount.decimals;
                                baseLpAmount = baseInfo.uiTokenAmount.uiAmount ?? 0;
                            }

                            const quoteInfo = postTokenBalances?.find(
                                (balance) =>
                                    balance.owner ==
                                        '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1' &&
                                        balance.mint == 'So11111111111111111111111111111111111111112'
                            );

                            if (quoteInfo) {
                                quoteAddress = quoteInfo.mint;
                                quoteDecimals = quoteInfo.uiTokenAmount.decimals;
                                quoteLpAmount = quoteInfo.uiTokenAmount.uiAmount ?? 0;
                            }

                            console.log(`found new token: ${baseAddress}`);

                            let metadata = await this.metaLookup(baseAddress);

                            if (! metadata.hasFreezeAuthority && ! metadata.hasMintAuthority) {
                                console.log(`We have a valid coin`);
                                const newTokenData = {
                                    address: baseAddress,
                                    creator: signer,
                                    timestamp: new Date().toISOString(),
                                    quoteAddress: quoteAddress,
                                    quoteDecimals: quoteDecimals,
                                    quoteLpAmount: quoteLpAmount,
                                    metaData: metadata
                                };
    
                                await client.mutate({
                                    mutation: ADD_TOKEN_MUTATION,
                                    variables: newTokenData
                                });
                            } else {
                                console.log("Scam coin!");
                            }
                        }
                    } catch (error) {
                        const errorMessage = `error occured in new solana token log callback function, ${JSON.stringify(error, null, 2)}`;
                        console.error(errorMessage);
                        return null;
                    }
                },
                'confirmed'
            );
        } catch (error) {
            const errorMessage = `error occured in new sol lp monitor, ${JSON.stringify(error, null, 2)}`;
            console.error(errorMessage);
            return null;
        }
        return null;
    }

    async fetchPrice(address: string): Promise<any> {
        const url = "https://api.dexscreener.io/latest/dex/tokens/" + address;
        //locked liquidity
        try {
            const response = await fetch(url);
            const data = await response.json();
            const calculators = new DexCalculators(data);

            const total5mVolume = calculators.calculateM5VolumeSum();
            const price = calculators.calculateAveragePriceUsd();
            const fdv = calculators.calculateTotalFdV();
            const liquidityUsd = calculators.calculateTotalLiquidityUsd();
            const vwap = calculators.calculateVWAP();

            return {
                price,
                total5mVolume,
                fdv,
                liquidityUsd,
                vwap
            };
        } catch (error) {
            const errorMessage = `Can't find token, ${address}`;
            console.error(errorMessage);
            return null;
        }
    }

    async metaLookup(address: string): Promise<any> {
        const tokenPublicKey = new PublicKey(address);
        try {
            const tokenAccountInfo = await this.connection.getParsedAccountInfo(tokenPublicKey);
  
            if (!tokenAccountInfo.value) {
                throw new Error('Token account not found');
            }

            const tokenData = tokenAccountInfo.value.data as any;
            const parsedData = tokenData.parsed;
            
            if (!parsedData || !parsedData.info) {
                throw new Error('Token data is not in the expected format');
            }

            const { metadata: { Metadata } } = programs;
            const metadataPDA = await Metadata.getPDA(tokenPublicKey);
            const metadataAccount = await Metadata.load(this.connection, metadataPDA);
            const metadataAccountMeta = metadataAccount.data as any;
            
            const tokenInfo = parsedData.info;
            const hasMintAuthority = tokenInfo.mintAuthority !== null && tokenInfo.mintAuthority !== undefined;
            const hasFreezeAuthority = tokenInfo.freezeAuthority !== null && tokenInfo.freezeAuthority !== undefined;
            const tokenName = metadataAccountMeta.data.name;
            const tokenSymbol = metadataAccountMeta.data.symbol;
            const tokenUri = metadataAccountMeta.data.uri;
            const tokenDescription = await this.getTokenDescription(tokenUri);

            return {
                tokenName,
                tokenSymbol,
                tokenUri,
                tokenDescription,
                hasMintAuthority,
                hasFreezeAuthority,
            };
        } catch (error) {
            const errorMessage = `Can't find token, ${address}`;
            console.error(errorMessage);
            return null;
        }
    }

    async fetchJsonFromUri(uri: string) {
        try {
            const response = await fetch(uri);
            if (!response.ok) {
                return "";
            }
            return await response.json();
        } catch (error) {
            return "";
        }
    }

    async getTokenDescription(uri: string) {
        if (uri === undefined) {
            return "";
        }
        const jsonData = await this.fetchJsonFromUri(uri);
      
        if (jsonData && jsonData.description) {
            return jsonData.description;
        }
        return null;
      }
}