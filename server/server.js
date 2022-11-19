const express = require('express');
const path = require('path');

// Import apollo server
const { ApolloServer } = require('apollo-server-express');
// Import typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');
const {authMiddleware} = require('./utils/auth');

// db connection
const db = require('./config/connection');
const routes = require('./routes');

// Express server
const app = express();
const PORT = process.env.PORT || 3001;

// Create apollo server and pass schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});

// Integrate our Apollo server with Express application as middleware
server.applyMiddleware({app});

// Middleware parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.use(routes);

// Get all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

db.once('open', () => {
  app.listen(PORT, () =>  {
    console.log(`🌍 Now listening on localhost:${PORT}`);
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});