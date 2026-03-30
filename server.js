require('dotenv').config(); // 1. Must be the very first line
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const bcrypt = require('bcrypt'); // Added for admin password hashing
require('./models/associations'); // Associations initialize karna zaroori hai
const sequelize = require('./config/database');
const User = require('./models/user'); // Admin check karne ke liye import kiya
const { checkAuthStatus } = require('./middlewares/auth');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

// Middleware imports
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const allowCors = require('./middlewares/cors');
const helmetMiddleware = require('./middlewares/helmet');
const { morganLogger, devLogger } = require('./middlewares/morgan');

const app = express();

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const PORT = process.env.PORT || 8080;

// 2. Global Middlewares
app.use(cookieParser());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(express.static(path.join(__dirname, 'public')));
app.use(allowCors);
app.use(helmetMiddleware);
app.use(morganLogger);
app.use(devLogger);
app.use(checkAuthStatus); 

// 3. Apollo Server Initialization
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ 
    req, 
    user: req.user, 
    isLoggedIn: req.isLoggedIn 
  })
});

async function startServer() {
  try {
    // Start Apollo
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, path: '/graphql' });

    // Connect to MySQL
    await sequelize.authenticate();
    console.log('MySQL connected successfully');

    // Sync Models
    await sequelize.sync({ alter: true }); 
    console.log('Models synced');

    // --- DEFAULT ADMIN CREATION LOGIC ---
    const adminExists = await User.findOne({ where: { role: 'admin' } }); //
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10); // Default strong password
      await User.create({
        name: 'System Admin',
        username: 'admin',
        email: 'admin@medlink.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Default admin user created: username: admin, password: Admin@123');
    }
    // ------------------------------------

    // 4. REST Routes
    app.use('/api/users', require('./routes/userRoutes'));
    app.use('/api/doctors', require('./routes/doctorRoutes'));
    app.use('/api/admin', require('./routes/adminRoutes'));
    app.use('/', require('./routes/pageRoutes'));

    // Error Handling
    app.use((req, res) => res.status(404).send('Page Not Found'));
    app.use(errorHandler);

    // 5. Start Listening
    const server = app.listen(PORT, () => {
      console.log(`Server: http://localhost:${PORT}`);
      console.log(`GraphQL: http://localhost:${PORT}/graphql`);
    });

    // Graceful Shutdown
    process.on('SIGINT', async () => {
      await sequelize.close();
      await apolloServer.stop();
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

startServer();