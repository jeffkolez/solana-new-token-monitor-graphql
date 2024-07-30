import { Connection, PublicKey } from '@solana/web3.js';
import { default as pkg } from '@apollo/client';
const { ApolloClient, InMemoryCache } = pkg;
import { rayFee, solanaConnection } from '../constants';
import { ADD_TOKEN_MUTATION } from './mutations';

interface TokenData {
  address: string;
  creator: string;
  timestamp: string;
  quoteAddress: string;
  quoteDecimals: number;
  quoteLpAmount: number;
}

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
            solanaConnection.onLogs(
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

                            const parsedTransaction = await solanaConnection.getParsedTransaction(
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

                                const newTokenData = {
                                    address: baseAddress,
                                    creator: signer,
                                    timestamp: new Date().toISOString(),
                                    quoteAddress: quoteAddress,
                                    quoteDecimals: quoteDecimals,
                                    quoteLpAmount: quoteLpAmount
                                };

                                await client.mutate({
                                    mutation: ADD_TOKEN_MUTATION,
                                    variables: newTokenData
                                });
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

    async metaLookup(address: string): Promise<any> {
        try {
            const publicKey = new PublicKey(address);
            const tokenAccountInfo = await this.connection.getParsedAccountInfo(publicKey);

            if (tokenAccountInfo.value) {
                const tokenData = tokenAccountInfo.value.data;
                return tokenData;
            } else {
                throw new Error('Token not found');
            }
        } catch (error) {
            console.error('Error fetching token metadata:', error);
            throw error;
        }
    }
}