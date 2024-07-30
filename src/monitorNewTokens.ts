import { default as pkg } from '@apollo/client'
const { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink, gql } = pkg
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone'
import { rayFee, solanaConnection } from '../constants';
import chalk from 'chalk';
import { resolvers } from './resolvers'; 
import { typeDefs } from './schema';
import { ADD_TOKEN_MUTATION } from './mutations';

async function monitorNewTokens() {
  console.log(chalk.green(`monitoring new solana tokens...`));
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
            console.log(chalk.green(`found new token: ${baseAddress}`));

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
          console.log(chalk.red(errorMessage));
        }
      },
      'confirmed'
    );
  } catch (error) {
    const errorMessage = `error occured in new sol lp monitor, ${JSON.stringify(error, null, 2)}`;
    console.log(chalk.red(errorMessage));
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

const client = new ApolloClient({
  uri: url,
  cache: new InMemoryCache(),
});

console.log(`🚀  Server ready at: ${url}`);

monitorNewTokens();