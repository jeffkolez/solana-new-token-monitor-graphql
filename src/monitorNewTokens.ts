import { default as pkg } from '@apollo/client'
const { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink, gql } = pkg
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone'
import { resolvers } from './resolvers'; 
import { typeDefs } from './schema';
import { SolanaTokenMonitor } from './SolanaTokenMonitor';

async function monitorNewTokens() {
  const solanaMonitor = new SolanaTokenMonitor();
  await solanaMonitor.monitor();
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});


console.log(`🚀  Server ready at: ${url}`);

monitorNewTokens();